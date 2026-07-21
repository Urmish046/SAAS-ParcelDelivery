import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendParcelStatusEmail(toEmail: string, trackingId: string, newStatus: string, companyName: string) {
    try {
      await this.transporter.sendMail({
        from: `"${companyName} Support" <${process.env.SMTP_FROM}>`,
        to: toEmail,
        subject: `Status Update for Parcel: ${trackingId}`,
        text: `Your parcel ${trackingId} has been updated to: ${newStatus}.`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #333;">Parcel Update</h2>
            <p>Your parcel with tracking ID <strong>${trackingId}</strong> is now <strong>${newStatus.replace(/_/g, ' ').toUpperCase()}</strong>.</p>
            <p>Please log in to your dashboard to view more details.</p>
            <br/>
            <p style="font-size: 12px; color: #888;">Powered by ${companyName}</p>
          </div>
        `,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to send notification email');
    }
  }
}