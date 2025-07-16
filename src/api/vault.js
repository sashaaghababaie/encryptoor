const {
  createCipheriv,
  createDecipheriv,
  createHmac,
  pbkdf2Sync,
  randomBytes,
  // scryptSync,
} = require("crypto");
const fs = require("fs");
const { app } = require("electron");
const path = require("path");

// const VAULT_PATH = path.join(app.getPath("userData"), "vault.enc");
const VAULT_PATH = path.join(app.getPath("desktop"), "vault.enc");
const SALT_SIZE = 16; // bytes
const IV_SIZE = 12; // bytes for GCM
const AUTH_TAG_SIZE = 16; // bytes
const HMAC_SIZE = 32; // bytes (SHA-256 output)
const PBKDF2_ROUNDS = 100_000;

function deriveKey(password, salt) {
  return pbkdf2Sync(password, salt, PBKDF2_ROUNDS, 32, "sha256");
  // return scryptSync(password, salt, 32, { N: 2 ** 15, r: 8, p: 1 });
}

function computeHMAC(hmacKey, data) {
  return createHmac("sha256", hmacKey).update(data).digest();
}

/**
 *
 * @returns
 */
async function init() {
  if (fs.existsSync(VAULT_PATH)) return true;
  return false;
}

/**
 *
 * @param {*} masterPassword
 * @param {*} vaultData
 * @returns
 */
async function encryptVault(masterPassword, vaultData) {
  try {
    const salt = randomBytes(SALT_SIZE);
    const key = deriveKey(masterPassword, salt);
    const hmacKey = deriveKey(masterPassword + "_hmac", salt); // derive different key for HMAC

    const iv = randomBytes(IV_SIZE);
    const cipher = createCipheriv("aes-256-gcm", key, iv);

    const json = JSON.stringify(vaultData);
    const encrypted = Buffer.concat([
      cipher.update(json, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Prepare encrypted content (iv + authTag + encrypted)
    const encryptedPayload = Buffer.concat([iv, authTag, encrypted]);

    // Compute HMAC over the encrypted payload
    const hmac = computeHMAC(hmacKey, encryptedPayload);

    // Final file content: salt + hmac + encryptedPayload
    const finalBuffer = Buffer.concat([salt, hmac, encryptedPayload]);
    await fs.promises.writeFile(VAULT_PATH, finalBuffer);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
  // console.log("🔐 Vault saved with encryption + HMAC.");
}

/**
 *
 * @param {*} masterPassword
 * @returns
 */
async function decryptVault(masterPassword) {
  if (!fs.existsSync(VAULT_PATH)) {
    return { success: true, data: [] };
  }
  try {
    const data = await fs.promises.readFile(VAULT_PATH);

    const salt = data.subarray(0, SALT_SIZE);
    const hmac = data.subarray(SALT_SIZE, SALT_SIZE + HMAC_SIZE);
    const encryptedPayload = data.subarray(SALT_SIZE + HMAC_SIZE);

    const iv = encryptedPayload.subarray(0, IV_SIZE);
    const authTag = encryptedPayload.subarray(IV_SIZE, IV_SIZE + AUTH_TAG_SIZE);
    const encrypted = encryptedPayload.subarray(IV_SIZE + AUTH_TAG_SIZE);

    const key = deriveKey(masterPassword, salt);
    const hmacKey = deriveKey(masterPassword + "_hmac", salt);

    const expectedHmac = computeHMAC(hmacKey, encryptedPayload);

    // Constant-time comparison
    if (!expectedHmac.equals(hmac)) {
      throw new Error(
        "❌ Vault integrity check failed. Wrong password or tampered file."
      );
    }

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return { success: true, data: JSON.parse(decrypted.toString("utf8")) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { init, decryptVault, encryptVault };
