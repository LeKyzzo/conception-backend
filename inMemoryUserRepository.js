const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const BCRYPT_ROUNDS = 10;

const registeredUsers = [
  {
    id: "u-alice",
    email: "alice@example.com",
    password: "alicepwd",
    fullName: "Alice Liddel",
  },
  {
    id: "u-bob",
    email: "bob@example.com",
    password: "bobpwd",
    fullName: "Bob Builder",
  },
  {
    id: "u-charlie",
    email: "charlie@example.com",
    password: "charliepwd",
    fullName: "Charlie Bucket",
  },
];

let nextUserIndex = registeredUsers.length + 1;

function ensureHashed(password) {
  if (!password) return password;
  if (password.startsWith("$2a$") || password.startsWith("$2b$")) {
    return password;
  }
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

for (let i = 0; i < registeredUsers.length; i += 1) {
  const user = registeredUsers[i];
  registeredUsers[i] = {
    ...user,
    password: ensureHashed(user.password),
  };
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

function getRegisteredUsers() {
  return registeredUsers.map(sanitizeUser);
}

function findUserByEmail(email) {
  if (!email) return null;
  return registeredUsers.find(
    (candidate) => candidate.email.toLowerCase() === email.toLowerCase()
  );
}

function checkCredentials(email, password) {
  const user = findUserByEmail(email);
  if (!user) return { ok: false, reason: "UNKNOWN_USER" };
  const passwordMatches = bcrypt.compareSync(String(password), user.password);
  if (!passwordMatches) {
    return { ok: false, reason: "INVALID_PASSWORD" };
  }
  return { ok: true, user: sanitizeUser(user) };
}

function newUserRegistered({ email, password, fullName = "" }) {
  if (!email || !password) {
    return { ok: false, reason: "INVALID_INPUT" };
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = findUserByEmail(normalizedEmail);
  if (existing) {
    return { ok: false, reason: "EMAIL_ALREADY_USED" };
  }

  const user = {
    id: `u-${nextUserIndex++}`,
    email: normalizedEmail,
    password: ensureHashed(String(password)),
    fullName: fullName || normalizedEmail,
  };
  registeredUsers.push(user);
  return { ok: true, user: sanitizeUser(user) };
}

function issueToken() {
  return crypto.randomBytes(16).toString("hex");
}

module.exports = {
  getRegisteredUsers,
  checkCredentials,
  issueToken,
  newUserRegistered,
};
