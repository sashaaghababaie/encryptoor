const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");
const { app } = require("electron");

const OFFICIAL_UPDATE_DOMAIN = "updates.yourdomain.com";

function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  const fd = fs.openSync(filePath, "r");

  const buf = Buffer.alloc(1024 * 1024);
  let bytes;
  while ((bytes = fs.readSync(fd, buf, 0, buf.length)) > 0) {
    hash.update(buf.slice(0, bytes));
  }

  fs.closeSync(fd);
  return hash.digest("hex");
}

function downloadUpdateWithProgress(win, { dmgUrl, expectedHash }) {
  const url = new URL(dmgUrl);

  if (url.hostname !== OFFICIAL_UPDATE_DOMAIN) {
    throw new Error("Invalid update source");
  }

  const dest = path.join(app.getPath("downloads"), path.basename(dmgUrl));

  return new Promise((resolve, reject) => {
    https
      .get(dmgUrl, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error("Download failed"));
          return;
        }

        const total = Number(res.headers["content-length"]);
        let received = 0;

        const file = fs.createWriteStream(dest, { mode: 0o600 });

        res.on("data", (chunk) => {
          received += chunk.length;
          win.webContents.send("update:progress", {
            received,
            total,
            percent: Math.round((received / total) * 100),
          });
        });

        res.pipe(file);

        file.on("finish", () => {
          file.close(() => {
            try {
              const actual = sha256File(dest);
              if (actual !== expectedHash) {
                fs.unlinkSync(dest);
                reject(new Error("Integrity check failed"));
                return;
              }

              win.webContents.send("update:progress", {
                received: total,
                total,
                percent: 100,
              });

              resolve({ path: dest });
            } catch (err) {
              reject(err);
            }
          });
        });
      })
      .on("error", reject);
  });
}

module.exports = { downloadUpdateWithProgress };
