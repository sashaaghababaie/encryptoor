const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");
const { ERRORS, sanitizeEntry } = require("../lib");
const isDev = require("electron-is-dev");
const vaultEvents = require("../api/events");
const { clipboard } = require("electron");

const DB_PATH = isDev ? "desktop" : "userData";
const VAULT_DIR = path.join(app.getPath(DB_PATH), "encryptoor");
const VAULT_PATH = path.join(VAULT_DIR, "vault.json");

const MAGIC = "ENCRYPTOOR";
const VERSION = 1;

const SCRYPT_PARAMS = {
  N: 2 ** 15,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};

let session = null; // in-memory only
let clipboardTimer = null;

function restoreBackup(index = 1) {
  const backup = `${VAULT_PATH}.bak${index}`;

  try {
    const data = fs.readFileSync(backup, "utf-8");

    const vault = JSON.parse(data);

    if (vault.magic !== MAGIC) {
      throw new Error(ERRORS.INVALID_VAULT);
    }

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

    if (vault.magic !== MAGIC) {
      throw new Error(ERRORS.INVALID_VAULT);
    }

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
  try {
    readVault();
    return true;
  } catch (err) {
    return false;
  }
}

/**
 *
 * @param {*} password
 * @param {*} salt
 */
function scryptKey(password, salt) {
  return crypto.scryptSync(password, salt, 32, SCRYPT_PARAMS);
}

/**
 *
 * @param {*} key
 * @param {*} plaintext
 * @returns
 */
function aesEncrypt(key, plaintext) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return {
    encrypted,
    iv,
    tag: cipher.getAuthTag(),
  };
}

/**
 *
 * @param {*} key
 * @param {*} iv
 * @param {*} tag
 * @param {*} ciphertext
 * @returns
 */
