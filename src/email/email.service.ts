import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailLog, EmailStatus } from './entities/email-log.entity';
import { EmailConfig, EmailSendResult } from './interfaces/email.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private emailConfig: EmailConfig;
  private isProductionMode: boolean;

  constructor(
    private configService: ConfigService,
    @InjectRepository(EmailLog)
    private emailLogRepository: Repository<EmailLog>,
  ) {
    this.initializeEmailConfig();
  }

  private initializeEmailConfig() {
    this.emailConfig = {
      apiKey: this.configService.get('BREVO_API_KEY') || 'development_mode',
      senderEmail:
        this.configService.get('BREVO_SENDER_EMAIL') ||
        'noreply@yourdomain.com',
      senderName:
        this.configService.get('BREVO_SENDER_NAME') || 'Inventory System',
    };

    // Check if we're in production mode with real API key
    this.isProductionMode =
      this.emailConfig.apiKey !== 'development_mode' &&
      this.emailConfig.apiKey !== 'your_brevo_api_key_here' &&
      this.configService.get('NODE_ENV') === 'production';

    if (!this.isProductionMode) {
      this.logger.warn(
        'Email service running in DEVELOPMENT MODE - emails will be logged only',
      );
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    sentById: number,
  ): Promise<EmailSendResult> {
    // Create email log entry
    const emailLog = this.emailLogRepository.create({
      recipientEmail: to,
      subject,
      content: htmlContent,
      status: EmailStatus.PENDING,
      sentById,
    });

    const savedLog = await this.emailLogRepository.save(emailLog);

    try {
      if (this.isProductionMode) {
        // TODO: Implement actual Brevo API call here
        throw new Error('Production email sending not implemented yet');
      } else {
        // Development mode: simulate email sending
        this.logger.log(`📧 SIMULATED EMAIL SENT:`);
        this.logger.log(`   To: ${to}`);
        this.logger.log(`   Subject: ${subject}`);
        this.logger.log(
          `   From: ${this.emailConfig.senderName} <${this.emailConfig.senderEmail}>`,
        );
        this.logger.log(`   Content Length: ${htmlContent.length} characters`);

        // Simulate processing time
        await this.delay(200);
      }

      // Update email log on success
      savedLog.status = EmailStatus.SENT;
      savedLog.sentAt = new Date();
      await this.emailLogRepository.save(savedLog);

      const messageId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      // Update email log on failure
      savedLog.status = EmailStatus.FAILED;
      await this.emailLogRepository.save(savedLog);

      this.logger.error(`Failed to send email to ${to}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendBulkEmails(
    recipients: string[],
    subject: string,
    htmlContent: string,
    sentById: number,
  ): Promise<{
    totalSent: number;
    totalFailed: number;
    results: Array<{ email: string; success: boolean; error?: string }>;
  }> {
    const results: Array<{ email: string; success: boolean; error?: string }> =
      [];
    let totalSent = 0;
    let totalFailed = 0;

    this.logger.log(
      `📧 Starting bulk email send to ${recipients.length} recipients`,
    );

    // Send emails individually (no CC/BCC as required)
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail(
          recipient,
          subject,
          htmlContent,
          sentById,
        );

        if (result.success) {
          totalSent++;
          results.push({ email: recipient, success: true });
        } else {
          totalFailed++;
          results.push({
            email: recipient,
            success: false,
            error: result.error,
          });
        }

        // Add small delay to avoid overwhelming the system
        await this.delay(100);
      } catch (error) {
        totalFailed++;
        results.push({
          email: recipient,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.logger.log(
      `📧 Bulk email completed: ${totalSent} sent, ${totalFailed} failed`,
    );

    return {
      totalSent,
      totalFailed,
      results,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getEmailLogs(
    page: number = 1,
    limit: number = 10,
    status?: EmailStatus,
    dateFrom?: Date,
    dateTo?: Date,
  ) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.emailLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.sentBy', 'user')
      .leftJoinAndSelect('user.role', 'role')
      .orderBy('log.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('log.status = :status', { status });
    }

    if (dateFrom) {
      queryBuilder.andWhere('log.createdAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('log.createdAt <= :dateTo', { dateTo });
    }

    const total = await queryBuilder.getCount();
    const logs = await queryBuilder.skip(skip).take(limit).getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: logs.map((log) => ({
        id: log.id,
        recipientEmail: log.recipientEmail,
        subject: log.subject,
        status: log.status,
        sentBy: {
          id: log.sentBy.id,
          username: log.sentBy.username,
        },
        sentAt: log.sentAt,
        createdAt: log.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getEmailLogById(id: number) {
    const log = await this.emailLogRepository.findOne({
      where: { id },
      relations: ['sentBy', 'sentBy.role'],
    });

    if (!log) {
      return { success: false, error: 'Email log not found' };
    }

    return {
      success: true,
      data: {
        id: log.id,
        recipientEmail: log.recipientEmail,
        subject: log.subject,
        content: log.content,
        status: log.status,
        sentBy: {
          id: log.sentBy.id,
          username: log.sentBy.username,
          role: log.sentBy.role.name,
        },
        sentAt: log.sentAt,
        createdAt: log.createdAt,
      },
    };
  }
}
