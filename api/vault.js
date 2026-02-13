const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { app, clipboard } = require("electron");
const isDev = require("electron-is-dev");
const { sanitizeEntry } = require("./sanitize");
const vaultEvents = require("./events");
const { atomicWrite } = require("./helpers");
const semver = require("semver");
const { ERRORS } = require("../src/utils/error");
const {
  aesDecrypt,
  aesEncrypt,
  scryptKey,
  SCRYPT_PARAMS,
} = require("./crypto");

const DB_PATH = isDev ? "desktop" : "userData";
const VAULT_DIR = path.join(app.getPath(DB_PATH), "encryptoor");
const VAULT_PATH = path.join(VAULT_DIR, "vault.json");
const META_PATH = path.join(VAULT_DIR, "vault.meta.json");

const MAGIC = "ENCRYPTOOR";
const MAX_ATTEMPTS = 3;
const COOLDOWN = isDev ? 10_000 : 15 * 60 * 1000;
const CURRENT_SCHEMA_VERSION = 1;

let session = null;
let clipboardTimer = null;
let clipboardDecoyTimer = null;

/**
 * Restore Backup
 * @param {*} index
 */
function restoreBackup(index = 1) {
  const backup = `${VAULT_PATH}.bak${index}`;

  try {
    const data = fs.readFileSync(backup, "utf-8");

    const vault = JSON.parse(data);

    validateVault(vault);

    atomicWrite(VAULT_PATH, data);

    return vault;
  } catch (err) {
    return null;
  }
}

/**
 * Read and return the vault
 */
function readVault() {
  // if Encryptoor path is not initialized or not exists
  // we do not need to check for existing backups.
  if (!fs.existsSync(VAULT_DIR)) {
    throw new Error(ERRORS.NOT_INITIALIZED);
  }

  try {
    const vault = JSON.parse(fs.readFileSync(VAULT_PATH, "utf8"));

    validateVault(vault);

    return vault;
  } catch (err) {
    for (let i = 1; i <= 3; i++) {
      const vault = restoreBackup(i);

      if (!vault) continue;

      return vault;
    }
    throw err;
  }
}

/**
 * Check if any vault exists
 */
function init() {
  const platform = process.platform;

  try {
    readVault();
    return { isInit: true, platform };
  } catch (err) {
    return { isInit: false, platform };
  }
}

/**
 *
 * @param {*} masterPassword
 * @param {*} data
 * @returns
 */
