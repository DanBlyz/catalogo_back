import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { MarcasService } from './marcas.service.js';
import { RequirePermissions } from '../common/decorators/permissions.decorator.js';
import { FilterMarcasDto } from './dto/filter-marcas.dto.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';
import { MarcaResponseDto } from './dto/marca-response.dto.js';
import { CreateMarcaDto } from './dto/create-marca.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UpdateMarcaDto } from './dto/uptate-marca.dto.js';

@ApiTags('Marcas')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('marcas')
export class MarcasController {
    constructor(private readonly marcasService: MarcasService) { }

    @Get()
    @RequirePermissions('marcas.ver')
    @ApiOperation({ summary: 'Listar marcas con paginacion configurable y busqueda' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Listado paginado de marcas' })
    async findAll(@Query() filterDto: FilterMarcasDto): Promise<PaginatedResult<MarcaResponseDto>> {
        return this.marcasService.findAll(filterDto);
    }

    @Get(':id')
    @RequirePermissions('marcas.ver')
    @ApiOperation({ summary: 'Obtener detalle de una marca por us ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Detalle de la marca', type: MarcaResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Marca no encontrada' })
    async fidnOne(@Param('id', ParseIntPipe) id: number): Promise<MarcaResponseDto> {
        return this.marcasService.fidnOne(id);
    }

    @Post()
    @RequirePermissions('marcas.crear')
    @ApiOperation({ summary: 'Registrar una nueva marca' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Marca registrada existosamente', type: MarcaResponseDto })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Nombre ya existente' })
    async create(
        @Body() createMarcaDto: CreateMarcaDto,
        @CurrentUser('id') currentUserId: number
    ): Promise<MarcaResponseDto> {
        return this.marcasService.create(createMarcaDto, currentUserId);
    }

    @Patch(':id')
    @RequirePermissions('marcas.editar')
    @ApiOperation({ summary: 'Actualizar informacion de una marca' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Marca actulizada correctamente', type: MarcaResponseDto })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Marca no encontrada' })
    async uptade(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateMarcaDto: UpdateMarcaDto,
        @CurrentUser('id') currentUserId: number
    ): Promise<MarcaResponseDto> {
        return this.marcasService.update(id, updateMarcaDto, currentUserId);
    }

    @Delete('id')
    @RequirePermissions('marcas.eliminar')
    @ApiOperation({ summary: 'Eliminar (desactivar) una marca' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Marca eliminada exitosamente' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Marca no encontrada' })
    async remove(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') currentUserId: number,
    ): Promise<{ message: string }> {
        return this.marcasService.remove(id, currentUserId);
    }

}
