import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SendReportDto } from '../email/dto/send-report.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Manager', 'Admin')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('inventory')
  getInventoryData(@Query('format') format?: 'json' | 'csv') {
    return this.reportsService.getInventoryReportData(format);
  }

  @Get('stats')
  getReportStats() {
    return this.reportsService.getReportStats();
  }

  @Post('send-inventory')
  sendInventoryReport(
    @Body() sendReportDto: SendReportDto,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.sendInventoryReport(sendReportDto, user.userId);
  }

  @Post('send-to-all-merchants')
  sendToAllMerchants(
    @Body() body: { subject?: string; customMessage?: string },
    @CurrentUser() user: any,
  ) {
    return this.reportsService.sendToAllActiveMerchants(
      body.subject,
      body.customMessage,
      user.userId, // Pass the user ID properly
    );
  }
}
