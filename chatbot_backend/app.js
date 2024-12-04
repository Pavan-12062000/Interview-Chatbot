// Uncomment from line 2 to 43 to run the server with HTTPS and comment out the rest of the code

// const express = require('express');
// const https = require('https'); // Import the HTTPS module
// const http = require('http'); // Import the HTTP module for redirection
// const fs = require('fs'); // File system module for reading key and certificate
// const cors = require('cors');
// const router = require('./src/routes/router.js');

// const app = express();

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(
//     cors({
//         origin: 'https://localhost:3000', // Adjust based on your frontend's URL
//         optionsSuccessStatus: 200,
//     })
// );

// app.use('/', router);

// // Load SSL certificate and private key
// const privateKey = fs.readFileSync('.././certificates/private-key.pem', 'utf8'); // Path to private-key.pem
// const certificate = fs.readFileSync('.././certificates/certificate.pem', 'utf8'); // Path to certificate.pem

// const credentials = { key: privateKey, cert: certificate };

// // Start HTTP server to redirect traffic to HTTPS
// const HTTP_PORT = 80; // Standard HTTP port
// http.createServer((req, res) => {
//     const host = req.headers.host.split(':')[0]; // Extract the hostname
//     res.writeHead(301, { Location: `https://${host}${req.url}` }); // Redirect to HTTPS
//     res.end();
// }).listen(HTTP_PORT, () => {
//     console.log(`HTTP Server is redirecting traffic to HTTPS`);
// });

// // Start HTTPS server
// const HTTPS_PORT = process.env.PORT || 8080; // Standard HTTPS port or custom port
// https.createServer(credentials, app).listen(HTTPS_PORT, () => {
//     console.log(`HTTPS Server is running on port ${HTTPS_PORT}`);
// });




//Uncomment the code below to run the server with HTTP and comment out the code above

const express = require('express');
const app = express();
const cors = require('cors');
const router = require('./src/routes/router.js')


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}))
app.use('/', router);

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});