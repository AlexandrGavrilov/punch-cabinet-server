require('dotenv').config();
const express = require("express");
const cors = require('cors');
const db = require("./db/connect");
const auth = require("./controllers/auth");

db.connectToServer(() => {});

const app = express();
const jsonParser = express.json();

app.use(cors());
app.use(jsonParser);

app.use('/api/auth', auth)

app.listen(3001, () => {
    console.log(`Example app listening at http://localhost:${3001}`)
})