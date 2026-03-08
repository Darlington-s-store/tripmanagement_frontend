require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const client = new Client({ connectionString: process.env.DATABASE_URL });

client.connect().then(() => {
    bcrypt.hash('Admin123!', 10).then(hash => {
        client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'admin@tripease.com'])
            .then(res => { console.log('Updated'); client.end(); })
            .catch(err => { console.error(err); client.end(); });
    });
});
