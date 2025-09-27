import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // All authenticated users can view inventory
  @Get()
  findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  // All authenticated users can view single item
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('Manager', 'Admin')
  getStats() {
    return this.inventoryService.getInventoryStats();
  }

  @Get('low-stock')
  @UseGuards(RolesGuard)
  @Roles('Manager', 'Admin')
  getLowStockItems(@Query('threshold') threshold?: number) {
    return this.inventoryService.getLowStockItems(threshold);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  // Only Manager+ can create inventory items
  @Post()
  @UseGuards(RolesGuard)
  @Roles('Manager', 'Admin')
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.create(createInventoryDto, user.userId);
  }

  // Only Manager+ can update inventory items
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('Manager', 'Admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.update(id, updateInventoryDto, user.userId);
  }

  // Only Manager+ can update quantity
  @Patch(':id/quantity')
  @UseGuards(RolesGuard)
  @Roles('Manager', 'Admin')
  updateQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuantityDto: UpdateQuantityDto,
    @CurrentUser() user: any,
  ) {
    return this.inventoryService.updateQuantity(
      id,
      updateQuantityDto,
      user.userId,
    );
  }

  // Only Manager+ can delete inventory items
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('Manager', 'Admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }
}
