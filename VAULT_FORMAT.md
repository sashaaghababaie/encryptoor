# Vault File Format

Encryptoor uses a JSON-based encrypted vault format.

---

## High-Level Structure

```json
{
  "magic": "ENCRYPTOOR",
  "schemaVersion": 1, // integer
  "appVersion": , // semver 1.xx.xx
  "header": { ... },
  "protected": { ... },
  "data": { ... }
}
```

## Sections

### magic

Identifies the file as an Encryptoor vault and prevents accidental parsing.

### schemaVersion

Vault format version for migrations.

### appVersion

App version for migrations and backward compatibility check.

### header (plaintext)

- Metadata only
- No secrets
- Includes KDF parameters and timestamps

### protected (encrypted)

- Encrypted vault key
- Protected by password-derived key (KEK)

### data (encrypted)

- Actual vault entries
- Encrypted with vault key

### Security Properties

- Tampering invalidates authentication tags
- Wrong password cannot decrypt vault key
- Password change does not require re-encrypting all data
