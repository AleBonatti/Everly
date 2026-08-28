import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
});

export async function sendEmail(options: { to: string; subject: string; html: string }) {
    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: emailTemplate(options.html),
    });
    console.log('sendMail info:', info);
}

function emailTemplate(bodyHtml: string) {
    const logoUrl = `${process.env.APP_URL}/everly-logo-email.png`;

    return `
<!doctype html>
<html>
  <body style="margin:0; padding:0; background-color:#0e0a07; font-family:Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0e0a07; padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#1e1815; border-radius:16px; overflow:hidden;">
            <tr>
              <td align="center" style="padding:32px 32px 24px;">
                <img src="${logoUrl}" alt="Everly" width="140" style="display:block; width:140px; height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px; color:#e8e2d9; font-size:15px; line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; border-top:1px solid #332a22; color:#9c9086; font-size:12px; text-align:center;">
                © ${new Date().getFullYear()} Everly. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
