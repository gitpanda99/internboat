const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path'); // Make sure path is required

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware order matters!
// Parse URL-encoded bodies (for form data)
app.use(bodyParser.urlencoded({ extended: true }));
// Parse JSON bodies (good practice, might not be needed for your current forms)
app.use(bodyParser.json());

// Define the base directory for your static files.
// '__dirname' is '/opt/render/project/src/internboat-backend' on Render
// 'path.join(__dirname, '..')' resolves to '/opt/render/project/src/' (your repo root)
const pathToStaticFiles = path.join(__dirname, '..');

// Serve your main landing page (intro.html) for the root URL explicitly
app.get('/', (req, res) => {
    console.log('GET / request received. Sending intro.html');
    res.sendFile(path.join(pathToStaticFiles, 'intro.html'), (err) => {
        if (err) {
            console.error('Error sending intro.html:', err);
            res.status(500).send('<h1>Error loading page.</h1><p>Please try again later.</p>');
        }
    });
});

// After the specific root route, serve all other static files.
// This allows requests like /boat.html, /register.html, /logo.png etc.
app.use(express.static(pathToStaticFiles));

// Ensure the registrations.log file exists (important for initial deployments)
const logFilePath = path.join(__dirname, 'registrations.log');
// Check if the file exists. If not, create it synchronously.
if (!fs.existsSync(logFilePath)) {
    try {
        fs.writeFileSync(logFilePath, '', 'utf8');
        console.log('registrations.log created successfully.');
    } catch (createErr) {
        console.error('Failed to create registrations.log:', createErr);
        // Depending on importance, you might want to exit or log a critical error
    }
} else {
    console.log('registrations.log already exists.');
}

// Handle POST requests for registration
app.post('/register', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        console.warn('Registration attempt with missing name or email.');
        return res.status(400).send('Name and Email are required.');
    }

    const registrationData = `Name: ${name}, Email: ${email}\n`;

    fs.appendFile(logFilePath, registrationData, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
            return res.status(500).send('Internal Server Error.');
        }
        console.log(`Registration successful: Name: ${name}, Email: ${email}`);
        // Send a success message, you can later redirect to a dedicated success page
        res.send('<h1>Registration Successful!</h1><p>Thank you for registering. You can go back to the <a href="/">home page</a>.</p>');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});