const { Client } = require('pg');

async function checkDatabases() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'shivarth',
    port: 5432,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');
    const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
    console.log('Available databases:', res.rows.map(r => `"${r.datname}"`));
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    try { await client.end(); } catch(e){}
  }
}

checkDatabases();
