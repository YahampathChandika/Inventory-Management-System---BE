import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailQueryDto } from './dto/email-query.dto';
import { EmailStatus } from './entities/email-log.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('email-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Manager', 'Admin')
export class EmailLogsController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  getEmailLogs(@Query() query: EmailQueryDto) {
    const { page, limit, status, dateFrom, dateTo } = query;

    return this.emailService.getEmailLogs(
      page,
      limit,
      status as EmailStatus,
      dateFrom ? new Date(dateFrom) : undefined,
      dateTo ? new Date(dateTo) : undefined,
    );
  }

  @Get(':id')
  getEmailLog(@Param('id', ParseIntPipe) id: number) {
    return this.emailService.getEmailLogById(id);
  }
}
