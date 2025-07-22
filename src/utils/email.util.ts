import config from "config";
import nodemailer from "nodemailer";
import pug from "pug";
import { convert } from "html-to-text";
import fs from "fs";
import path from "path";

import { User } from "../entities/user.entity";

const smtp = config.get<{
  host: string;
  port: number;
  user: string;
  pass: string;
}>("smtp");

export default class Email {
  private firstName: string;
  private to: string;
  private from: string;

  constructor(private user: User, private url: string) {
    this.firstName = user.firstName;
    this.to = user.email;
    this.from = `EJARALUX <${config.get<string>("emailFrom")}>`;
  }

  private async newTransport() {
    const transport = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    try {
      await transport.verify();
      return transport;
    } catch (error) {
      console.error("❌ SMTP verification failed:", error);
      throw new Error("Failed to initialize email transport");
    }
  }

  private async send(template: string, subject: string) {
    const templatePath = path.join(__dirname, "..", "views", `${template}.pug`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Pug template not found: ${templatePath}`);
    }

    try {
      const html = pug.renderFile(templatePath, {
        firstName: this.firstName,
        subject,
        url: this.url,
      });

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        text: convert(html),
        html,
      };

      const transporter = await this.newTransport();
      const info = await transporter.sendMail(mailOptions);

      console.log("📨 Email sent:", info.messageId);
      console.log("📬 Preview URL:", nodemailer.getTestMessageUrl(info));
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      throw new Error("Failed to send email");
    }
  }

  async sendVerificationCode() {
    await this.send("verificationLink", "Your account verification link");
  }

  async sendPasswordResetToken() {
    await this.send(
      "resetPasswordLink",
      "Your password reset link (valid for only 10 minutes)"
    );
  }
}
