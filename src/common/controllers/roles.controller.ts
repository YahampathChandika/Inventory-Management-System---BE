import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  @Get()
  async findAll() {
    const roles = await this.roleRepository.find({
      order: { id: 'ASC' },
    });

    return {
      success: true,
      data: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt,
      })),
    };
  }
}
