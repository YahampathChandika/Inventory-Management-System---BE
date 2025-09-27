import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Role } from '../common/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { EmailLog } from '../email/entities/email-log.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get('DB_HOST'),
  port: +configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [Role, User, InventoryItem, Merchant, EmailLog],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  extra: {
    connectionLimit: 10,
  },
});
