const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (though we'll use absolute path for the main file)
const staticPath = path.join(__dirname, '..');
app.use(express.static(staticPath));

// Handle the GET request to the root path ('/') using an absolute path
app.get('/', (req, res) => {
    res.sendFile('register.html', { root: staticPath });
});

app.post('/register', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;

    console.log(`Received registration data - Name: ${name}, Email: ${email}`);

    const registrationData = `Name: ${name}, Email: ${email}\n`;
    fs.appendFile(path.join(__dirname, 'registrations.log'), registrationData, (err) => {
        if (err) {
            console.error('Error saving registration:', err);
            res.status(500).send('Error saving registration data.');
        } else {
            console.log('Registration data saved to registrations.log');
            res.send('Registration successful!');
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});