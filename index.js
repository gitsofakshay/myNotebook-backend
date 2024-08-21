const express = require('express');
const connectToMongo = require('./db');
const cors = require('cors');
connectToMongo();
const app = express();
const port = 5000;
 
app.use(cors())

app.use(express.json());

//Available rutes
app.use('/api/auth', require('./routes/authentication.js'));
app.use('/api/notes', require('./routes/notes.js'));
app.use('/api/forgetpwd', require('./routes/forgetpassword.js'));

app.listen(port, () => {
  console.log(`myNotebook Server is running on http://localhost:${port}`);
});
