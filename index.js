const express = require('express');
// const axios = require('axios');
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
