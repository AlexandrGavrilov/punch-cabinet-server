const mailer = require('@sendgrid/mail')

mailer.setApiKey(process.env.SG_MAIL_TOKEN);

class Mailer {
    sender = process.env.SG_MAIL_SENDER;

    constructor() {
    }

    async send({ from, to, subject, text, html }) {
        return await  mailer.send({
            from: from || this.sender,
            to,
            subject,
            text,
            html,
        })
    }
}

module.exports = new Mailer();