require("dotenv").config();
const { Client } = require("pg");

const config = {
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "postgres",
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
};

async function fetchUsers() {
  const client = new Client(config);
  try {
    console.log("Connecting to PostgreSQL...", {
      host: config.host,
      database: config.database,
      user: config.user,
      port: config.port,
    });
    await client.connect();

    const result = await client.query("SELECT * FROM users");
    console.log(`Fetched ${result.rowCount} users`);
    if (console.table) {
      console.table(result.rows);
    } else {
      console.log(result.rows);
    }
    return result.rows;
  } catch (err) {
    console.error("Database error:", err.message);
    throw err;
  } finally {
    try {
      await client.end();
    } catch (_) {}
  }
}

async function insert_user(user) {
  if (!user || typeof user !== "object" || Array.isArray(user)) {
    throw new Error(
      "insert_user(user): 'user' ne peut pas être null et doit être un objet"
    );
  }

  const entries = Object.entries(user).filter(([, v]) => v !== undefined);
  if (entries.length === 0) {
    throw new Error("insert_user(user): pas de données à insérer");
  }

  const idRegex = /^[a-z_][a-z0-9_]*$/i;
  const columns = entries.map(([k]) => {
    if (!idRegex.test(k)) {
      throw new Error(`nom de colonne invalide: ${k}`);
    }
    return k;
  });
  const values = entries.map(([, v]) => v);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
  const colsSql = columns.map((c) => `"${c}"`).join(", ");

  const sql = `INSERT INTO users (${colsSql}) VALUES (${placeholders}) RETURNING *`;

  const client = new Client(config);
  try {
    await client.connect();
    const result = await client.query(sql, values);
    const row = result.rows[0];
    console.log("Utilisateur inséré :", row);
    return row;
  } catch (err) {
    console.error("Erreur d'insertion :", err.message);
    throw err;
  } finally {
    try {
      await client.end();
    } catch (_) {}
  }
}

if (require.main === module) {
  const mode = process.argv[2];
  if (mode === "insert") {
    const payloadArg = process.argv[3];
    let payload;
    try {
      payload = payloadArg
        ? JSON.parse(payloadArg)
        : { name: "Matéo JOURNIAC", email: "mateo@example.com" };
    } catch (e) {
      console.error("Erreur de JSON invalide :", e.message);
      process.exit(1);
    }
    insert_user(payload)
      .then(() => fetchUsers())
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    fetchUsers()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = { fetchUsers, insert_user };
