const crypto = require("crypto");

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
  if (user.password !== password) {
    return { ok: false, reason: "INVALID_PASSWORD" };
  }
  return { ok: true, user: sanitizeUser(user) };
}

function issueToken() {
  return crypto.randomBytes(16).toString("hex");
}

module.exports = {
  getRegisteredUsers,
  checkCredentials,
  issueToken,
};
