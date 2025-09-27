import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Role } from '../common/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatusDto } from './dto/user-status.dto';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, role, status, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .orderBy('user.createdAt', 'DESC');

    // Apply filters
    if (role) {
      queryBuilder.andWhere('role.name = :role', { role });
    }

    if (status) {
      const isActive = status === 'active';
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.username LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const users = await queryBuilder.skip(skip).take(limit).getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: users.map((user) => this.transformUser(user)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: this.transformUser(user),
    };
  }

  async create(createUserDto: CreateUserDto) {
    const {
      username,
      email,
      password,
      roleId,
      isActive = true,
    } = createUserDto;

    // Check if username or email already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
    }

    // Verify role exists
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new BadRequestException('Invalid role ID');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      username,
      email,
      passwordHash,
      roleId,
      isActive,
    });

    const savedUser = await this.userRepository.save(user);

    // Fetch user with role for response
    const userWithRole = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['role'],
    });

    // Check if userWithRole is not null before passing it to transformUser
    const transformedUser = userWithRole
      ? this.transformUser(userWithRole)
      : null;

    return {
      success: true,
      data: transformedUser,
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { username, email, roleId, isActive } = updateUserDto;

    // Check for conflicts (excluding current user)
    if (username && username !== user.username) {
      const existingUser = await this.userRepository.findOne({
        where: { username },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Username already exists');
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
      user.email = email;
    }

    if (roleId && roleId !== user.roleId) {
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new BadRequestException('Invalid role ID');
      }
      user.roleId = roleId;
    }

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    const updatedUser = await this.userRepository.save(user);

    // Fetch user with updated role for response
    const userWithRole = await this.userRepository.findOne({
      where: { id: updatedUser.id },
      relations: ['role'],
    });
    const transformedUser = userWithRole
      ? this.transformUser(userWithRole)
      : null;
    return {
      success: true,
      data: transformedUser,
    };
  }

  async updateStatus(id: number, userStatusDto: UserStatusDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = userStatusDto.isActive;
    const updatedUser = await this.userRepository.save(user);

    return {
      success: true,
      data: this.transformUser(updatedUser),
    };
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting the last admin user
    if (user.roleId === 1) {
      // Assuming Admin role ID is 1
      const adminCount = await this.userRepository.count({
        where: { roleId: 1, isActive: true },
      });

      if (adminCount <= 1) {
        throw new BadRequestException(
          'Cannot delete the last active admin user',
        );
      }
    }

    await this.userRepository.remove(user);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  private transformUser(user: User) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
      },
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
