require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../config/db');

async function fixPasswords() {
  // Give each account a real password for testing — team should agree on these
  const accounts = [
    { email: 'lungile.moyo@moderntech.com', password: 'HrAdmin123!' },
    { email: 'sibongile.nkosi@moderntech.com', password: 'Manager123!' },
    { email: 'thabo.molefe@moderntech.com', password: 'Employee123!' },
    { email: 'keshav.naidoo@moderntech.com', password: 'Employee123!' },
    { email: 'zanele.khumalo@moderntech.com', password: 'Employee123!' },
    { email: 'sipho.zulu@moderntech.com', password: 'Employee123!' },
    { email: 'naledi.moeketsi@moderntech.com', password: 'Employee123!' },
    { email: 'farai.gumbo@moderntech.com', password: 'Employee123!' },
    { email: 'karabo.dlamini@moderntech.com', password: 'Employee123!' },
    { email: 'fatima.patel@moderntech.com', password: 'Employee123!' },
  ];

  for (const acc of accounts) {
    const hash = await bcrypt.hash(acc.password, 10);
    await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [hash, acc.email]);
    console.log(`Updated password for ${acc.email}`);
  }
  process.exit();
}

fixPasswords();