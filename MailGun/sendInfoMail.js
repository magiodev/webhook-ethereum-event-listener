//MAIL NOTIFICATIONS CONFIG
const MailSender = require("./inc/mailgunCurlSender");

const myprog = {
  async sendInfoMail(template_title, template_content, from, to, subject) {
    const template = process.env.MAILGUN_TEMPLATE || "devloginfo";
    await MailSender.sendmail(
      from,
      to,
      subject,
      template,
      template_title,
      template_content
    );
  },
};
let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours().toString().padStart(2, "0");
let minutes = date_ob.getMinutes().toString().padStart(2, "0");
let seconds = date_ob.getSeconds().toString().padStart(2, "0");

let from = process.env.MAILGUN_FROM || "Dev Mail <devmail@gamesforaliving.com>";
let to = process.env.MAILGUN_TO || "cricharte@g4al.com";
let subject =
  "Cristian notifier feature sent on " +
  year +
  "-" +
  month +
  "-" +
  date +
  "at " +
  hours +
  ":" +
  minutes +
  ":" +
  seconds; // prints date in YYYY-MM-DD hh:mm:ss format,

// let res = myprog.sendInfoMail(
//   "Hola - holita",
//   "Dijo flanders",
//   from,
//   to,
//   subject
// );
// console.log(res);

module.exports = { myprog };
