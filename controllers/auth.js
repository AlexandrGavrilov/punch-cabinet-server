const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const authMiddleware = require('../middlewares/auth')
const mailer = require('../services/mailer');

const db = require("../db/connect");

const randomInt = require("../utils/randomInt");

router.post("/register", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!(email && password && name)) {
            return res.status(400).send('name, email and password is required')
        }
        const dbConnect = db.getDb();
        const Users = await dbConnect.collection("users");

        const oldUser = await Users.findOne({ email });

        if (oldUser) {
            return res.status(409).send('email already exists')
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const user = await Users.insertOne({
            name,
            email: email.toLowerCase(),
            password: encryptedPassword,
        });

        user.token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,

        );

        user.password = undefined;

        return res.status(201).json(user);
    } catch (e) {
        console.log(e);
        res.status(500).send('Unknown error')
    }

});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email && password)) {
            return res.status(400).send('email and password is required')
        }
        const dbConnect = db.getDb();
        const Users = await dbConnect.collection("users");

        const user = await Users.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {
            user.token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,

            );
            user.password = undefined;
            return res.status(201).json(user);

        }

        return res.status(409).send('Invalid credentials')
    } catch (e) {
        res.status(500).send('Unknown error')
    }

});

router.get('/token', authMiddleware, async (req, res) => {
    try {
        console.log(req.user, 'wwwwwwww')
        const { email } = req.user;

        const dbConnect = db.getDb();

        const Users = await dbConnect.collection("users");

        const user = await Users.findOne({ email });

        if (!user) {
            res.status(404).send('token is invalid');
        }

        user.password = undefined;

        res.status(201).send(user)

    } catch (e) {
        res.status(500).send('Unknown error')
    }
    console.log(req.user)
})

router.post("/verify", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).send('Email is required');
        }
        const dbConnect = db.getDb();

        const Users = await dbConnect.collection("users");

        const oldUser = await Users.findOne({ email });

        if (oldUser) {
            return res.status(409).send('email already exists')
        }

        const EmailsVerify = await dbConnect.collection('emails_verifys');

        const user = await EmailsVerify.findOne({ email });

        const code = randomInt();

        let info = await mailer.send({
            to: email,
            subject: "Hello ✔",
            html: `<b>Your verification code ${code}</b>`,
        });

        if (user) {
            await EmailsVerify.update({ _id: user._id }, { $set: { code }});
        } else {
            await EmailsVerify.insertOne({ code, email, isVerified: false });
        }

        return res.status(200).send('code has been sent')

    } catch (e) {
        console.log(e)
        res.status(500).send('Unknown error')
    }
})

router.post('/confirm-verify', async (req, res) => {
    try {
        const { code, email } = req.body;

        if (!(code && email)) {
            return res.status(400).send('Email and code is required');
        }

        const dbConnect = db.getDb();

        const EmailsVerify = await dbConnect.collection('emails_verifys');
        const user = await EmailsVerify.findOne({ email });

        if (!user) {
            return res.status(400).send('User is not defined');
        }

        if (code === user.code) {
            EmailsVerify.update({ _id: user._id }, { $set: { isVerified: true }});
            return res.status(201).send('Confirmed')
        }

        return res.status(409).send('Not valid code')
    } catch (e) {
        res.status(500).send('Unknown error')
    }
})


module.exports = router;