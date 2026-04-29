import nodemailer from "nodemailer";

const readEnv = (...names: string[]) => {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
};

const host = readEnv("SMTP_HOST", "EMAIL_HOST");
const port = parseInt(readEnv("SMTP_PORT", "EMAIL_PORT") || "587", 10);
const secureValue = readEnv("SMTP_SECURE", "EMAIL_SECURE");
const user = readEnv("SMTP_USER", "EMAIL_USER");
const pass = readEnv("SMTP_PASS", "EMAIL_PASS");
const fromAddress = readEnv("SMTP_FROM", "EMAIL_FROM", "SMTP_USER", "EMAIL_USER");

const secure =
  secureValue !== undefined
    ? secureValue.toLowerCase() === "true"
    : port === 465;

const transporter =
  host && user && pass
    ? nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        logger: true,
        debug: true,
      })
    : null;

export const sendPasswordResetCodeEmail = async (email: string, code: string) => {
  if (!transporter || !fromAddress) {
    console.warn(`SMTP is not configured. Password reset code for ${email}: ${code}`);
    return false;
  }

  await transporter.sendMail({
    from: `"Can I eat this?" <${fromAddress}>`,
    to: email,
    subject: "รหัสยืนยันสำหรับรีเซ็ตรหัสผ่าน",
    text: `รหัสยืนยันสำหรับรีเซ็ตรหัสผ่านของคุณคือ ${code} รหัสจะหมดอายุภายใน 15 นาที`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>สวัสดี,</p>
        <p>รหัสยืนยันสำหรับรีเซ็ตรหัสผ่านของคุณคือ</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>รหัสนี้จะหมดอายุภายใน 15 นาที</p>
        <p>หากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยอีเมลฉบับนี้</p>
      </div>
    `,
  });

  return true;
};
