import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductosService } from './productos.service.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { FilterProductosDto } from './dto/filter-productos.dto.js';
import { ProductoResponseDto } from './dto/producto-response.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../common/decorators/permissions.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';

@ApiTags('Productos')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  @RequirePermissions('productos.ver')
  @ApiOperation({
    summary: 'Listar productos con paginación configurable, filtros relacionales o modo select con all=true',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado de productos' })
  async findAll(
    @Query() filterDto: FilterProductosDto,
  ): Promise<PaginatedResult<ProductoResponseDto> | ProductoResponseDto[]> {
    return this.productosService.findAll(filterDto);
  }

  @Get('codigo/:codigo')
  @RequirePermissions('productos.ver')
  @ApiOperation({
    summary: 'Búsqueda rápida de producto por código de barras o SKU (ideal para escáneres POS)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto encontrado',
    type: ProductoResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Producto no encontrado' })
  async findByCodigo(@Param('codigo') codigo: string): Promise<ProductoResponseDto> {
    return this.productosService.findByCodigo(codigo);
  }

  @Get(':id')
  @RequirePermissions('productos.ver')
  @ApiOperation({ summary: 'Obtener detalle completo de un producto por su ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalle del producto con existencias por sucursal',
    type: ProductoResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Producto no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductoResponseDto> {
    return this.productosService.findOne(id);
  }

  @Post()
  @RequirePermissions('productos.crear')
  @ApiOperation({ summary: 'Registrar un nuevo producto en el catálogo' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Producto registrado exitosamente',
    type: ProductoResponseDto,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Código de barras o SKU ya existente' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Categoría, marca o proveedor no existe' })
  async create(
    @Body() createProductoDto: CreateProductoDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<ProductoResponseDto> {
    return this.productosService.create(createProductoDto, currentUserId);
  }

  @Patch(':id')
  @RequirePermissions('productos.editar')
  @ApiOperation({ summary: 'Actualizar información o precios de un producto' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto actualizado exitosamente',
    type: ProductoResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Producto no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductoDto: UpdateProductoDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<ProductoResponseDto> {
    return this.productosService.update(id, updateProductoDto, currentUserId);
  }

  @Delete(':id')
  @RequirePermissions('productos.eliminar')
  @ApiOperation({ summary: 'Eliminar (desactivar) un producto del catálogo' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Producto eliminado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Producto no encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') currentUserId: number,
  ): Promise<{ message: string }> {
    return this.productosService.remove(id, currentUserId);
  }
}
