const ERRORS = {
  INVALIT_ENTRY: "Invalid entry data",
  NOT_INITIALIZED: "The vault is not initialized.",
  NO_FILE_BUT_BACKUP_FOUND: "Backup vault found.",
  INVALID_VAULT: "The vault is tampered or deleted.",
  UNAUTHORIZED: "You cannot access the vault.",
  WRONG_PASSWORD: "Wrong Password.",
  RATE_LIMIT: (time) => `Please wait ${time} and try agian.`,
  DISK_FULL: "Devices's disk is full, Operation failed.",
  PERMISSION_DENIED: "Encyptoor is not allowed to wrtie the disk.",
};

module.exports = { ERRORS };
