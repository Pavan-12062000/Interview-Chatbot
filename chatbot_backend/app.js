const express = require('express');
const https = require('https'); // Import the HTTPS module
const http = require('http'); // Import the HTTP module for redirection
const fs = require('fs'); // File system module for reading key and certificate
const cors = require('cors');
const router = require('./src/routes/router.js');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: 'http://localhost:3000', // Adjust based on your frontend's URL
        optionsSuccessStatus: 200,
    })
);
app.use('/', router);

// Load SSL certificate and private key
const privateKey = fs.readFileSync('', 'utf8'); // Path to private-key.pem
const certificate = fs.readFileSync('', 'utf8'); // Path to certificate.pem

const credentials = { key: privateKey, cert: certificate };

// Start HTTP server to redirect traffic to HTTPS
const HTTP_PORT = 80; // Standard HTTP port
http.createServer((req, res) => {
    const host = req.headers.host.split(':')[0]; // Extract the hostname
    res.writeHead(301, { Location: `https://${host}${req.url}` }); // Redirect to HTTPS
    res.end();
}).listen(HTTP_PORT, () => {
    console.log(`HTTP Server is redirecting traffic to HTTPS`);
});

// Start HTTPS server
const HTTPS_PORT = process.env.PORT || 8080; // Standard HTTPS port or custom port
https.createServer(credentials, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
});
