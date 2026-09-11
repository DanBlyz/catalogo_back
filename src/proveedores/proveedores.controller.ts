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
import { ProveedoresService } from './proveedores.service.js';
import { CreateProveedorDto } from './dto/create-proveedor.dto.js';
import { UpdateProveedorDto } from './dto/update-proveedor.dto.js';
import { FilterProveedoresDto } from './dto/filter-proveedores.dto.js';
import { ProveedorResponseDto } from './dto/proveedor-response.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../common/decorators/permissions.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';

@ApiTags('Proveedores')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Get()
  @RequirePermissions('proveedores.ver')
  @ApiOperation({
    summary: 'Listar proveedores con paginación configurable o listado completo con all=true',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado de proveedores' })
  async findAll(
    @Query() filterDto: FilterProveedoresDto,
  ): Promise<PaginatedResult<ProveedorResponseDto> | ProveedorResponseDto[]> {
    return this.proveedoresService.findAll(filterDto);
  }

  @Get(':id')
  @RequirePermissions('proveedores.ver')
  @ApiOperation({ summary: 'Obtener detalle de un proveedor por su ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalle del proveedor',
    type: ProveedorResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Proveedor no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProveedorResponseDto> {
    return this.proveedoresService.findOne(id);
  }

  @Post()
  @RequirePermissions('proveedores.crear')
  @ApiOperation({ summary: 'Registrar un nuevo proveedor' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Proveedor registrado exitosamente',
    type: ProveedorResponseDto,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'El NIT/RUC ya existe' })
  async create(
    @Body() createProveedorDto: CreateProveedorDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<ProveedorResponseDto> {
    return this.proveedoresService.create(createProveedorDto, currentUserId);
  }

  @Patch(':id')
  @RequirePermissions('proveedores.editar')
  @ApiOperation({ summary: 'Actualizar información de un proveedor' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Proveedor actualizado exitosamente',
    type: ProveedorResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Proveedor no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProveedorDto: UpdateProveedorDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<ProveedorResponseDto> {
    return this.proveedoresService.update(id, updateProveedorDto, currentUserId);
  }

  @Delete(':id')
  @RequirePermissions('proveedores.eliminar')
  @ApiOperation({ summary: 'Eliminar (desactivar) un proveedor' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Proveedor eliminado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Proveedor no encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') currentUserId: number,
  ): Promise<{ message: string }> {
    return this.proveedoresService.remove(id, currentUserId);
  }
}
