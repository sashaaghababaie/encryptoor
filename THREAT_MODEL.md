# Threat Model

This document explains what Encryptoor protects against and what it does not.

---

## Assets

- Vault data (credentials and secure notes)
- Master password
- Derived encryption keys

---

## Trusted Components

- Local operating system
- Electron main process
- Node.js crypto APIs

---

## Adversaries

### Considered

- Offline attacker with access to vault file
- Curious user attempting to modify vault contents
- Accidental corruption or crashes

### Not Considered

- Active malware
- Memory scraping tools
- Root / kernel-level attackers
- Remote attackers (no network exposure)

---

## Security Goals

- Confidentiality of stored data
- Integrity of vault file
- Resistance to brute-force attacks
- Safe failure modes (no silent corruption)

---

## Non-Goals

- Cloud synchronization
- Password recovery
- Enterprise-grade endpoint protection

---

## Design Philosophy

Encryptoor favors:

- Simplicity over complexity
- Explicit user responsibility
- Transparent local-only security
