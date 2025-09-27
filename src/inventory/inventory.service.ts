import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThan } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async findAll(query: InventoryQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      lowStock,
      sort = 'createdAt',
      order = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.createdBy', 'creator')
      .leftJoinAndSelect('item.updatedBy', 'updater')
      .leftJoinAndSelect('creator.role', 'creatorRole')
      .leftJoinAndSelect('updater.role', 'updaterRole');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(item.name LIKE :search OR item.description LIKE :search OR item.sku LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply low stock filter
    if (lowStock) {
      queryBuilder.andWhere('item.quantity < :lowStockThreshold', {
        lowStockThreshold: 10,
      });
    }

    // Apply sorting
    const validSortFields = [
      'name',
      'quantity',
      'unitPrice',
      'createdAt',
      'updatedAt',
    ];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`item.${sortField}`, sortOrder);

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    const items = await queryBuilder.skip(skip).take(limit).getMany();

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: items.map((item) => this.transformInventoryItem(item)),
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
    const item = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'createdBy.role', 'updatedBy.role'],
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    return {
      success: true,
      data: this.transformInventoryItem(item),
    };
  }

  async create(createInventoryDto: CreateInventoryDto, userId: number) {
    const { name, description, quantity, unitPrice, sku } = createInventoryDto;

    // Check if name already exists
    const existingByName = await this.inventoryRepository.findOne({
      where: { name },
    });
    if (existingByName) {
      throw new ConflictException('An item with this name already exists');
    }

    // Check if SKU already exists (if provided)
    if (sku) {
      const existingBySku = await this.inventoryRepository.findOne({
        where: { sku },
      });
      if (existingBySku) {
        throw new ConflictException('An item with this SKU already exists');
      }
    }

    // Create inventory item
    const inventoryItem = this.inventoryRepository.create({
      name,
      description,
      quantity,
      unitPrice,
      sku,
      createdById: userId,
      updatedById: userId,
    });

    const savedItem = await this.inventoryRepository.save(inventoryItem);

    // Fetch item with relations for response
    const itemWithRelations = await this.inventoryRepository.findOne({
      where: { id: savedItem.id },
      relations: ['createdBy', 'updatedBy', 'createdBy.role', 'updatedBy.role'],
    });

    // Add null check here
    if (!itemWithRelations) {
      throw new NotFoundException('Failed to retrieve created inventory item');
    }

    return {
      success: true,
      data: this.transformInventoryItem(itemWithRelations),
    };
  }

  async update(
    id: number,
    updateInventoryDto: UpdateInventoryDto,
    userId: number,
  ) {
    const item = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'createdBy.role', 'updatedBy.role'],
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    const { name, description, quantity, unitPrice, sku } = updateInventoryDto;

    // Check for name conflicts (excluding current item)
    if (name && name !== item.name) {
      const existingByName = await this.inventoryRepository.findOne({
        where: { name },
      });
      if (existingByName && existingByName.id !== id) {
        throw new ConflictException('An item with this name already exists');
      }
      item.name = name;
    }

    // Check for SKU conflicts (excluding current item)
    if (sku !== undefined) {
      if (sku && sku !== item.sku) {
        const existingBySku = await this.inventoryRepository.findOne({
          where: { sku },
        });
        if (existingBySku && existingBySku.id !== id) {
          throw new ConflictException('An item with this SKU already exists');
        }
      }
      item.sku = sku;
    }

    // Update other fields
    if (description !== undefined) item.description = description;
    if (quantity !== undefined) item.quantity = quantity;
    if (unitPrice !== undefined) item.unitPrice = unitPrice;

    // Update metadata
    item.updatedById = userId;

    const updatedItem = await this.inventoryRepository.save(item);

    // Fetch updated item with relations
    const itemWithRelations = await this.inventoryRepository.findOne({
      where: { id: updatedItem.id },
      relations: ['createdBy', 'updatedBy', 'createdBy.role', 'updatedBy.role'],
    });

    // Add null check here
    if (!itemWithRelations) {
      throw new NotFoundException('Failed to retrieve updated inventory item');
    }

    return {
      success: true,
      data: this.transformInventoryItem(itemWithRelations),
    };
  }

  async updateQuantity(
    id: number,
    updateQuantityDto: UpdateQuantityDto,
    userId: number,
  ) {
    const item = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'createdBy.role', 'updatedBy.role'],
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    // Update only quantity and metadata
    item.quantity = updateQuantityDto.quantity;
    item.updatedById = userId;

    const updatedItem = await this.inventoryRepository.save(item);

    // Fetch updated item with relations
    const itemWithRelations = await this.inventoryRepository.findOne({
      where: { id: updatedItem.id },
      relations: ['createdBy', 'updatedBy', 'createdBy.role', 'updatedBy.role'],
    });

    // Add null check here
    if (!itemWithRelations) {
      throw new NotFoundException('Failed to retrieve updated inventory item');
    }

    return {
      success: true,
      data: this.transformInventoryItem(itemWithRelations),
    };
  }

  async remove(id: number) {
    const item = await this.inventoryRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    await this.inventoryRepository.remove(item);

    return {
      success: true,
      message: 'Inventory item deleted successfully',
    };
  }

  async search(query: string, limit: number = 10) {
    if (!query || query.trim().length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const items = await this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.createdBy', 'creator')
      .leftJoinAndSelect('item.updatedBy', 'updater')
      .where(
        '(item.name LIKE :query OR item.description LIKE :query OR item.sku LIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('item.name', 'ASC')
      .take(limit)
      .getMany();

    return {
      success: true,
      data: items.map((item) => this.transformInventoryItem(item)),
    };
  }

  async getLowStockItems(threshold: number = 10) {
    const items = await this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.createdBy', 'creator')
      .leftJoinAndSelect('item.updatedBy', 'updater')
      .where('item.quantity < :threshold', { threshold })
      .orderBy('item.quantity', 'ASC')
      .getMany();

    return {
      success: true,
      data: items.map((item) => this.transformInventoryItem(item)),
      count: items.length,
    };
  }

  async getInventoryStats() {
    const totalItems = await this.inventoryRepository.count();
    const lowStockItems = await this.inventoryRepository.count({
      where: { quantity: LessThan(10) },
    });
    const outOfStockItems = await this.inventoryRepository.count({
      where: { quantity: 0 },
    });

    const totalValueResult = await this.inventoryRepository
      .createQueryBuilder('item')
      .select('SUM(item.quantity * item.unitPrice)', 'totalValue')
      .getRawOne();

    return {
      success: true,
      data: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue: parseFloat(totalValueResult.totalValue) || 0,
      },
    };
  }

  private transformInventoryItem(item: InventoryItem) {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      sku: item.sku,
      createdBy: {
        id: item.createdBy.id,
        username: item.createdBy.username,
      },
      updatedBy: {
        id: item.updatedBy.id,
        username: item.updatedBy.username,
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
