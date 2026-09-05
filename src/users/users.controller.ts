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
import { UsersService } from './users.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { FilterUsersDto } from './dto/filter-users.dto.js';
import { AssignPermissionsDto } from './dto/assign-permissions.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { RequirePermissions } from '../common/decorators/permissions.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';

@ApiTags('Usuarios')
@ApiBearerAuth('JWT-auth')
@UseGuards(RolesGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('usuarios.ver')
  @ApiOperation({ summary: 'Listar usuarios con paginación configurable y filtros de búsqueda' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Listado paginado de usuarios' })
  async findAll(@Query() filterDto: FilterUsersDto): Promise<PaginatedResult<UserResponseDto>> {
    return this.usersService.findAll(filterDto);
  }

  @Get(':id')
  @RequirePermissions('usuarios.ver')
  @ApiOperation({ summary: 'Obtener detalle de un usuario por su ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detalle del usuario', type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Post()
  @RequirePermissions('usuarios.crear')
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Usuario creado exitosamente', type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'El correo electrónico ya existe' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto, currentUserId);
  }

  @Patch(':id')
  @RequirePermissions('usuarios.editar')
  @ApiOperation({ summary: 'Actualizar información de un usuario' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuario actualizado exitosamente', type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto, currentUserId);
  }

  @Delete(':id')
  @RequirePermissions('usuarios.eliminar')
  @ApiOperation({ summary: 'Eliminar (desactivar) un usuario' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Usuario no encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') currentUserId: number,
  ): Promise<{ message: string }> {
    return this.usersService.remove(id, currentUserId);
  }

  @Post(':id/permisos')
  @RequirePermissions('usuarios.editar')
  @ApiOperation({ summary: 'Asignar o sincronizar permisos específicos de un usuario' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Permisos actualizados exitosamente', type: UserResponseDto })
  async assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignPermissionsDto: AssignPermissionsDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<UserResponseDto> {
    return this.usersService.assignPermissions(id, assignPermissionsDto, currentUserId);
  }
}
