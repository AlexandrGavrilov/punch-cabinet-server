const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const nodemailer = require("nodemailer");

const auth = require("../midlewares/auth");

const db = require("../db/connect");

const randomInt = require("../utils/randomInt");

router.post("/register", auth, async (req, res) => {
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

        return res.status(201).json(user);
    } catch (e) {
        console.log(e);
        res.status(500).send('Unknown error')
    }

});

router.post("/login", auth, async (req, res) => {
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

router.post("/verify", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(409).send('Email is required');
        }

        const code = randomInt();

        let transporter = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log(transporter)



        // const s = await transporter.verify();
        // console.log(s, 'ererer');

        let info = await transporter.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>',
            to: "gavrilov.alex.official@gmail.com",
            subject: "Hello ✔",
            text: "Hello world?" + code,
            html: "<b>Hello world?</b>",
        });
        console.log(info, 'QWEQWE')



        // const dbConnect = db.getDb();
        // const EmailsVerify = await dbConnect.collection('emails_verifys');
        // await EmailsVerify.insertOne({ code, email })
    } catch (e) {
        console.log(e)
        res.status(500).send('Unknown error')
    }
})

module.exports = router;