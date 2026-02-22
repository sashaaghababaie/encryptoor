const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");
const semver = require("semver");
const { app, shell } = require("electron");

const MANIFEST_URL = "https://sashaaghababaie.github.io/encryptoor/update.json";
const OFFICIAL_UPDATE_DOMAIN =
  "https://github.com/sashaaghababaie/encryptoor/releases/";

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAo+i/Nk0f3TuS5AgcKCrW
DymdVFjI/uY8FKVEM1m2MNKUKYcHeY56XTCyjsePhyBDfxOQ9Jj+EVCfr4Cu2kDb
6peP+v1ubFxNxMNJpStVkzlEHokWt3teY/PQi9RkNbVAwdgDtr2o9xzyi4u+2gRq
jBt+0KTO+z4bfiiPhHCdHzr3Fu0unLVZZsAt2jeGbIvgMchL9HASTfq6ZKcCT5YW
6JyKHHDK3iTnfx5x89E8lgb8aqsZ1V7/+h9K/WaSNbFtLRwXuEqKTZe+xwEFOHrH
eaWGBiRKEJQRZlh4bhW4rd4cGbTe/Smt4s1OnTBG8f7S38JNZFFH97RNMWhBgC3p
IQIDAQAB
-----END PUBLIC KEY-----`;

let updateInfo = null;
let downloadedDest = null;
let activeDownload = null;

/**
 *  Calculate SHA256 hash from a buffer (single read)
 * @param {Buffer} fileBuffer - File content as buffer
 * @returns {string} - Hex hash
 */
function sha256Buffer(fileBuffer) {
  const hash = crypto.createHash("sha256");
  hash.update(fileBuffer);

  return hash.digest("hex");
}

/**
 *  Verify signature from a buffer (single read)
 * @param {Buffer} fileBuffer - File content as buffer
 * @param {string} signatureBase64 - Base64 encoded signature
 * @param {string} publicKeyPem - Public key in PEM format
 * @returns {boolean} - True if signature is valid
 */
function verifySignatureBuffer(fileBuffer, signatureBase64, publicKeyPem) {
  const signature = Buffer.from(signatureBase64, "base64");
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(fileBuffer);

  return verifier.verify(publicKeyPem, signature);
}

async function verifyDownloadedFile(
  filePath,
  expectedHash,
  signatureBase64,
  publicKeyPem,
) {
  try {
    const fileBuffer = await fs.promises.readFile(filePath);

    // 1. Verify SHA256 hash
    const actualHash = sha256Buffer(fileBuffer);

    if (actualHash !== expectedHash) {
      return {
        valid: false,
        error: "Hash verification failed",
      };
    }

    // 2. Verify signature
    const signatureValid = verifySignatureBuffer(
      fileBuffer,
      signatureBase64,
      publicKeyPem,
    );

    if (!signatureValid) {
      return {
        valid: false,
        error: "Signature verification failed",
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Verification error: ${error.message}`,
    };
  }
}

/**
 *
 * @param {*} url
 * @returns
 */
function getValidUrl(url) {
  try {
    const validUrl = new URL(url.startsWith("https") ? url : `https://${url}`);
    return validUrl;
  } catch {
    return null;
  }
}
/**
 *
 * @param {*} win
 * @param {*} param1
 * @returns
 */
async function downloadUpdateWithProgress(win) {
  try {
    return { success: false };
    if (activeDownload) {
      throw new Error("Download already in progress");
    }

    if (!updateInfo) {
      throw new Error(
        "Cannot fetch update info right now. Please try again later.",
      );
    }

    const { url, sha256, signature } = updateInfo;

    if (!url || !sha256 || !signature) {
      throw new Error("Missing update metadata. Please try again later.");
    }

    const urlObject = getValidUrl(url);
    if (!urlObject) {
      throw new Error("Invalid update URL");
    }

    const updateUrlHost = getValidUrl(OFFICIAL_UPDATE_DOMAIN);
    if (!updateUrlHost) {
      throw new Error("Invalid update domain");
    }

    const officialHost = updateUrlHost.hostname;
    if (urlObject.hostname !== officialHost) {
      throw new Error("Invalid update source. Please try again later.");
    }

    const dest = path.join(app.getPath("downloads"), path.basename(url));

    await new Promise((resolve, reject) => {
      downloadWithRedirects(urlObject.href, dest, win, resolve, reject);
    });

    return { success: true };
  } catch (err) {
    // console.error("Download error:", err);
    if (activeDownload) {
      activeDownload = null;
    }

    return { success: false, error: err.message };
  }
}

/**
 * Download with automatic redirect following
 */
