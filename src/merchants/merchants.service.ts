import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from './entities/merchant.entity';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
import { MerchantQueryDto } from './dto/merchant-query.dto';

@Injectable()
export class MerchantsService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
  ) {}

  async findAll(query: MerchantQueryDto) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.merchantRepository
      .createQueryBuilder('merchant')
      .orderBy('merchant.createdAt', 'DESC');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(merchant.name LIKE :search OR merchant.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply status filter
    if (status) {
      const isActive = status === 'active';
      queryBuilder.andWhere('merchant.isActive = :isActive', { isActive });
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const merchants = await queryBuilder.skip(skip).take(limit).getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: merchants.map((merchant) => this.transformMerchant(merchant)),
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
    const merchant = await this.merchantRepository.findOne({
      where: { id },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    return {
      success: true,
      data: this.transformMerchant(merchant),
    };
  }

  async create(createMerchantDto: CreateMerchantDto) {
    const { name, email, isActive = true } = createMerchantDto;

    // Check if email already exists
    const existingMerchant = await this.merchantRepository.findOne({
      where: { email },
    });

    if (existingMerchant) {
      throw new ConflictException('A merchant with this email already exists');
    }

    // Create merchant
    const merchant = this.merchantRepository.create({
      name,
      email: email.toLowerCase().trim(),
      isActive,
    });

    const savedMerchant = await this.merchantRepository.save(merchant);

    return {
      success: true,
      data: this.transformMerchant(savedMerchant),
    };
  }

  async update(id: number, updateMerchantDto: UpdateMerchantDto) {
    const merchant = await this.merchantRepository.findOne({
      where: { id },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    const { name, email, isActive } = updateMerchantDto;

    // Check for email conflicts (excluding current merchant)
    if (email && email !== merchant.email) {
      const existingMerchant = await this.merchantRepository.findOne({
        where: { email: email.toLowerCase().trim() },
      });
      if (existingMerchant && existingMerchant.id !== id) {
        throw new ConflictException(
          'A merchant with this email already exists',
        );
      }
      merchant.email = email.toLowerCase().trim();
    }

    // Update other fields
    if (name !== undefined) merchant.name = name;
    if (isActive !== undefined) merchant.isActive = isActive;

    const updatedMerchant = await this.merchantRepository.save(merchant);

    return {
      success: true,
      data: this.transformMerchant(updatedMerchant),
    };
  }

  async remove(id: number) {
    const merchant = await this.merchantRepository.findOne({ where: { id } });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
    }

    await this.merchantRepository.remove(merchant);

    return {
      success: true,
      message: 'Merchant deleted successfully',
    };
  }

  async bulkImport(bulkImportDto: BulkImportDto) {
    const { emails, defaultName } = bulkImportDto;

    // Parse emails from string (split by comma, newline, or semicolon)
    const emailList = emails
      .split(/[,;\n\r]+/)
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0);

    if (emailList.length === 0) {
      throw new BadRequestException('No valid emails provided');
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails: string[] = [];
    const invalidEmails: string[] = [];

    for (const email of emailList) {
      if (emailRegex.test(email)) {
        validEmails.push(email);
      } else {
        invalidEmails.push(email);
      }
    }

    if (validEmails.length === 0) {
      throw new BadRequestException('No valid email addresses found');
    }

    // Check for existing emails
    const existingMerchants = await this.merchantRepository
      .createQueryBuilder('merchant')
      .where('merchant.email IN (:...emails)', { emails: validEmails })
      .getMany();

    const existingEmails = existingMerchants.map((m) => m.email);
    const newEmails = validEmails.filter(
      (email) => !existingEmails.includes(email),
    );

    // Create merchants for new emails
    const createdMerchants: Merchant[] = [];
    for (const email of newEmails) {
      const name = defaultName || this.generateNameFromEmail(email);
      const merchant = this.merchantRepository.create({
        name,
        email,
        isActive: true,
      });
      const saved = await this.merchantRepository.save(merchant);
      createdMerchants.push(saved);
    }

    return {
      success: true,
      data: {
        imported: createdMerchants.length,
        skipped: existingEmails.length,
        errors: invalidEmails.map((email) => `Invalid email format: ${email}`),
        merchants: createdMerchants.map((merchant) =>
          this.transformMerchant(merchant),
        ),
      },
    };
  }

  async getActiveEmails() {
    const merchants = await this.merchantRepository.find({
      where: { isActive: true },
      select: ['email'],
      order: { email: 'ASC' },
    });

    return {
      success: true,
      data: merchants.map((m) => m.email),
      count: merchants.length,
    };
  }

  async getMerchantStats() {
    const totalMerchants = await this.merchantRepository.count();
    const activeMerchants = await this.merchantRepository.count({
      where: { isActive: true },
    });
    const inactiveMerchants = await this.merchantRepository.count({
      where: { isActive: false },
    });

    return {
      success: true,
      data: {
        totalMerchants,
        activeMerchants,
        inactiveMerchants,
      },
    };
  }

  private transformMerchant(merchant: Merchant) {
    return {
      id: merchant.id,
      name: merchant.name,
      email: merchant.email,
      isActive: merchant.isActive,
      createdAt: merchant.createdAt,
      updatedAt: merchant.updatedAt,
    };
  }

  private generateNameFromEmail(email: string): string {
    // Extract name from email (part before @)
    const localPart = email.split('@')[0];

    // Convert to title case and replace dots/underscores with spaces
    const name = localPart
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    return name || 'Merchant';
  }
}
