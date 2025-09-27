import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { EmailLog } from '../email/entities/email-log.entity';
import { RolesController } from './controllers/roles.controller';
import { DatabaseSeederService } from '../config/database-seeder.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Role, User, InventoryItem, Merchant, EmailLog]),
  ],
  controllers: [RolesController],
  providers: [DatabaseSeederService],
  exports: [TypeOrmModule],
})
export class CommonModule {}