function createVault(masterPassword, data = []) {
  try {
    const salt = crypto.randomBytes(16);
    const kek = scryptKey(masterPassword, salt);

    const vaultKey = crypto.randomBytes(32);

    const wrapped = aesEncrypt(kek, vaultKey);

    const encryptedData = aesEncrypt(
      vaultKey,
      Buffer.from(JSON.stringify(data)),
    );

    const vault = {
      magic: MAGIC,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      appVersion: app.getVersion(),
      header: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        kdf: {
          name: "scrypt",
          params: SCRYPT_PARAMS,
          salt: salt.toString("base64"),
        },
        crypto: { cipher: "aes-256-gcm" },
      },
      protected: {
        encryptedVaultKey: wrapped.encrypted.toString("base64"),
        vaultKeyIv: wrapped.iv.toString("base64"),
        vaultKeyTag: wrapped.tag.toString("base64"),
      },
      data: {
        encrypted: encryptedData.encrypted.toString("base64"),
        iv: encryptedData.iv.toString("base64"),
        authTag: encryptedData.tag.toString("base64"),
      },
    };

    const meta = {
      failedUnlocks: 0,
      lockUntil: 0,
    };

    fs.mkdirSync(VAULT_DIR, { recursive: true, mode: 0o700 });

    atomicWrite(VAULT_PATH, JSON.stringify(vault, null, 2));
    atomicWrite(META_PATH, JSON.stringify(meta, null, 2), "meta");

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 *
 */
function validateMeta() {
  try {
    const meta = JSON.parse(fs.readFileSync(META_PATH, "utf8"));

    if (
      !meta.hasOwnProperty("failedUnlocks") ||
      !meta.hasOwnProperty("lockUntil")
    ) {
      throw new Error("INAVLID_META");
    }

    if (
      typeof meta.failedUnlocks !== "number" ||
      typeof meta.lockUntil !== "number"
    ) {
      throw new Error("INAVLID_META");
    }

    return meta;
  } catch (err) {
    // likely meta tampered, => penlaty
    const meta = {
      failedUnlocks: MAX_ATTEMPTS,
      lockUntil: Date.now() + COOLDOWN,
    };

    atomicWrite(META_PATH, JSON.stringify(meta, null, 2), "meta");

    return meta;
  }
}

/**
 *
 * @param {*} meta
 */
function checkPasswordCooldown(meta) {
  const current = Date.now();

  if (meta.lockUntil > current) {
    const remainingSeconds = Math.ceil((meta.lockUntil - current) / 1000);

    let timeAppendix = "";

    if (remainingSeconds <= 1) {
      timeAppendix = "second";
    } else if (remainingSeconds < 60) {
      timeAppendix = "seconds";
    } else {
      timeAppendix = "minutes";
    }

    let remainingForText =
      timeAppendix === "minutes"
        ? Math.ceil(remainingSeconds / 60)
        : remainingSeconds;

    throw new Error(
      `Please wait ${remainingForText} ${timeAppendix} then retry`,
    );
  }

  if (meta.lockUntil < current && meta.failedUnlocks >= MAX_ATTEMPTS) {
    meta.failedUnlocks = 0;
    meta.lockUntil = 0;

    atomicWrite(META_PATH, JSON.stringify(meta, null, 2), "meta");
  }
}

/**
 *
 * @param {*} meta
 */
function handleWrongPassword(meta) {
  meta.failedUnlocks++;

  if (meta.failedUnlocks >= MAX_ATTEMPTS) {
    meta.lockUntil = Date.now() + COOLDOWN; // 15min
    destroySession("Max attempts");
  }

  atomicWrite(META_PATH, JSON.stringify(meta, null, 2), "meta");

  throw new Error(
    `${ERRORS.WRONG_PASSWORD} ${meta.failedUnlocks >= MAX_ATTEMPTS ? "Please wait 15 minutes." : `Remaining attempts: ${MAX_ATTEMPTS - meta.failedUnlocks}`}`,
  );
}

/**
 *
 * @param {*} meta
 */
function resetPasswordCooldown(meta) {
  meta.failedUnlocks = 0;
  meta.lockUntil = 0;

  atomicWrite(META_PATH, JSON.stringify(meta, null, 2), "meta");
}
/**
 *
 * @param {*} masterPassword
 * @returns
 */
function unlockVault(masterPassword, ownerWebContentsId) {
  try {
    const meta = validateMeta();

    checkPasswordCooldown(meta);

    const vault = readVault();

    const salt = Buffer.from(vault.header.kdf.salt, "base64");
    const kek = scryptKey(masterPassword, salt);

    let vaultKey;

    try {
      vaultKey = aesDecrypt(
        kek,
        Buffer.from(vault.protected.vaultKeyIv, "base64"),
        Buffer.from(vault.protected.vaultKeyTag, "base64"),
        Buffer.from(vault.protected.encryptedVaultKey, "base64"),
      );
    } catch (err) {
      if (
        err.message.includes("authenticate") ||
        err.message.includes("auth")
      ) {
        handleWrongPassword(meta);
      }

      throw err;
    }

    // reset meta after correct password
    resetPasswordCooldown(meta);

    const data = JSON.parse(
      aesDecrypt(
        vaultKey,
        Buffer.from(vault.data.iv, "base64"),
        Buffer.from(vault.data.authTag, "base64"),
        Buffer.from(vault.data.encrypted, "base64"),
      ).toString("utf8"),
    );

    createSession(vaultKey, data, ownerWebContentsId);

    return { success: true, data: secureData(data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 *
 * @param {*} ownerWebContentsId
 */
function requireSession(ownerWebContentsId) {
  if (
    !session ||
    !session.ownerWebContentsId ||
    session.ownerWebContentsId !== ownerWebContentsId
  ) {
    throw new Error(ERRORS.UNAUTHORIZED);
  }

  clearTimeout(session.timer);

  session.timer = setTimeout(() => {
    destroySession("timeout");
  }, session.timeout);
}

/**
 * Safely clear the session, zeroing the memory and lock the UI.
 */
function destroySession(reason) {
  if (!session) return;

  clearTimeout(session.timer);

  wipeSession();

  vaultEvents.emit("vault:locked", { reason });
}

/**
 *
 * @param {string} ownerWebContentsId
 * @param {string} itemId
 * @returns
 */
function removeItem(ownerWebContentsId, itemId) {
  try {
    requireSession(ownerWebContentsId);

    const currentData = structuredClone(session.data);

    session.data = currentData.filter((item) => item.id !== itemId);

    const encrypted = aesEncrypt(
      session.vaultKey,
      Buffer.from(JSON.stringify(session.data)),
    );

    const vault = readVault();

    vault.data = {
      encrypted: encrypted.encrypted.toString("base64"),
      iv: encrypted.iv.toString("base64"),
      authTag: encrypted.tag.toString("base64"),
    };

    vault.header.updatedAt = Date.now();

    writeVault(VAULT_PATH, JSON.stringify(vault, null, 2));

    return { success: true, data: secureData(session.data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function exportVault(
  ownerWebContentsId,
  useOldPass,
  currentPass,
  newPass = "",
) {
  try {
    requireSession(ownerWebContentsId);

    if (!currentPass) {
      throw new Error("You need to type the vault pass.");
    }

    const meta = validateMeta();

    checkPasswordCooldown(meta);

    const vault = readVault();

    try {
      const salt = Buffer.from(vault.header.kdf.salt, "base64");
      const kek = scryptKey(currentPass, salt);

      aesDecrypt(
        kek,
        Buffer.from(vault.protected.vaultKeyIv, "base64"),
        Buffer.from(vault.protected.vaultKeyTag, "base64"),
        Buffer.from(vault.protected.encryptedVaultKey, "base64"),
      );
    } catch (err) {
      if (
        err.message.includes("authenticate") ||
        err.message.includes("auth")
      ) {
        handleWrongPassword(meta);
      }

      throw err;
    }

    resetPasswordCooldown(meta);

    const current = new Date();
    const dateTime = current.toISOString().slice(0, -5).split("T");
    const date = dateTime[0];
    const time = dateTime[1].split(":").join("-");
    const filename = `vault_backup_${date}_${time}.json`;

    const EXPORT_PATH = path.join(app.getPath("desktop"), filename);

    if (useOldPass === true && newPass.length === 0) {
      const encrypted = aesEncrypt(
        session.vaultKey,
        Buffer.from(JSON.stringify(session.data)),
      );

      vault.data = {
        encrypted: encrypted.encrypted.toString("base64"),
        iv: encrypted.iv.toString("base64"),
        authTag: encrypted.tag.toString("base64"),
      };

      vault.header.createdAt = current.getTime();
      vault.header.updatedAt = current.getTime();

      atomicWrite(EXPORT_PATH, JSON.stringify(vault, null, 2));

      return { success: true };
    }

    if (useOldPass === false && newPass.length > 0) {
      const salt = crypto.randomBytes(16);
      const kek = scryptKey(newPass, salt);

      const vaultKey = crypto.randomBytes(32);

      const wrapped = aesEncrypt(kek, vaultKey);

      const encryptedData = aesEncrypt(
        vaultKey,
        Buffer.from(JSON.stringify(session.data)),
      );

      const vault = {
        magic: MAGIC,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        appVersion: app.getVersion(),
        header: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          kdf: {
            name: "scrypt",
            params: SCRYPT_PARAMS,
            salt: salt.toString("base64"),
          },
          crypto: { cipher: "aes-256-gcm" },
        },
        protected: {
          encryptedVaultKey: wrapped.encrypted.toString("base64"),
          vaultKeyIv: wrapped.iv.toString("base64"),
          vaultKeyTag: wrapped.tag.toString("base64"),
        },
        data: {
          encrypted: encryptedData.encrypted.toString("base64"),
          iv: encryptedData.iv.toString("base64"),
          authTag: encryptedData.tag.toString("base64"),
        },
      };

      atomicWrite(EXPORT_PATH, JSON.stringify(vault, null, 2));

      return { success: true };
    }

    return { success: false, error: "Bad params" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
/**
 *
 * @param {string} ownerWebContentsId
 * @param {*} newData
 * @returns
 */
function upsertItem(ownerWebContentsId, newItem) {
  try {
    requireSession(ownerWebContentsId);

    const cleanData = sanitizeEntry(newItem);

    if (!cleanData) {
      throw new Error(ERRORS.INVALIT_ENTRY);
    }

    const newData = structuredClone(session.data);

    const found = newData.find((d) => d.id === newItem.id);

    if (found) {
      Object.assign(found, cleanData);
    } else {
      newData.push(cleanData);
    }

    session.data = newData;

    const encrypted = aesEncrypt(
      session.vaultKey,
      Buffer.from(JSON.stringify(newData)),
    );

    const vault = readVault();

    vault.data = {
      encrypted: encrypted.encrypted.toString("base64"),
      iv: encrypted.iv.toString("base64"),
      authTag: encrypted.tag.toString("base64"),
    };

    vault.header.updatedAt = Date.now();

    writeVault(VAULT_PATH, JSON.stringify(vault, null, 2));

    return { success: true, data: secureData(session.data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 *
 * @param {*} oldPass
 * @param {*} newPass
 * @returns
 */
function changePassword(oldPass, newPass) {
  try {
    const meta = validateMeta();

    checkPasswordCooldown(meta);

    const vault = readVault();

    const oldSalt = Buffer.from(vault.header.kdf.salt, "base64");
    const oldKek = scryptKey(oldPass, oldSalt);

    let vaultKey;

    try {
      vaultKey = aesDecrypt(
        oldKek,
        Buffer.from(vault.protected.vaultKeyIv, "base64"),
        Buffer.from(vault.protected.vaultKeyTag, "base64"),
        Buffer.from(vault.protected.encryptedVaultKey, "base64"),
      );
    } catch (err) {
      if (
        err.message.includes("authenticate") ||
        err.message.includes("auth")
      ) {
        handleWrongPassword(meta);
      }

      throw err;
    }

    resetPasswordCooldown(meta);

    const newSalt = crypto.randomBytes(16);
    const newKek = scryptKey(newPass, newSalt);
    const wrapped = aesEncrypt(newKek, vaultKey);

    vault.header.kdf.salt = newSalt.toString("base64");
    vault.protected = {
      encryptedVaultKey: wrapped.encrypted.toString("base64"),
      vaultKeyIv: wrapped.iv.toString("base64"),
      vaultKeyTag: wrapped.tag.toString("base64"),
    };

    writeVault(VAULT_PATH, JSON.stringify(vault, null, 2));

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Locking vault by destroying session
 */
function lockVault(reason) {
  destroySession(reason);
}

/**
 * Wipe out the memory
 */
function wipeSession() {
  if (!session) return;

  // Zero out sensitive buffers
  if (session.vaultKey && Buffer.isBuffer(session.vaultKey)) {
    session.vaultKey.fill(0);
  }

  // Clear data array
  if (Array.isArray(session.data)) {
    session.data.length = 0;
  }

  // Clear all properties
  session.id = null;
  session.vaultKey = null;
  session.data = null;
  session.ownerWebContentsId = null;
  session.lastActivity = null;
  session.timeout = null;
  session.timer = null;

  session = null;
}

/**
 *
 * @param {*} file
 * @param {*} max
 */
function rotateBackups(file, max = 3) {
  try {
    const oldest = `${file}.bak${max}`;
    if (fs.existsSync(oldest)) {
      fs.unlinkSync(oldest);
    }

    for (let i = max - 1; i >= 1; i--) {
      const src = `${file}.bak${i}`;
      const dest = `${file}.bak${i + 1}`;

      if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
      }
    }
  } catch (_) {
    //
  }
}

/**
 *
 * @param {*} file
 */
function createBackup(file) {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, `${file}.bak1`);
  }
}

/**
 *
 * @param {*} file
 * @param {*} data
 */
function writeVault(file, data) {
  rotateBackups(file);
  createBackup(file);
  atomicWrite(file, data);
}

/**
 *
 * @param {*} vaultKey
 * @param {*} data
 */
function createSession(vaultKey, data, ownerWebContentsId) {
  const sessionId = crypto.randomUUID();

  session = {
    id: sessionId,
    vaultKey,
    data,
    ownerWebContentsId,
    lastActivity: Date.now(),
    timeout: 600_000,
    timer: null,
  };

  session.timer = setTimeout(() => {
    destroySession("timeout");
  }, session.timeout);
}

/**
 *
 */
function requestCopyPassword(ownerWebContentsId, itemId) {
  try {
    requireSession(ownerWebContentsId);

    const item = session.data.find((item) => item.id === itemId);

    if (!item) return;

    if (!item.password) {
      return;
    } else {
      const wipedPassword = "••••••••••";

      clipboard.writeText(wipedPassword);

      if (clipboardDecoyTimer) clearTimeout(clipboardDecoyTimer);
      if (clipboardTimer) clearTimeout(clipboardTimer);

      clipboardDecoyTimer = setTimeout(() => {
        clipboard.writeText(item.password);
        clipboardDecoyTimer = null;
      }, 200);

      clipboardTimer = setTimeout(() => {
        if (clipboard.readText() === item.password) {
          clipboard.clear();
        }

        // Force
        setTimeout(() => {
          if (clipboard.readText() === item.password) {
            clipboard.writeText("");
          }
        }, 100);

        clipboardTimer = null;
      }, 30_000);
    }
  } catch (err) {
    return;
  }
}

/**
 *
 */
function secureData(data) {
  const secureData = data.map((item) => {
    if (!item.password) {
      return item;
    } else {
      const wipedPassword = "•".repeat(item.password.length);

      return {
        ...item,
        password: wipedPassword,
      };
    }
  });

  return secureData;
}

function importVault(importedVault, pass) {
  try {
    const salt = Buffer.from(importedVault.header.kdf.salt, "base64");
    const kek = scryptKey(pass, salt);

    const vaultKey = aesDecrypt(
      kek,
      Buffer.from(importedVault.protected.vaultKeyIv, "base64"),
      Buffer.from(importedVault.protected.vaultKeyTag, "base64"),
      Buffer.from(importedVault.protected.encryptedVaultKey, "base64"),
    );

    const imported = JSON.parse(
      aesDecrypt(
        vaultKey,
        Buffer.from(importedVault.data.iv, "base64"),
        Buffer.from(importedVault.data.authTag, "base64"),
        Buffer.from(importedVault.data.encrypted, "base64"),
      ).toString("utf8"),
    );

    const status = {
      new: 0,
      skipped: 0,
    };

    const copy = structuredClone(session.data);

    for (const importedItem of imported) {
      const newCleanItem = sanitizeEntry(importedItem);

      if (!newCleanItem) {
        status.skipped++;
        continue;
      }

      const found = copy.find((item) => item.id === newCleanItem.id);

      // const index = copy.findIndex((item) => item.id === newCleanItem.id);
      // if (index !== -1) {
      //   copy[index] = newCleanItem;
      // }

      if (!found) {
        copy.push(newCleanItem);
        status.new++;
      } else {
        if (newCleanItem.updatedAt > found.updatedAt) {
          newCleanItem.title = newCleanItem.title + " [Newer from Backup]";
          copy.push(newCleanItem);
          status.new++;
        } else if (newCleanItem.updatedAt < found.updatedAt) {
          newCleanItem.title = newCleanItem.title + " [Older from Backup]";
          copy.push(newCleanItem);
          status.new++;
        } else {
          status.skipped++;
        }
      }
    }

    const encrypted = aesEncrypt(
      session.vaultKey,
      Buffer.from(JSON.stringify(copy)),
    );

    const vault = readVault();

    vault.data = {
      encrypted: encrypted.encrypted.toString("base64"),
      iv: encrypted.iv.toString("base64"),
      authTag: encrypted.tag.toString("base64"),
    };

    vault.header.updatedAt = Date.now();

    writeVault(VAULT_PATH, JSON.stringify(vault, null, 2));

    session.data = copy;

    return { status, data: copy };
  } catch (err) {
    if (err.message.includes("authenticate") || err.message.includes("auth")) {
      throw new Error(ERRORS.WRONG_PASSWORD);
    }
    throw err;
  }
}

/**
 *
 * @param {*} ownerWebContentsId
 * @param {*} pass
 * @param {*} buffer
 * @returns
 */
function importVaultByBuffer(ownerWebContentsId, pass, buffer) {
  try {
    requireSession(ownerWebContentsId);

    if (!pass || !buffer) {
      throw new Error("Bad Params");
    }

    if (buffer.length > 50 * 1024 * 1024) {
      throw new Error("Vault file too large");
    }
    const nodeBuffer = Buffer.from(buffer);

    const importedVault = JSON.parse(nodeBuffer.toString("utf-8"));

    validateVault(importedVault);

    const { status, data } = importVault(importedVault, pass);

    return { success: true, status, data: secureData(data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 *
 * @param {string} ownerWebContentsId
 * @param {string} pass
 * @param {string} filePath
 * @returns
 */
function importVaultByFilePath(ownerWebContentsId, pass, filePath) {
  try {
    requireSession(ownerWebContentsId);

    if (!pass || !filePath) {
      throw new Error("Bad Params");
    }

    if (!fs.existsSync(filePath)) {
      throw new Error("File does not exist");
    }

    const stat = fs.statSync(filePath);

    if (!stat.isFile()) {
      throw new Error("Invalid file");
    }

    if (stat.size > 50 * 1024 * 1024) {
      throw new Error("Vault file too large");
    }

    const importedVault = JSON.parse(fs.readFileSync(filePath, "utf8"));

    validateVault(importedVault);

    const { status, data } = importVault(importedVault, pass);

    return { success: true, status, data: secureData(data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 *
 * @param {*} itemId
 * @returns
 */
function requestShowPassword(ownerWebContentsId, itemId) {
  try {
    requireSession(ownerWebContentsId);

    const item = session.data.find((item) => item.id === itemId);
    if (!item) return "";

    if (!item.password) return "";
    return item.password;
  } catch (err) {
    return "";
  }
}

/**
 *
 * @param {*} vault
 */
function validateVault(vault) {
  if (!vault) {
    throw new Error(ERRORS.INVALID_VAULT);
  }

  if (
    !vault?.appVersion ||
    !vault?.schemaVersion ||
    !vault?.magic ||
    !vault?.header?.kdf ||
    !vault?.protected ||
    !vault?.data
  ) {
    throw new Error(ERRORS.INVALID_VAULT);
  }

  if (vault.magic !== MAGIC) {
    throw new Error(ERRORS.INVALID_VAULT);
  }

  if (!vault.header.kdf.salt || !vault.header.kdf.name) {
    throw new Error(ERRORS.INVALID_VAULT);
  }

  if (
    !vault.protected.encryptedVaultKey ||
    !vault.protected.vaultKeyIv ||
    !vault.protected.vaultKeyTag
  ) {
    throw new Error(ERRORS.INVALID_VAULT);
  }

  if (!vault.data.encrypted || !vault.data.iv || !vault.data.authTag) {
    throw new Error(ERRORS.INVALID_VAULT);
  }

  if (vault.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error("Vault schema incompatible. Please update the app.");
  }

  if (semver.major(app.getVersion()) < semver.major(vault.appVersion)) {
    throw new Error("App version incompatible. Please update the app.");
  }

  // later check if app.getVersion.major > vault.appVersion.major
}

module.exports = {
  exportVault,
  importVaultByFilePath,
  importVaultByBuffer,
  requestShowPassword,
  requestCopyPassword,
  init,
  lockVault,
  changePassword,
  createVault,
  unlockVault,
  upsertItem,
  removeItem,
};
