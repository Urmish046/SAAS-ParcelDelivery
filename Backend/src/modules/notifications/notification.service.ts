import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config'; 

@Injectable()
export class NotificationService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER'), 
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  @OnEvent('parcel.status_changed')
  async handleParcelStatusChange(payload: { trackingId: string, status: string, email: string }) {
    
    const senderEmail = this.configService.get<string>('SMTP_FROM');

    const mailOptions = {
      from: `"Skylarks Freight" <${senderEmail}>`,
      to: payload.email,
      subject: `Parcel Update: ${payload.status.toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Good News!</h2>
          <p>Your parcel with Tracking ID <strong>${payload.trackingId}</strong> has been updated to: <strong>${payload.status.replace(/_/g, ' ')}</strong>.</p>
          <p>Please log in to your Customer Portal to view more details or take action.</p>
          <br/>
          <p>Regards,<br/>Skylarks Freight Team</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${payload.email}`);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }
}