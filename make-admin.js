require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function makeAdmin(email) {
  if (!email) {
    console.error("Please provide an email address: node make-admin.js <email>");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    const result = await client.query('UPDATE "User" SET role = $1 WHERE email = $2 RETURNING *', ['SUPER_ADMIN', email]);

    if (result.rowCount === 0) {
      console.error(`User with email ${email} not found in the database. Please sign up normally first.`);
    } else {
      console.log(`Success! ${email} has been promoted to SUPER_ADMIN.`);
      console.log(`You can now log in at /admin/login with this account.`);
    }
  } catch (error) {
    console.error("Error updating user:", error);
  } finally {
    await client.end();
  }
}

makeAdmin(process.argv[2]);
