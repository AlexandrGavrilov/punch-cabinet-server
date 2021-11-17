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

app.listen(8080, () => {
    console.log(`app listening at http://localhost:${8080}`)
})