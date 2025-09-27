import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailLogsController } from './email-logs.controller';
import { EmailLog } from './entities/email-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog])],
  controllers: [EmailLogsController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
