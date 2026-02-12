const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");
const semver = require("semver");
const { app, shell } = require("electron");

const OFFICIAL_UPDATE_DOMAIN =
  "https://github.com/sashaaghababaie/encryptoor/releases/latest/download";
const MANIFEST_URL = "http://sashaaghababaie.github.io/encryptoor/update.json";

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
      throw new Error("Missing update metadata, Please try again later.");
    }

    const urlObject = getValidUrl(url);

    if (!urlObject) {
      throw new Error("Invalid update URL");
    }

    const updateUrlHost = getValidUrl(OFFICIAL_UPDATE_DOMAIN);

    if (!updateUrlHost) {
      throw new Error("Invalid update URL");
    }

    const officialHost = updateUrlHost.hostname;

    if (urlObject.hostname !== officialHost) {
      throw new Error("Invalid update source, Please try again later.");
    }

    const dest = path.join(app.getPath("downloads"), path.basename(url));

    await new Promise((resolve, reject) => {
      const req = https.get(urlObject, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error("Download failed. Please try again later."));
          return;
        }

        const total = Number(res.headers["content-length"]);

        let received = 0;

        const file = fs.createWriteStream(dest, { mode: 0o600 });

        activeDownload = { req, file, dest, win, reject, cancelled: false };

        res.on("data", (chunk) => {
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
          reject(err);
        });

        file.on("error", (err) => {
          reject(err);
        });

        file.on("finish", () => {
          file.close(() => {
            (async () => {
              try {
                if (activeDownload?.cancelled) {
                  return;
                }

                if (win && !win.isDestroyed()) {
                  win.webContents.send("update:progress", {
                    status: "verifying",
                    received,
                    total,
                    percent:
                      Number.isFinite(total) && total > 0
                        ? Math.round((received / total) * 100)
                        : null,
                  });
                }

                const verification = await verifyDownloadedFile(
                  dest,
                  sha256,
                  signature,
                  PUBLIC_KEY_PEM,
                );

                if (!verification.valid) {
                  // Delete invalid file
                  fs.unlinkSync(dest);
                  reject(
                    new Error(verification.error || "Verification failed"),
                  );
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

                resolve();
              } catch (err) {
                reject(err);
              } finally {
                activeDownload = null;
              }
            })();
          });
        });
      });

      req.on("error", (err) => {
        activeDownload = null;
        reject(err);
      });

      req.on("close", () => {
        if (activeDownload?.cancelled) {
          return;
        }
        activeDownload = null;
      });
    });

    return { success: true };
  } catch (err) {
    if (activeDownload) {
      activeDownload = null;
    }

    return { success: false, error: err.message };
  }
}

/**
 *
 * @returns
 */
function cancelUpdateDownload() {
  if (!activeDownload) {
    return { cancelled: false };
  }

  activeDownload.cancelled = true;
  activeDownload.req.destroy(new Error("Download cancelled"));

  if (activeDownload.file) {
    activeDownload.file.close(() => {
      if (fs.existsSync(activeDownload.dest)) {
        fs.unlinkSync(activeDownload.dest);
      }
    });
  }

  activeDownload.win?.webContents.send("update:progress", {
    status: "cancelled",
  });

  activeDownload.reject(new Error("Download cancelled"));
  activeDownload = null;

  return { cancelled: true };
}

/**
 *
 * @returns
 */
async function checkForUpdates() {
  try {
    const res = await fetch(
      MANIFEST_URL.startsWith("http")
        ? MANIFEST_URL
        : `https://${MANIFEST_URL}`,
    );

    if (!res.ok) {
      throw new Error("Failed to fetch update metadata");
    }

    const manifest = await res.json();

    const latestVersion = manifest.version;

    if (semver.gt(latestVersion, app.getVersion())) {
      const platform = process.platform;
      const updateMeta = manifest.platforms[platform];

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
        releaseNotes: manifest.releaseNotes || "",
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

module.exports = {
  showDownloadedFile,
  downloadUpdateWithProgress,
  cancelUpdateDownload,
  checkForUpdates,
};
