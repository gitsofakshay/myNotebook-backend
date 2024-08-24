const express = require('express');
const axios = require('axios');
const connectToMongo = require('./db');
const cors = require('cors');
require('dotenv').config();

connectToMongo();
const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: 'https://mynotebookoncloud.netlify.app', // Netlify frontend URL
  methods: 'GET,POST,PUT,DELETE', // Allowed methods
  allowedHeaders: 'Content-Type,Authorization', // Allowed headers
  credentials: true // Enable credentials (cookies, etc.)
};

app.use(cors(corsOptions)); // Apply CORS settings
app.use(express.json());

function keepAlive() {
    const backendUrl = `${process.env.BACKEND_URL}/keep-alive`;
    axios.get(backendUrl)
        .then(response => {
            console.log('Server is alive:', response.status);
        })
        .catch(error => {
            console.error('Error keeping the server alive:', error.message);
        });
}

// Keep server alive between 8 AM to 8 PM IST
setInterval(() => {
    const now = new Date();
    const hours = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)).getHours();
    if (hours >= 12 && hours < 25) {
        keepAlive();
    }
}, 600000); // 10-minute interval

//Available rutes
app.use('/api/auth', require('./routes/authentication.js'));
app.use('/api/notes', require('./routes/notes.js'));
app.use('/api/forgetpwd', require('./routes/forgetpassword.js'));

// Keep-alive endpoint
app.get('/keep-alive', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`myNotebook Server is running on http://localhost:${port}`);
});
