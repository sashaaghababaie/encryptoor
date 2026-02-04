const crypto = require("crypto");
const SCRYPT_PARAMS = {
  N: 2 ** 15,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
};

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

module.exports = {
  aesDecrypt,
  aesEncrypt,
  scryptKey,
};
