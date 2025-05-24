const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Client } = require('pg'); // <-- ADD THIS for PostgreSQL client
require('dotenv').config(); // <-- ADD THIS for local .env file

const app = express();
const PORT = process.env.PORT || 3000;

// --- PostgreSQL Connection ---
// Use an environment variable for your PostgreSQL URI.
// For local testing, ensure your .env file has DATABASE_URL.
// For Render deployment, you will set this as an environment variable on Render.
const DATABASE_URL = process.env.DATABASE_URL;

// Create a new pg Client instance
const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { // Required for Render's PostgreSQL connection
        rejectUnauthorized: false
    }
});

// Connect to the database
client.connect()
    .then(() => {
        console.log('PostgreSQL connected successfully!');
        // Create a table if it doesn't exist
        return client.query(`
            CREATE TABLE IF NOT EXISTS registrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    })
    .then(() => console.log('Registrations table checked/created.'))
    .catch(err => console.error('PostgreSQL connection or table creation error:', err));
// --------------------------

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const pathToStaticFiles = path.join(__dirname, '..');

app.get('/', (req, res) => {
    console.log('GET / request received. Sending intro.html');
    res.sendFile(path.join(pathToStaticFiles, 'intro.html'), (err) => {
        if (err) {
            console.error('Error sending intro.html:', err);
            res.status(500).send('<h1>Error loading page.</h1><p>Please try again later.</p>');
        }
    });
});

app.use(express.static(pathToStaticFiles));

// Remove any fs.appendFile or fs.existsSync related to registrations.log
// as data will now be stored in the database.

app.post('/register', async (req, res) => { // Made function async
    const { name, email } = req.body;

    if (!name || !email) {
        console.warn('Registration attempt with missing name or email.');
        return res.status(400).send('Name and Email are required.');
    }

    try {
        const query = `
            INSERT INTO registrations(name, email)
            VALUES($1, $2)
            ON CONFLICT (email) DO NOTHING
            RETURNING *;
        `; // ON CONFLICT DO NOTHING will prevent duplicate emails if email is UNIQUE
        const values = [name, email];

        const result = await client.query(query, values); // <-- Store in DB

        if (result.rowCount > 0) {
            console.log(`Registration successful: Name: ${name}, Email: ${email}`);
            res.send('<h1>Registration Successful!</h1><p>Thank you for registering. You can go back to the <a href="/">home page</a>.</p>');
        } else {
            console.warn(`Attempt to register duplicate email: ${email}`);
            res.status(409).send('Email already registered.'); // 409 Conflict for duplicate
        }

    } catch (error) {
        console.error('Error saving registration to database:', error);
        res.status(500).send('Internal Server Error during registration.');
    }
});

// Add a simple route to view registrations (for testing/learning)
app.get('/view-registrations', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM registrations ORDER BY registered_at DESC;');
        let html = '<h1>All Registrations</h1><ul>';
        result.rows.forEach(reg => {
            html += `<li>Name: ${reg.name}, Email: ${reg.email}, Registered: ${reg.registered_at}</li>`;
        });
        html += '</ul><p><a href="/">Back to Home</a></p>';
        res.send(html);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).send('Error fetching registrations from database.');
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});