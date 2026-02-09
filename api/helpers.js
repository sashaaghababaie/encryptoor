const fs = require("fs");
const path = require("path");
const { ERRORS } = require("../src/utils/error");

/**
 * Atomic write data to a file.
 * @param { path } filePath
 * @param {{[index:string]: string}} data
 */
function atomicWrite(filePath, data, slug = "vault") {
  const dir = path.dirname(filePath);
  const tempPath = path.join(dir, `.tmp-${slug}-${Date.now()}`);

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

module.exports = { atomicWrite };
