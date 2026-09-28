const { Client } = require('pg');

const candidates = [
  'postgres',
  'admin',
  'root',
  '1234',
  '123456',
  '12345678',
  'password',
  'cafeaura',
  'cafe_aura',
  'Cafeaura123',
  'postgres123',
  'postgre',
  ''
];

async function tryPassword(pass) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: pass,
    port: 5432,
    connectionTimeoutMillis: 2000,
  });

  try {
    await client.connect();
    console.log(`SUCCESS! Password is: "${pass}"`);
    const res = await client.query('SELECT datname FROM pg_database');
    console.log('Databases found:', res.rows.map(r => r.datname));
    await client.end();
    return pass;
  } catch (err) {
    try { await client.end(); } catch (e) {}
    return null;
  }
}

async function run() {
  console.log('Testing passwords against localhost:5432...');
  for (const pass of candidates) {
    const success = await tryPassword(pass);
    if (success !== null) {
      console.log(`FOUND_MATCH: ${success}`);
      process.exit(0);
    }
  }
  console.log('No common password matched.');
}

run();
