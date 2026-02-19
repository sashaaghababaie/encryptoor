const fs = require("fs");
const path = require("path");
const { ERRORS } = require("../src/utils/error");

/**
 * Windows and Unix safe atomic write
 */
function atomicWrite(filePath, data, slug = "vault") {
  const dir = path.dirname(filePath);
  const tempPath = path.join(dir, `.tmp-${slug}-${Date.now()}`);

  let tempFd = null;

  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(tempPath, data, { encoding: "utf8", mode: 0o600 });

    // Sync to disk
    try {
      tempFd = fs.openSync(tempPath, "r+");
      fs.fsyncSync(tempFd);
    } finally {
      if (tempFd !== null) {
        fs.closeSync(tempFd);
        tempFd = null;
      }
    }

    performAtomicRename(tempPath, filePath);
  } catch (err) {
    // Clean up temp file on error
    try {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    } catch (err) {
      // for debug
      // console.warn(
      //   `Failed to cleanup temp file ${tempPath}:`,
      //   err.message,
      // );
    }

    if (tempFd !== null) {
      try {
        fs.closeSync(tempFd);
      } catch {}
    }

    if (err.code === "ENOSPC") {
      throw new Error(ERRORS.DISK_FULL);
    }

    if (err.code === "EACCES" || err.code === "EPERM") {
      throw new Error(`${ERRORS.PERMISSION_DENIED}: ${err.message}`);
    }

    throw err;
  }
}

/**
 * Safe file read with error handling
 */
// function safeReadFile(filePath) {
//   try {
//     return fs.readFileSync(filePath, "utf8");
//   } catch (err) {
//     if (err.code === "ENOENT") {
//       throw new Error(`File not found: ${filePath}`);
//     }
//     if (err.code === "EACCES" || err.code === "EPERM") {
//       throw new Error(`${ERRORS.PERMISSION_DENIED}: Cannot read ${filePath}`);
//     }
//     throw err;
//   }
// }

/**
 * Create vault directory with proper permissions
 * Windows ignores mode parameter but we set it for Unix systems
 */
// function ensureVaultDirectory() {
//   try {
//     if (!fs.existsSync(VAULT_DIR)) {
//       fs.mkdirSync(VAULT_DIR, {
//         recursive: true,
//         mode: 0o700, // Works on Unix, ignored on Windows
//       });

//       // On Windows, set hidden attribute
//       if (process.platform === "win32") {
//         try {
//           const { execSync } = require("child_process");
//           execSync(`attrib +h "${VAULT_DIR}"`, { windowsHide: true });
//         } catch (attrErr) {
//           // Non-critical, ignore
//         }
//       }
//     }
//   } catch (err) {
//     if (err.code === "EACCES" || err.code === "EPERM") {
//       throw new Error(
//         `${ERRORS.PERMISSION_DENIED}: Cannot create vault directory`,
//       );
//     }
//     throw err;
//   }
// }
/**
 * Platform-specific atomic rename
 * Windows: Delete target first, then rename
 * Unix: Atomic rename over target
 */
function performAtomicRename(tempPath, targetPath) {
  if (process.platform === "win32") {
    windowsAtomicRename(tempPath, targetPath);
  } else {
    fs.renameSync(tempPath, targetPath);
  }
}

/**
 * Windows-specific atomic rename with retry logic
 */
function windowsAtomicRename(tempPath, targetPath) {
  const maxRetries = 3;
  const retryDelay = 50; // ms

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }

      fs.renameSync(tempPath, targetPath);

      return;
    } catch (err) {
      // wait and retry
      if (
        (err.code === "EPERM" || err.code === "EBUSY") &&
        attempt < maxRetries - 1
      ) {
        sleepSync(retryDelay * (attempt + 1));
        continue;
      }

      throw err;
    }
  }

  throw new Error("Failed to write file after multiple retries");
}

/**
 * Synchronous sleep
 */
function sleepSync(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    // wait
  }
}

/**
 * Safe file rename (Windows-compatible)
 * Windows can't rename over existing files, so we delete first
 */
function safeRename(src, dest) {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (process.platform === "win32") {
        // Windows
        if (fs.existsSync(dest)) {
          safeDelete(dest);
        }
        fs.renameSync(src, dest);
      } else {
        // Unix
        fs.renameSync(src, dest);
      }

      return;
    } catch (err) {
      if (
        (err.code === "EPERM" || err.code === "EBUSY") &&
        attempt < maxRetries - 1
      ) {
        // wait and retry if file locked
        sleepSync(50 * (attempt + 1));
        continue;
      }

      throw err;
    }
  }
}

/**
 * Safe file deletion with retry logic
 * Handles Windows file locking issues
 */
function safeDelete(filePath) {
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      fs.unlinkSync(filePath);
      return;
    } catch (err) {
      if (err.code === "ENOENT") {
        return;
      }

      // wait and retry if file locked
      if (
        (err.code === "EPERM" || err.code === "EBUSY") &&
        attempt < maxRetries - 1
      ) {
        sleepSync(50 * (attempt + 1));
        continue;
      }

      throw err;
    }
  }
}

module.exports = { atomicWrite, safeDelete, safeRename };