function downloadWithRedirects(
  url,
  dest,
  win,
  resolve,
  reject,
  redirectCount = 0,
) {
  const MAX_REDIRECTS = 5;

  if (redirectCount > MAX_REDIRECTS) {
    reject(new Error("Too many redirects"));
    return;
  }

  const urlObject = new URL(url);

  const req = https.get(urlObject, (res) => {
    if (activeDownload?.cancelled) {
      resolve("CANCELLED");
      return;
    }

    if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
      const redirectUrl = res.headers.location;
      if (!redirectUrl) {
        reject(new Error("Redirect with no location header"));
        return;
      }
      downloadWithRedirects(
        redirectUrl,
        dest,
        win,
        resolve,
        reject,
        redirectCount + 1,
      );
      return;
    }

    if (res.statusCode !== 200) {
      reject(new Error(`Download failed with status ${res.statusCode}`));
      return;
    }

    const total = Number(res.headers["content-length"]);
    let received = 0;

    const file = fs.createWriteStream(dest, { mode: 0o600 });

    const downloadState = {
      cancelled: false,
      req,
      file,
      dest,
      win,
    };

    activeDownload = downloadState;

    res.on("data", (chunk) => {
      if (downloadState.cancelled) {
        // console.log("Cancelled during download");
        return;
      }

      received += chunk.length;
      const percent =
        Number.isFinite(total) && total > 0
          ? Math.round((received / total) * 100)
          : null;

      if (win && !win.isDestroyed()) {
        win.webContents.send("update:progress", {
          status: "downloading",
          received,
          total,
          percent,
        });
      }
    });

    res.pipe(file);

    res.on("error", (err) => {
      // console.error("Response error:", err);
      reject(err);
    });

    file.on("error", (err) => {
      // console.error("File write error:", err);
      reject(err);
    });

    file.on("finish", () => {
      file.close(async () => {
        try {
          if (downloadState.cancelled) {
            activeDownload = null;
            resolve("CANCELLED");
            return;
          }

          // Send verifying status
          if (win && !win.isDestroyed()) {
            win.webContents.send("update:progress", {
              status: "verifying",
              received,
              total,
              percent: 100,
            });
          }

          // Verify download
          const verification = await verifyDownloadedFile(
            dest,
            updateInfo.sha256,
            updateInfo.signature,
            PUBLIC_KEY_PEM,
          );

          if (!verification.valid) {
            // console.error("Verification failed:", verification.error);
            fs.unlinkSync(dest);
            reject(new Error(verification.error || "Verification failed"));
            return;
          }

          if (win && !win.isDestroyed()) {
            win.webContents.send("update:progress", {
              status: "completed",
              received: total,
              total,
              percent: 100,
            });
          }

          downloadedDest = dest;
          resolve("SUCCESS");
        } catch (err) {
          // console.error("Verification error:", err);
          reject(err);
        } finally {
          activeDownload = null;
        }
      });
    });
  });

  req.on("error", (err) => {
    // console.error("Request error:", err);
    activeDownload = null;
    reject(err);
  });
}

function cancelUpdateDownload() {
  if (!activeDownload) {
    return { cancelled: false };
  }

  activeDownload.cancelled = true;

  if (activeDownload.req) {
    try {
      activeDownload.req.destroy();
    } catch (err) {
      // console.warn("Error destroying request:", err);
    }
  }

  // Close file
  if (activeDownload.file) {
    try {
      const destPath = activeDownload.dest;

      activeDownload.file.close(() => {
        if (fs.existsSync(destPath)) {
          try {
            fs.unlinkSync(destPath);
          } catch (err) {}
        }
      });
    } catch (err) {}
  }

  // Notify UI
  if (activeDownload.win && !activeDownload.win.isDestroyed()) {
    activeDownload.win.webContents.send("update:progress", {
      status: "cancelled",
    });
  }

  return { cancelled: true };
}

/**
 *
 * @returns
 */
function cancelUpdateDownload() {
  if (!activeDownload) {
    return { cancelled: false };
  }

  // console.log("Cancelling update download...");

  activeDownload.cancelled = true;

  // Destroy request
  if (activeDownload.req) {
    try {
      activeDownload.req.destroy();
    } catch (err) {
      // console.warn("Error destroying request:", err);
    }
  }

  // Close file
  if (activeDownload.file) {
    try {
      const destPath = activeDownload.dest;

      activeDownload.file.close(() => {
        if (fs.existsSync(destPath)) {
          try {
            fs.unlinkSync(destPath);
            // console.log("Deleted partial download");
          } catch (err) {
            // console.warn("Could not delete partial file:", err);
          }
        }
      });
    } catch (err) {
      // console.warn("Error closing file:", err);
    }
  }

  // Notify UI
  if (activeDownload.win && !activeDownload.win.isDestroyed()) {
    activeDownload.win.webContents.send("update:progress", {
      status: "cancelled",
    });
  }

  return { cancelled: true };
}

/**
 *
 * @returns
 */
async function checkForUpdates() {
  try {
    const manifestURLObject = getValidUrl(MANIFEST_URL);

    if (!manifestURLObject) {
      throw new Error("Invalid manifest URL");
    }

    const res = await fetch(manifestURLObject.href);

    if (!res.ok) {
      throw new Error("Failed to fetch update metadata");
    }

    const manifest = await res.json();

    const latestVersion = manifest.version;

    if (semver.gt(latestVersion, app.getVersion())) {
      const platform = process.platform;
      const arch = process.arch;
      const updateMeta = manifest.platforms[platform][arch];

      if (!updateMeta) {
        updateInfo = null;
        return { available: false };
      }

      updateInfo = {
        url: updateMeta.url,
        sha256: updateMeta.sha256,
        signature: updateMeta.signature,
      };

      return {
        available: true,
        version: latestVersion,
        downloadUrl: updateMeta.url,
        sha256: updateMeta.sha256,
        signature: updateMeta.signature,
        size: updateMeta.size,
        releaseNotes:
          manifest.releaseNotes || "Bug fixes and minor improvements.",
      };
    }

    updateInfo = null;

    return { available: false };
  } catch (err) {
    updateInfo = null;

    return { available: false, error: "Update check failed" };
  }
}

/**
 *
 */
function showDownloadedFile() {
  if (fs.existsSync(downloadedDest)) {
    shell.showItemInFolder(downloadedDest);
  } else {
    shell.openPath(app.getPath("downloads"));
  }

  downloadedDest = null;
}

/**
 *
 */
function openDownloadLink() {
  if (updateInfo?.url) {
    const validUrl = getValidUrl(updateInfo.url);

    if (validUrl) {
      shell.openExternal(validUrl.href);
    }
  }
}

module.exports = {
  openDownloadLink,
  showDownloadedFile,
  downloadUpdateWithProgress,
  cancelUpdateDownload,
  checkForUpdates,
};
