const express = require('express');
const app = express();
const cors = require('cors');
const router = require('./src/routes/router.js')


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:4200',
    optionsSuccessStatus:200
}))
app.use('/', router);

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });