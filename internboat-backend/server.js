const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true })); // Use extended:true, as discussed
app.use(bodyParser.json()); // Add this for good measure if you ever send JSON

// Define the absolute path to the project root for serving static files
const projectRoot = path.join(__dirname, '..');
app.use(express.static(projectRoot)); // Serve static files from the project root

// --- IMPORTANT CHANGE HERE ---
// Handle the GET request to the root path ('/')
app.get('/', (req, res) => {
    // We want to serve intro.html as the landing page
    res.sendFile(path.join(projectRoot, 'intro.html'));
});

// Ensure the registrations.log file exists (optional, but good for first run)
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
        // You might want to redirect to a confirmation page or back to intro.html
        // For now, let's redirect to a simple success message or the intro page
        res.send('<h1>Registration Successful!</h1><p>Thank you for registering. You can go back to the <a href="/">home page</a>.</p>');
        // Or if you want to redirect to the intro page:
        // res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});