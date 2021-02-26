import * as Bucket from "@spica-devkit/bucket";
const nodemailer = require("nodemailer");

export default async function(change) {

    console.log("Sending a mail. Parameters are: ", change);

    let buckets = {
        templates: process.env.TEMPLATES_BUCKET_ID,
    };

    Bucket.initialize({ apikey: process.env.MAILER_API_KEY });
    let template = await Bucket.data.getAll(buckets.templates, {
        queryParams: { filter: `template=='${change.current.template}'` }
    });
    template = template[0];

    let content = template.content;
    let variables = JSON.parse(change.current.variables);
    let emails = change.current.emails;

    for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
    }
    if (emails.length) {
        for (let email of emails) {
            _sendEmail(email,template.subject,content)
        }
    }
}

function _sendEmail(email, subject, message) {
    var transporter = nodemailer.createTransport({
        direct: true,
        host: "smtp.yandex.com",
        port: 465,
        auth: {
            user: "noreply@spicaengine.com",
            pass: "Dream_Har14"
        },
        secure: true
    });

    var mailOptions = {
        from: "noreply@spicaengine.com",
        to: email,
        subject: subject,
        html:
            "<html><head><meta http-equiv='Content-Type' content='text/plain'></head><body><table style='width: 100%;background-color:rgb(233,233,233);font-family: arial'><tr><td>" +
            message +
            "</td></tr></table></body></html>"
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
}
