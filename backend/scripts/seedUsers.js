require('dotenv').config();

const bcrypt = require('bcrypt');
const db = require('')  //PUT KARAHS DB CONNECTION IN HERE

async function seed() {
    const users = [
        { username: 'hr_admin', password: 'ChangeMe123!', role: 'hr', employeeId: null },
    { username: 'jsmith', password: 'ChangeMe123!', role: 'employee', employeeId: 1 },
    // add more test accounts as needed
    ];

    for (const u of users) {
        const hash = await bcrypt.hash(u.password, 10);
        await db.query(
            'INSERT INTO users (username, password_hash, role, employeeId) VALUES (?, ?, ?, ?)',
            [u.username, hash, u.role, u.employeeId]
        );
        console.log(`Created User:  ${u.username}`)
    }
    process.exit();
}

seed();