import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity'; // Add this
import { RolesController } from './controllers/roles.controller';
import { DatabaseSeederService } from '../config/database-seeder.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Role, User, InventoryItem])], // Add InventoryItem here
  controllers: [RolesController],
  providers: [DatabaseSeederService],
  exports: [TypeOrmModule],
})
export class CommonModule {}
