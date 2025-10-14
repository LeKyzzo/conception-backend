require('dotenv').config();
const { Client } = require('pg');

const config = {
	host: process.env.PGHOST || 'localhost',
	database: process.env.PGDATABASE || 'postgres',
	user: process.env.PGUSER || 'postgres',
	password: process.env.PGPASSWORD || '',
	port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
};

async function fetchUsers() {
	const client = new Client(config);
	try {
		console.log('Connecting to PostgreSQL...', {
			host: config.host,
			database: config.database,
			user: config.user,
			port: config.port,
		});
		await client.connect();

		const result = await client.query('SELECT * FROM users');
		console.log(`Fetched ${result.rowCount} users`);
		if (console.table) {
			console.table(result.rows);
		} else {
			console.log(result.rows);
		}
		return result.rows;
	} catch (err) {
		console.error('Database error:', err.message);
		throw err;
	} finally {
		try { await client.end(); } catch (_) {}
	}
}

if (require.main === module) {
	fetchUsers()
		.then(() => process.exit(0))
		.catch(() => process.exit(1));
}

module.exports = { fetchUsers };

