import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedAdminUser();
    await this.seedInventoryItems();
  }

  private async seedRoles() {
    const existingRoles = await this.roleRepository.count();
    if (existingRoles === 0) {
      const roles = [
        {
          name: 'Admin',
          description: 'Full system access including user management',
        },
        {
          name: 'Manager',
          description: 'Can manage inventory and send reports',
        },
        {
          name: 'Viewer',
          description: 'Can only view inventory items',
        },
      ];

      for (const roleData of roles) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
      }

      console.log('✅ Default roles created');
    }
  }

  private async seedAdminUser() {
    const existingAdmin = await this.userRepository.findOne({
      where: { email: 'admin@empite.com' },
    });

    if (!existingAdmin) {
      const adminRole = await this.roleRepository.findOne({
        where: { name: 'Admin' },
      });

      if (adminRole) {
        const hashedPassword = await bcrypt.hash('admin123', 12);

        const adminUser = this.userRepository.create({
          username: 'admin@empite.com',
          email: 'admin@empite.com',
          passwordHash: hashedPassword,
          roleId: adminRole.id,
          isActive: true,
        });

        await this.userRepository.save(adminUser);
        console.log(
          '✅ Default admin user created (admin@empite.com / admin123)',
        );
      }
    }
  }

  private async seedInventoryItems() {
    const existingItems = await this.inventoryRepository.count();
    if (existingItems === 0) {
      const adminUser = await this.userRepository.findOne({
        where: { email: 'admin@empite.com' },
      });

      if (adminUser) {
        const inventoryItems = [
          {
            name: 'Laptop Dell XPS 13',
            description:
              'High-performance ultrabook with Intel i7 processor, 16GB RAM, 512GB SSD',
            quantity: 25,
            unitPrice: 1299.99,
            sku: 'DELL-XPS13-001',
            createdById: adminUser.id,
            updatedById: adminUser.id,
          },
          {
            name: 'Wireless Mouse Logitech MX Master 3',
            description:
              'Ergonomic wireless mouse with advanced scroll wheel and precision tracking',
            quantity: 150,
            unitPrice: 89.99,
            sku: 'LOG-MX3-001',
            createdById: adminUser.id,
            updatedById: adminUser.id,
          },
          {
            name: 'Office Chair Herman Miller Aeron',
            description:
              'Ergonomic office chair with lumbar support and adjustable height',
            quantity: 12,
            unitPrice: 799.99,
            sku: 'HM-AERON-001',
            createdById: adminUser.id,
            updatedById: adminUser.id,
          },
          {
            name: 'Monitor Dell UltraSharp 27"',
            description:
              '27-inch 4K monitor with USB-C connectivity and height adjustment',
            quantity: 35,
            unitPrice: 449.99,
            sku: 'DELL-U2720Q-001',
            createdById: adminUser.id,
            updatedById: adminUser.id,
          },
          {
            name: 'Mechanical Keyboard Keychron K2',
            description:
              'Compact mechanical keyboard with RGB backlighting and wireless connectivity',
            quantity: 78,
            unitPrice: 89.99,
            sku: 'KEY-K2-RGB-001',
            createdById: adminUser.id,
            updatedById: adminUser.id,
          },
          {
            name: 'Webcam Logitech C920',
            description:
              '1080p HD webcam with auto-focus and noise-reducing microphone',
            quantity: 45,
            unitPrice: 79.99,
            sku: 'LOG-C920-001',
            createdById: adminUser.id,
            updatedById: adminUser.id,
          },
          {
            name: 'Desk Lamp IKEA FORSÅ',
            description: 'Adjustable desk lamp with LED bulb and flexible arm',
            quantity: 8,
            unitPrice: 19.99,
            sku: 'IKEA-FORSA-001',
            createdById: adminUser.id,
            updatedById: adminUser.id,
          },
          {
            name: 'USB-C Hub Anker PowerExpand',
            description:
              '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader, and power delivery',
            quantity: 5,
            unitPrice: 49.99,
            sku: 'ANK-PE7-001',
            createdById: adminUser.id,
            updatedById: adminUser.id,
          },
          {
            name: 'Wireless Headphones Sony WH-1000XM4',
            description:
              'Noise-canceling wireless headphones with 30-hour battery life',
            quantity: 0,
            unitPrice: 349.99,
            sku: 'SONY-WH1000XM4-001',
            createdById: adminUser.id,
            updatedById: adminUser.id,
          },
          {
            name: 'Standing Desk Converter VARIDESK',
            description:
              'Height-adjustable desk converter for ergonomic standing workspace',
            quantity: 3,
            unitPrice: 299.99,
            sku: 'VARI-CONV-001',
            createdById: adminUser.id,
            updatedById: adminUser.id,
          },
        ];

        for (const itemData of inventoryItems) {
          const item = this.inventoryRepository.create(itemData);
          await this.inventoryRepository.save(item);
        }

        console.log('✅ Sample inventory items created');
      }
    }
  }
}
