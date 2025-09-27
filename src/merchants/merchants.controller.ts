import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { BulkImportDto } from './dto/bulk-import.dto';
import { MerchantQueryDto } from './dto/merchant-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('merchants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Manager', 'Admin') // Only Manager+ can access merchant management
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get()
  findAll(@Query() query: MerchantQueryDto) {
    return this.merchantsService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.merchantsService.getMerchantStats();
  }

  @Get('active-emails')
  getActiveEmails() {
    return this.merchantsService.getActiveEmails();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.merchantsService.findOne(id);
  }

  @Post()
  create(@Body() createMerchantDto: CreateMerchantDto) {
    return this.merchantsService.create(createMerchantDto);
  }

  @Post('bulk-import')
  bulkImport(@Body() bulkImportDto: BulkImportDto) {
    return this.merchantsService.bulkImport(bulkImportDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMerchantDto: UpdateMerchantDto,
  ) {
    return this.merchantsService.update(id, updateMerchantDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.merchantsService.remove(id);
  }
}
