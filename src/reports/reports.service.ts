import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { MerchantsService } from '../merchants/merchants.service';
import { EmailService } from '../email/email.service';
import { SendReportDto } from '../email/dto/send-report.dto';
import {
  generateInventoryReportHtml,
  InventoryReportData,
} from '../email/templates/inventory-report.template';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    private merchantsService: MerchantsService,
    private emailService: EmailService,
  ) {}

  async getInventoryReportData(format: 'json' | 'csv' = 'json') {
    const items = await this.inventoryRepository
      .createQueryBuilder('item')
      .select(['item.name', 'item.quantity', 'item.sku', 'item.unitPrice'])
      .orderBy('item.name', 'ASC')
      .getMany();

    const reportData = items.map((item) => ({
      itemName: item.name,
      quantity: item.quantity,
      sku: item.sku || 'N/A',
      unitPrice: item.unitPrice || 0,
    }));

    if (format === 'csv') {
      const csvHeader = 'Item Name,Quantity,SKU,Unit Price\n';
      const csvData = reportData
        .map(
          (item) =>
            `"${item.itemName}",${item.quantity},"${item.sku}",${item.unitPrice}`,
        )
        .join('\n');

      return {
        success: true,
        data: csvHeader + csvData,
        format: 'csv',
      };
    }

    return {
      success: true,
      data: reportData,
      format: 'json',
    };
  }

  async sendInventoryReport(sendReportDto: SendReportDto, sentById: number) {
    const { recipients, subject, customMessage } = sendReportDto;

    // Get inventory data for the report
    const inventoryData = await this.getInventoryReportData('json');

    if (!inventoryData.success) {
      throw new Error('Failed to generate inventory report data');
    }

    // Ensure we have array data (not CSV string)
    if (typeof inventoryData.data === 'string') {
      throw new Error('Invalid data format for email template');
    }

    // Prepare template data
    const templateData: InventoryReportData = {
      items: inventoryData.data.map((item) => ({
        name: item.itemName,
        quantity: item.quantity,
        sku: item.sku,
        unitPrice: item.unitPrice,
      })),
      generatedAt: new Date().toLocaleString(),
      customMessage,
    };

    // Generate HTML content
    const htmlContent = generateInventoryReportHtml(templateData);

    // Prepare email subject
    const emailSubject =
      subject || `Inventory Report - ${new Date().toLocaleDateString()}`;

    // Send emails asynchronously (individual emails, no CC/BCC)
    const bulkResult = await this.emailService.sendBulkEmails(
      recipients,
      emailSubject,
      htmlContent,
      sentById,
    );

    // Generate job ID for tracking (in real app, this would be from a job queue)
    const jobId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      data: {
        jobId,
        recipientCount: recipients.length,
        totalSent: bulkResult.totalSent,
        totalFailed: bulkResult.totalFailed,
        estimatedTime: `${recipients.length * 0.1} seconds`,
        results: bulkResult.results,
      },
    };
  }

  async sendToAllActiveMerchants(
    subject?: string,
    customMessage?: string,
    sentById: number = 1, // Default to admin user ID if not provided
  ) {
    // Get all active merchant emails
    const merchantsResult = await this.merchantsService.getActiveEmails();

    if (!merchantsResult.success || merchantsResult.data.length === 0) {
      throw new Error('No active merchants found');
    }

    const sendReportDto: SendReportDto = {
      recipients: merchantsResult.data,
      subject,
      customMessage,
    };

    return this.sendInventoryReport(sendReportDto, sentById);
  }

  async getReportStats() {
    const totalItems = await this.inventoryRepository.count();

    // Count low stock items (quantity < 10)
    const lowStockItems = await this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.quantity < :threshold', { threshold: 10 })
      .getCount();

    // Get active merchants count
    const merchantsResult = await this.merchantsService.getMerchantStats();
    const activeMerchants = merchantsResult.success
      ? merchantsResult.data.activeMerchants
      : 0;

    return {
      success: true,
      data: {
        totalItems,
        lowStockItems,
        activeMerchants,
        lastReportGenerated: new Date().toISOString(),
      },
    };
  }
}
