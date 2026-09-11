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
import { SucursalesService } from './sucursales.service.js';
import { CreateSucursalDto } from './dto/create-sucursal.dto.js';
import { UpdateSucursalDto } from './dto/update-sucursal.dto.js';
import { FilterSucursalesDto } from './dto/filter-sucursales.dto.js';
import { SucursalResponseDto } from './dto/sucursal-response.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../common/decorators/permissions.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';

@ApiTags('Sucursales')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('sucursales')
export class SucursalesController {
  constructor(private readonly sucursalesService: SucursalesService) {}

  @Get()
  @RequirePermissions('sucursales.ver')
  @ApiOperation({
    summary: 'Listar sucursales con paginación configurable o listado completo con all=true',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado de sucursales' })
  async findAll(
    @Query() filterDto: FilterSucursalesDto,
  ): Promise<PaginatedResult<SucursalResponseDto> | SucursalResponseDto[]> {
    return this.sucursalesService.findAll(filterDto);
  }

  @Get(':id')
  @RequirePermissions('sucursales.ver')
  @ApiOperation({ summary: 'Obtener detalle de una sucursal por su ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalle de la sucursal',
    type: SucursalResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sucursal no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SucursalResponseDto> {
    return this.sucursalesService.findOne(id);
  }

  @Post()
  @RequirePermissions('sucursales.crear')
  @ApiOperation({ summary: 'Registrar una nueva sucursal' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sucursal registrada exitosamente',
    type: SucursalResponseDto,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'El nombre de la sucursal ya existe' })
  async create(
    @Body() createSucursalDto: CreateSucursalDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<SucursalResponseDto> {
    return this.sucursalesService.create(createSucursalDto, currentUserId);
  }

  @Patch(':id')
  @RequirePermissions('sucursales.editar')
  @ApiOperation({ summary: 'Actualizar información de una sucursal' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sucursal actualizada exitosamente',
    type: SucursalResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sucursal no encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSucursalDto: UpdateSucursalDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<SucursalResponseDto> {
    return this.sucursalesService.update(id, updateSucursalDto, currentUserId);
  }

  @Delete(':id')
  @RequirePermissions('sucursales.eliminar')
  @ApiOperation({ summary: 'Eliminar (desactivar) una sucursal' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sucursal eliminada exitosamente' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'No se puede eliminar la sucursal principal' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Sucursal no encontrada' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') currentUserId: number,
  ): Promise<{ message: string }> {
    return this.sucursalesService.remove(id, currentUserId);
  }
}
