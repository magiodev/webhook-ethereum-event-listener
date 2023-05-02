require('dotenv').config(); //This isjust to load the variables in .env to local environment

const MAILGUN_API_KEY=process.env.MAILGUN_API_KEY || "PLACE_HERE_YOUR_SECRET_MAILGUN_APIKEY" //Check local .env file or login into your mailgun.com account
const MAILGUN_DOMAIN_NAME = process.env.MAILGUN_DOMAIN_NAME || "gamesforaliving.com";
const MAILGUN_API_URL= process.env.MAILGUN_API_URL|| "https://api.eu.mailgun.net/v3/gamesforaliving.com/messages"

let formData = require('form-data');
const Mailgun = require('mailgun.js'); // DOT, not DASH! that's another library!
const mailgunCurlSender = {
    init() {},
    async sendmail(from, to, subject, template, title, content) {
        let mailgun = new Mailgun(formData);
        let mg = mailgun.client({username: 'api', key: MAILGUN_API_KEY, url: MAILGUN_API_URL});
        let mailgunData = {from: from, to: to, subject: subject,  template: template, 'h:X-Mailgun-Variables':JSON.stringify({ title, content }) };
        try { let response = await mg.messages.create(MAILGUN_DOMAIN_NAME, mailgunData); console.log(response.message); }
        catch (e){ console.log(e); }
    }
}

//Exports
exports.init = ()=>{mailgunCurlSender.init();}
exports.sendmail = (from, to, subject, template, title, content)=>{mailgunCurlSender.sendmail(from, to, subject, template, title, content);}
