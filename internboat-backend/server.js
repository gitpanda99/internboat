const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
// Use process.env.PORT for deployment, fallback to 3000 for local development
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the root of your project
app.use(express.static(path.join(__dirname, '..')));

// Ensure the registrations.log file exists
const logFilePath = path.join(__dirname, 'registrations.log');
if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '', 'utf8');
}

app.post('/register', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).send('Name and Email are required.');
    }

    const registrationData = `Name: ${name}, Email: ${email}\n`;

    fs.appendFile(logFilePath, registrationData, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
            return res.status(500).send('Internal Server Error.');
        }
        console.log(`Registration successful: Name: ${name}, Email: ${email}`);
        // Redirect back to the registration form or a success page
        res.redirect('/register.html?success=true');
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});