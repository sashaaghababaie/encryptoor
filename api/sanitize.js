const MAX_LEN = 4096;

function isString(v) {
  return typeof v === "string" && v.length >= 0 && v.length <= MAX_LEN;
}

function isTimestamp(v) {
  return Number.isInteger(v) && v > 0;
}

function sanitizeString(v) {
  return v.trim();
}

function sanitizeLoginEntry(input) {
  if (!input || typeof input !== "object") return null;

  if (
    !isString(input.id) ||
    !isString(input.title) ||
    !isString(input.username) ||
    !isString(input.password) ||
    !isString(input.website) ||
    !isTimestamp(input.createdAt) ||
    !isTimestamp(input.updatedAt)
  ) {
    return null;
  }

  return {
    id: sanitizeString(input.id),
    type: "login",
    title: sanitizeString(input.title),
    username: sanitizeString(input.username),
    website: sanitizeString(input.website),
    password: input.password,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

function sanitizeNoteEntry(input) {
  if (!input || typeof input !== "object") return null;

  if (
    !isString(input.id) ||
    !isString(input.title) ||
    !isString(input.note) ||
    !isTimestamp(input.createdAt) ||
    !isTimestamp(input.updatedAt)
  ) {
    return null;
  }

  return {
    id: sanitizeString(input.id),
    type: "note",
    title: sanitizeString(input.title),
    note: input.note,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

function sanitizeEntry(input) {
  if ("password" in input && "username" in input) {
    return sanitizeLoginEntry(input);
  }

  if ("note" in input) {
    return sanitizeNoteEntry(input);
  }

  return null;
}

module.exports = { sanitizeEntry };
