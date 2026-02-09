const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");
const semver = require("semver");
const { app } = require("electron");
const PUBLIC_KEY_PEM = "SOME-PUBKEY";
const OFFICIAL_UPDATE_DOMAIN = "sashaaghababaie.github.io/some/url";
const MANIFEST_URL = "sashaaghababaie.github.io/some/url/update.json";

let updateInfo = null;
let activeDownload = null;

const exampleUpdateManifest = {
  version: "1.11.2",
  releaseDate: "2024-02-09",
  platforms: {
    darwin: {
      url: "https://updates.yourdomain.com/releases/Encryptoor-1.9.2.dmg",
      sha256: "abc123...",
      size: 45234567,
      signature: "RSA_SIGNATURE_HERE",
    },
    win32: {
      url: "https://updates.yourdomain.com/releases/Encryptoor-1.9.2.exe",
      sha256: "def456...",
      size: 52345678,
      signature: "RSA_SIGNATURE_HERE",
    },
  },
  releaseNotes: "Bug fixes and security improvements",
};

// const OFFICIAL_UPDATE_DOMAIN = "";
// const MANIFEST_URL = "";
/**
 *
 * @param {*} filePath
 * @returns
 */
function sha256File(filePath) {
  //   const hash = crypto.createHash("sha256");
  //   const fd = fs.openSync(filePath, "r");

  //   const buf = Buffer.allocUnsafe(1024 * 1024);
  //   let bytesRead;

  //   while ((bytesRead = fs.readSync(fd, buf, 0, buf.length, null)) > 0) {
  //     hash.update(buf.subarray(0, bytesRead));
  //   }

  //   fs.closeSync(fd);

  //   return hash.digest("hex");
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

/**
 *
 * @param {*} filePath
 * @param {*} signatureBase64
 * @param {*} publicKeyPem
 * @returns
 */
function verifyUpdateSignature(filePath, signatureBase64, publicKeyPem) {
  const fileBuffer = fs.readFileSync(filePath);
  const signature = Buffer.from(signatureBase64, "base64");

  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(fileBuffer);

  return verifier.verify(publicKeyPem, signature);
}

/**
 *
 * @param {*} win
 * @param {*} param1
 * @returns
 */
function downloadUpdateWithProgress(win) {
  if (activeDownload) {
    throw new Error("Download already in progress");
  }

  if (!updateInfo) {
    throw new Error("Unexpected");
  }

  const { url, sha256, signature } = updateInfo;

  if (!url || !sha256 || !signature) {
    throw new Error("Missing update metadata");
  }

  const urlObject = new URL(url.startsWith("http") ? url : `https://${url}`);

  const officialHost = new URL(
    OFFICIAL_UPDATE_DOMAIN.startsWith("http")
      ? OFFICIAL_UPDATE_DOMAIN
      : `https://${OFFICIAL_UPDATE_DOMAIN}`,
  ).hostname;

  if (urlObject.hostname !== officialHost) {
    throw new Error("Invalid update source");
  }

  const dest = path.join(app.getPath("downloads"), path.basename(url));

  return new Promise((resolve, reject) => {
    const req = https.get(urlObject, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error("Download failed"));
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
        win.webContents.send("update:progress", {
          status: "downloading",
          received,
          total,
          percent,
        });
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

              win.webContents.send("update:progress", {
                status: "verifying",
                received,
                total,
                percent:
                  Number.isFinite(total) && total > 0
                    ? Math.round((received / total) * 100)
                    : null,
              });

              const actual = await sha256File(dest);

              if (actual !== sha256) {
                fs.unlinkSync(dest);
                reject(new Error("Integrity check failed"));
                return;
              }

              const verifySignature = verifyUpdateSignature(
                dest,
                signature,
                PUBLIC_KEY_PEM,
              );

              if (!verifySignature) {
                fs.unlinkSync(dest);
                reject(new Error("Integrity check failed"));
                return;
              }

              win.webContents.send("update:progress", {
                status: "completed",
                received: total,
                total,
                percent: 100,
              });

              resolve({ path: dest });
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
}

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

    // const manifest = fake;

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

module.exports = {
  downloadUpdateWithProgress,
  cancelUpdateDownload,
  checkForUpdates,
};
