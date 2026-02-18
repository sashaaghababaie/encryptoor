# Security Policy

Encryptoor is a local, offline-first encrypted vault.  
Security is a primary design goal, but this project is maintained as a hobby project.

---

## Threat Model Summary

Encryptoor is designed to protect against:

- Accidental data exposure
- Disk theft / lost device (with strong password)
- Offline brute-force attacks
- Vault file tampering or corruption

Encryptoor does NOT protect against:

- Malware running with user or admin privileges
- Keyloggers
- Compromised operating systems
- Physical attacks on unlocked devices

---

## Cryptography

- AES-256-GCM for authenticated encryption
- scrypt for password-based key derivation
- Per-vault random salt and keys
- Integrity validation on every decrypt

All cryptography uses well-established primitives provided by Node.js.

---

## Reporting Vulnerabilities

If you discover a security issue:

- Please **do not open a public issue**
- Contact the maintainer privately

Since this is a hobby project, response time is best-effort.

---

## Disclaimer

This software is provided **as-is**, without warranty of any kind.  
Use at your own risk.
