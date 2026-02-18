# 🔐 Encryptoor

Encryptoor is a local, offline-first encrypted vault for securely storing login credentials and sensitive notes.
No cloud. No accounts. No tracking. Your data stays on your machine.

### ✨ Features

- 🔑 Store login credentials and secure notes
- 🔐 Strong encryption using modern cryptography
- 🔁 Secure password change
- 📤 Encrypted export & import
- 🧯 Automatic backups and recovery from corrupted vaults
- 🧠 Session-based unlock (no repeated password prompts)
- 📋 Secure clipboard with auto-clear
- ⏱ Auto-lock on inactivity or system events
- 🔄 Auto-update support
- 🔒 Security Model (High Level)

Encryptoor is designed with a local threat model in mind.

### Cryptography

AES-256-GCM — authenticated encryption
scrypt — memory-hard password-based key derivation
Per-vault random salt and keys
Integrity protection (tampering invalidates the vault)

### Architecture

- Master password → derived key (KEK)
- Vault key is encrypted (wrapped) by the derived key
- Actual vault data is encrypted using the vault key
- Password changes do not require re-encrypting all data

### Runtime Protections

- Keys never stored on disk in plaintext
- Vault auto-locks on:
  -- App minimize
  -- System suspend / lock
  -- App crash or exit
- Sensitive memory is zeroed when possible
- IPC is capability-based and hardened

**⚠️ Important:**
Encryptoor does not protect against a fully compromised system (e.g. malware with OS-level access).
Security depends on the strength of your master password and your device security.

---

## 📦 Platform Support

- ✅ macOS (Intel)
- ⏳ Windows (coming soon)
- ⏳ macOS ARM64 (Apple Silicon) (coming soon)

## 🚫 What Encryptoor Is NOT

- ❌ No cloud sync
- ❌ No password recovery
- ❌ No browser integration
- ❌ No analytics or telemetry

If you forget your password, **your data cannot be recovered**.

---

## 🧪 Project Status

This is a personal / hobby project, built for learning and for a small group of trusted users.

- APIs and formats may evolve
- Backward compatibility is handled, but not guaranteed forever
- Use at your own risk

That said, the security model is intentionally conservative and inspired by real-world password managers.

## 🛠 Tech Stack

- Electron
- React
- Node.js crypto APIs
- Local file-based encrypted storage

## 📄 License

MIT
