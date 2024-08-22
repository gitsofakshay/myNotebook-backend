const express = require('express');
const connectToMongo = require('./db');
const cors = require('cors');
require('dotenv').config();

connectToMongo();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors())
app.use(cors({ origin: 'https://mynotebookoncloud.netlify.app' }));

app.use(express.json());

//Available rutes
app.use('/api/auth', require('./routes/authentication.js'));
app.use('/api/notes', require('./routes/notes.js'));
app.use('/api/forgetpwd', require('./routes/forgetpassword.js'));
// Keep-alive endpoint
app.get('/api/keep-alive', (req, res) => {
  res.status(200).json({ message: 'Server is alive' });
});

app.listen(port, () => {
  console.log(`myNotebook Server is running on http://localhost:${port}`);
});
