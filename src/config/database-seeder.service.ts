import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../common/entities/role.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedAdminUser();
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
}
