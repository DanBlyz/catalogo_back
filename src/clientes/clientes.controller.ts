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
import { ClientesService } from './clientes.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';
import { FilterClientesDto } from './dto/filter-clientes.dto.js';
import { ClienteResponseDto } from './dto/cliente-response.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../common/decorators/permissions.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';

@ApiTags('Clientes')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  @RequirePermissions('clientes.ver')
  @ApiOperation({ summary: 'Listar clientes con paginación configurable y búsqueda' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado paginado de clientes' })
  async findAll(@Query() filterDto: FilterClientesDto): Promise<PaginatedResult<ClienteResponseDto>> {
    return this.clientesService.findAll(filterDto);
  }

  @Get(':id')
  @RequirePermissions('clientes.ver')
  @ApiOperation({ summary: 'Obtener detalle de un cliente por su ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detalle del cliente', type: ClienteResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cliente no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ClienteResponseDto> {
    return this.clientesService.findOne(id);
  }

  @Post()
  @RequirePermissions('clientes.crear')
  @ApiOperation({ summary: 'Registrar un nuevo cliente' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Cliente registrado exitosamente', type: ClienteResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Cédula/NIT/RUC ya existente' })
  async create(
    @Body() createClienteDto: CreateClienteDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<ClienteResponseDto> {
    return this.clientesService.create(createClienteDto, currentUserId);
  }

  @Patch(':id')
  @RequirePermissions('clientes.editar')
  @ApiOperation({ summary: 'Actualizar información de un cliente' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cliente actualizado exitosamente', type: ClienteResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cliente no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<ClienteResponseDto> {
    return this.clientesService.update(id, updateClienteDto, currentUserId);
  }

  @Delete(':id')
  @RequirePermissions('clientes.eliminar')
  @ApiOperation({ summary: 'Eliminar (desactivar) un cliente' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cliente eliminado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cliente no encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') currentUserId: number,
  ): Promise<{ message: string }> {
    return this.clientesService.remove(id, currentUserId);
  }
}