function aesDecrypt(key, iv, tag, ciphertext) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
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
      Buffer.from(JSON.stringify(data))
    );

    const vault = {
      magic: MAGIC,
      version: VERSION,
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

    fs.mkdirSync(VAULT_DIR, { recursive: true, mode: 0o700 });

    atomicWrite(VAULT_PATH, JSON.stringify(vault, null, 2));

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 *
 * @param {*} masterPassword
 * @returns
 */
function unlockVault(masterPassword) {
  try {
    const vault = readVault();

    const salt = Buffer.from(vault.header.kdf.salt, "base64");
    const kek = scryptKey(masterPassword, salt);

    const vaultKey = aesDecrypt(
      kek,
      Buffer.from(vault.protected.vaultKeyIv, "base64"),
      Buffer.from(vault.protected.vaultKeyTag, "base64"),
      Buffer.from(vault.protected.encryptedVaultKey, "base64")
    );

    const data = JSON.parse(
      aesDecrypt(
        vaultKey,
        Buffer.from(vault.data.iv, "base64"),
        Buffer.from(vault.data.authTag, "base64"),
        Buffer.from(vault.data.encrypted, "base64")
      ).toString("utf8")
    );

    createSession(vaultKey, data);

    return { success: true, sessionId: session.id, data: secureData(data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 *
 * @param {*} sessionId
 */
function requireSession(sessionId) {
  if (!session || session.id !== sessionId) {
    throw new Error(ERRORS.UNAUTHORIZED);
  }

  clearTimeout(session.timer);

  session.timer = setTimeout(() => {
    destroySession(sessionId);
  }, session.timeout);
}

/**
 * Safely clear the session, zeroing the memory and lock the UI.
 */
function destroySession() {
  if (!session) return;

  clearTimeout(session.timer);

  lockVault();

  vaultEvents.emit("vault:locked", { reason: "timeout" });
}

/**
 *
 * @param {string} sessionId
 * @param {string} itemId
 * @returns
 */
function removeItem(sessionId, itemId) {
  try {
    requireSession(sessionId);

    const currentData = structuredClone(session.data);

    session.data = currentData.filter((item) => item.id !== itemId);

    const encrypted = aesEncrypt(
      session.vaultKey,
      Buffer.from(JSON.stringify(session.data))
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

function exportVault(sessionId, useOldPass, currentPass, newPass = "") {
  try {
    requireSession(sessionId);

    if (!currentPass) {
      throw new Error("You need to type the vault pass.");
    }

    const vault = readVault();

    console.log(currentPass);

    let data;

    try {
      const salt = Buffer.from(vault.header.kdf.salt, "base64");
      const kek = scryptKey(currentPass, salt);

      aesDecrypt(
        kek,
        Buffer.from(vault.protected.vaultKeyIv, "base64"),
        Buffer.from(vault.protected.vaultKeyTag, "base64"),
        Buffer.from(vault.protected.encryptedVaultKey, "base64")
      );

      // data = JSON.parse(
      //   aesDecrypt(
      //     vaultKey,
      //     Buffer.from(vault.data.iv, "base64"),
      //     Buffer.from(vault.data.authTag, "base64"),
      //     Buffer.from(vault.data.encrypted, "base64")
      //   ).toString("utf8")
      // );
    } catch (err) {
      if (err.message === "Unsupported state or unable to authenticate data") {
        throw new Error(ERRORS.WRONG_PASSWORD);
      }

      throw err;
    }

    const current = new Date();
    const dateTime = current.toISOString().slice(0, -5).split("T");
    const date = dateTime[0];
    const time = dateTime[1].split(":").join("-");
    const filename = `vault_backup_${date}_${time}.json`;

    const EXPORT_PATH = path.join(app.getPath("desktop"), filename);

    if (useOldPass === true && newPass.length === 0) {
      const encrypted = aesEncrypt(
        session.vaultKey,
        Buffer.from(JSON.stringify(session.data))
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
        Buffer.from(JSON.stringify(session.data))
      );

      const vault = {
        magic: MAGIC,
        version: VERSION,
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
 * @param {string} sessionId
 * @param {*} newData
 * @returns
 */
function upsertItem(sessionId, newItem) {
  try {
    requireSession(sessionId);

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
      Buffer.from(JSON.stringify(newData))
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
    const vault = readVault();

    const oldSalt = Buffer.from(vault.header.kdf.salt, "base64");
    const oldKek = scryptKey(oldPass, oldSalt);

    const vaultKey = aesDecrypt(
      oldKek,
      Buffer.from(vault.protected.vaultKeyIv, "base64"),
      Buffer.from(vault.protected.vaultKeyTag, "base64"),
      Buffer.from(vault.protected.encryptedVaultKey, "base64")
    );

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
    return { success: false, erro: err.message };
  }
}

/**
 *
 */
function lockVault() {
  if (session) {
    session.vaultKey.fill(0);
    session = null;
  }
}

/**
 * Atomically write data to a file.
 * @param {path} filePath
 * @param {{[index:string]: string}} data
 */
function atomicWrite(filePath, data) {
  const dir = path.dirname(filePath);
  const tempPath = path.join(dir, `.tmp-${Date.now()}`);

  try {
    fs.writeFileSync(tempPath, data, { mode: 0o600 });
    fs.fsyncSync(fs.openSync(tempPath, "r"));
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    if (err.code === "ENOSPC") {
      throw new Error(ERRORS.DISK_FULL);
    }

    if (err.code === "EACCES") {
      throw new Error(ERRORS.PERMISSION_DENIED);
    }

    throw err;
  }
}

/**
 *
 * @param {*} file
 * @param {*} max
 */
function rotateBackups(file, max = 3) {
  for (let i = max - 1; i >= 1; i--) {
    const src = `${file}.bak${i}`;
    const dest = `${file}.bak${i + 1}`;

    if (fs.existsSync(src)) {
      fs.renameSync(src, dest);
    }
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
 * @param {*} file
 * @param {*} max
 */
function rotateBackups(file, max = 3) {
  for (let i = max - 1; i >= 1; i--) {
    const src = `${file}.bak${i}`;
    const dest = `${file}.bak${i + 1}`;

    if (fs.existsSync(src)) {
      fs.renameSync(src, dest);
    }
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
function createSession(vaultKey, data) {
  const sessionId = crypto.randomUUID();

  session = {
    id: sessionId,
    vaultKey,
    data,
    lastActivity: Date.now(),
    timeout: 600_000,
    timer: null,
  };

  session.timer = setTimeout(() => {
    destroySession(sessionId);
  }, session.timeout);
}

/**
 *
 */
function requestCopyPassword(itemId) {
  const item = session.data.find((item) => item.id === itemId);

  if (!item.password) {
    return;
  } else {
    const wipedPassword = "••••••••••";

    clipboard.writeText(wipedPassword);

    setTimeout(() => clipboard.writeText(item.password), 200);

    if (clipboardTimer) clearTimeout(clipboardTimer);

    clipboardTimer = setTimeout(() => {
      if (clipboard.readText() === item.password) {
        clipboard.clear();
      }

      clipboardTimer = null;
    }, 30_000);
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
      Buffer.from(importedVault.protected.encryptedVaultKey, "base64")
    );

    const imported = JSON.parse(
      aesDecrypt(
        vaultKey,
        Buffer.from(importedVault.data.iv, "base64"),
        Buffer.from(importedVault.data.authTag, "base64"),
        Buffer.from(importedVault.data.encrypted, "base64")
      ).toString("utf8")
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
      Buffer.from(JSON.stringify(copy))
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

function importVaultByBuffer(sessionId, pass, buffer) {
  try {
    requireSession(sessionId);

    if (!pass || !buffer) {
      throw new Error("Bad Params");
    }

    if (buffer.length > 50 * 1024 * 1024) {
      throw new Error("Vault file too large");
    }

    const importedVault = JSON.parse(buffer.toString("utf-8"));

    if (
      !importedVault?.magic ||
      !importedVault?.header?.kdf ||
      !importedVault?.protected ||
      !importedVault?.data
    ) {
      throw new Error(ERRORS.INVALID_VAULT);
    }

    if (importedVault.magic !== MAGIC) {
      throw new Error(ERRORS.INVALID_VAULT);
    }

    const { status, data } = importVault(importedVault, pass);

    return { success: true, status, data: secureData(data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 *
 * @param {string} sessionId
 * @param {string} pass
 * @param {string} filePath
 * @returns
 */
function importVaultByFilePath(sessionId, pass, filePath) {
  try {
    requireSession(sessionId);

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

    if (
      !importedVault?.magic ||
      !importedVault?.header?.kdf ||
      !importedVault?.protected ||
      !importedVault?.data
    ) {
      throw new Error(ERRORS.INVALID_VAULT);
    }

    if (importedVault.magic !== MAGIC) {
      throw new Error(ERRORS.INVALID_VAULT);
    }

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
function requestShowPassword(itemId) {
  const item = session.data.find((item) => item.id === itemId);

  if (!item.password) {
    return "";
  }

  return item.password;
}

module.exports = {
  exportVault,
  importVaultByFilePath,
  importVaultByBuffer,
  requestShowPassword,
  requestCopyPassword,
  requireSession,
  init,
  lockVault,
  changePassword,
  createVault,
  unlockVault,
  upsertItem,
  removeItem,
};

// function restoreBackup(file) {
//   const vault = loadVault(file);

//   // must succeed
//   const vaultKey = unwrapVaultKey(
//     password,
//     vault.protected.encryptedVaultKey
//   );

//   if (!vaultKey) {
//     throw new Error("Incorrect password for this backup");
//   }

//   // restore EXACT vault
//   atomicWrite(VAULT_PATH, JSON.stringify(vault));
// }
