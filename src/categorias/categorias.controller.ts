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
import { CategoriasService } from './categorias.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
import { FilterCategoriasDto } from './dto/filter-categorias.dto.js';
import { CategoriaResponseDto } from './dto/categoria-response.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../common/decorators/permissions.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';

@ApiTags('Categorías')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  @RequirePermissions('categorias.ver')
  @ApiOperation({
    summary: 'Listar categorías con paginación configurable o listado completo con all=true',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado de categorías' })
  async findAll(
    @Query() filterDto: FilterCategoriasDto,
  ): Promise<PaginatedResult<CategoriaResponseDto> | CategoriaResponseDto[]> {
    return this.categoriasService.findAll(filterDto);
  }

  @Get(':id')
  @RequirePermissions('categorias.ver')
  @ApiOperation({ summary: 'Obtener detalle de una categoría por su ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalle de la categoría',
    type: CategoriaResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Categoría no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<CategoriaResponseDto> {
    return this.categoriasService.findOne(id);
  }

  @Post()
  @RequirePermissions('categorias.crear')
  @ApiOperation({ summary: 'Registrar una nueva categoría' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Categoría registrada exitosamente',
    type: CategoriaResponseDto,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'El nombre de categoría ya existe' })
  async create(
    @Body() createCategoriaDto: CreateCategoriaDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<CategoriaResponseDto> {
    return this.categoriasService.create(createCategoriaDto, currentUserId);
  }

  @Patch(':id')
  @RequirePermissions('categorias.editar')
  @ApiOperation({ summary: 'Actualizar información de una categoría' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categoría actualizada exitosamente',
    type: CategoriaResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Categoría no encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<CategoriaResponseDto> {
    return this.categoriasService.update(id, updateCategoriaDto, currentUserId);
  }

  @Delete(':id')
  @RequirePermissions('categorias.eliminar')
  @ApiOperation({ summary: 'Eliminar (desactivar) una categoría' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Categoría eliminada exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Categoría no encontrada' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') currentUserId: number,
  ): Promise<{ message: string }> {
    return this.categoriasService.remove(id, currentUserId);
  }
}
