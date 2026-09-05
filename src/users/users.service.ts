import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { FilterUsersDto } from './dto/filter-users.dto.js';
import { AssignPermissionsDto } from './dto/assign-permissions.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToUserResponse(user: {
    id: number;
    name: string | null;
    nombres: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    cedula: string | null;
    telefono: string | null;
    direccion: string | null;
    email: string | null;
    estado: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    rol?: { id: number; codigo: string | null; nombre: string | null } | null;
    sucursal?: { id: number; nombre: string | null } | null;
    permisosUsuario?: Array<{
      permiso: {
        id: number;
        codigo: string | null;
        nombre: string | null;
        modulo: string | null;
      } | null;
    }>;
  }): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      nombres: user.nombres,
      apellidoPaterno: user.apellidoPaterno,
      apellidoMaterno: user.apellidoMaterno,
      cedula: user.cedula,
      telefono: user.telefono,
      direccion: user.direccion,
      email: user.email,
      estado: user.estado,
      rol: user.rol
        ? {
            id: user.rol.id,
            codigo: user.rol.codigo,
            nombre: user.rol.nombre,
          }
        : null,
      sucursal: user.sucursal
        ? {
            id: user.sucursal.id,
            nombre: user.sucursal.nombre,
          }
        : null,
      permisos:
        user.permisosUsuario
          ?.map((pu) => pu.permiso)
          .filter((p): p is NonNullable<typeof p> => Boolean(p))
          .map((p) => ({
            id: p.id,
            codigo: p.codigo,
            nombre: p.nombre,
            modulo: p.modulo,
          })) ?? [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll(filterDto: FilterUsersDto): Promise<PaginatedResult<UserResponseDto>> {
    const { page = 1, limit = 10, search, rolId, sucursalId, estado } = filterDto;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(estado !== undefined ? { estado } : {}),
      ...(rolId ? { rolId } : {}),
      ...(sucursalId ? { sucursalId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { nombres: { contains: search, mode: 'insensitive' } },
              { apellidoPaterno: { contains: search, mode: 'insensitive' } },
              { apellidoMaterno: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { cedula: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          rol: true,
          sucursal: true,
          permisosUsuario: {
            where: { deletedAt: null },
            include: { permiso: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map((u) => this.mapToUserResponse(u)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        rol: true,
        sucursal: true,
        permisosUsuario: {
          where: { deletedAt: null },
          include: { permiso: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.mapToUserResponse(user);
  }

  async create(createUserDto: CreateUserDto, currentUserId?: number): Promise<UserResponseDto> {
    const emailFormatted = createUserDto.email.trim().toLowerCase();

    // 1. Validar email único
    const existing = await this.prisma.user.findFirst({
      where: { email: emailFormatted, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(`El correo electrónico ${emailFormatted} ya está registrado`);
    }

    // 2. Validar rol si se proporciona
    if (createUserDto.rolId) {
      const rol = await this.prisma.rol.findFirst({
        where: { id: createUserDto.rolId, deletedAt: null },
      });
      if (!rol) {
        throw new BadRequestException(`El rol con ID ${createUserDto.rolId} no existe`);
      }
    }

    // 3. Validar sucursal si se proporciona
    if (createUserDto.sucursalId) {
      const sucursal = await this.prisma.sucursal.findFirst({
        where: { id: createUserDto.sucursalId, deletedAt: null },
      });
      if (!sucursal) {
        throw new BadRequestException(`La sucursal con ID ${createUserDto.sucursalId} no existe`);
      }
    }

    // 4. Hashear password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 5. Crear usuario
    const createdUser = await this.prisma.user.create({
      data: {
        name: createUserDto.name?.trim() ?? null,
        nombres: createUserDto.nombres.trim(),
        apellidoPaterno: createUserDto.apellidoPaterno.trim(),
        apellidoMaterno: createUserDto.apellidoMaterno?.trim() ?? null,
        cedula: createUserDto.cedula?.trim() ?? null,
        telefono: createUserDto.telefono?.trim() ?? null,
        direccion: createUserDto.direccion?.trim() ?? null,
        email: emailFormatted,
        password: hashedPassword,
        rolId: createUserDto.rolId ?? null,
        sucursalId: createUserDto.sucursalId ?? null,
        estado: createUserDto.estado ?? true,
        usuarioCreadorId: currentUserId ?? null,
        ...(createUserDto.permisoIds && createUserDto.permisoIds.length > 0
          ? {
              permisosUsuario: {
                create: createUserDto.permisoIds.map((permisoId) => ({
                  permisoId,
                  usuarioCreadorId: currentUserId ?? null,
                })),
              },
            }
          : {}),
      },
      include: {
        rol: true,
        sucursal: true,
        permisosUsuario: {
          include: { permiso: true },
        },
      },
    });

    return this.mapToUserResponse(createdUser);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUserId?: number,
  ): Promise<UserResponseDto> {
    await this.findOne(id);

    // Validar email único si se está modificando
    if (updateUserDto.email) {
      const emailFormatted = updateUserDto.email.trim().toLowerCase();
      const existing = await this.prisma.user.findFirst({
        where: {
          email: emailFormatted,
          deletedAt: null,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`El correo electrónico ${emailFormatted} ya está en uso`);
      }
    }

    // Validar rol si se proporciona
    if (updateUserDto.rolId) {
      const rol = await this.prisma.rol.findFirst({
        where: { id: updateUserDto.rolId, deletedAt: null },
      });
      if (!rol) {
        throw new BadRequestException(`El rol con ID ${updateUserDto.rolId} no existe`);
      }
    }

    // Validar sucursal si se proporciona
    if (updateUserDto.sucursalId) {
      const sucursal = await this.prisma.sucursal.findFirst({
        where: { id: updateUserDto.sucursalId, deletedAt: null },
      });
      if (!sucursal) {
        throw new BadRequestException(`La sucursal con ID ${updateUserDto.sucursalId} no existe`);
      }
    }

    // Preparar objeto de actualización
    const dataToUpdate: Prisma.UserUpdateInput = {
      usuarioModificadorId: currentUserId ?? null,
      ...(updateUserDto.name !== undefined ? { name: updateUserDto.name?.trim() ?? null } : {}),
      ...(updateUserDto.nombres ? { nombres: updateUserDto.nombres.trim() } : {}),
      ...(updateUserDto.apellidoPaterno
        ? { apellidoPaterno: updateUserDto.apellidoPaterno.trim() }
        : {}),
      ...(updateUserDto.apellidoMaterno !== undefined
        ? { apellidoMaterno: updateUserDto.apellidoMaterno?.trim() ?? null }
        : {}),
      ...(updateUserDto.cedula !== undefined
        ? { cedula: updateUserDto.cedula?.trim() ?? null }
        : {}),
      ...(updateUserDto.telefono !== undefined
        ? { telefono: updateUserDto.telefono?.trim() ?? null }
        : {}),
      ...(updateUserDto.direccion !== undefined
        ? { direccion: updateUserDto.direccion?.trim() ?? null }
        : {}),
      ...(updateUserDto.email ? { email: updateUserDto.email.trim().toLowerCase() } : {}),
      ...(updateUserDto.estado !== undefined ? { estado: updateUserDto.estado } : {}),
      ...(updateUserDto.rolId !== undefined
        ? { rol: updateUserDto.rolId ? { connect: { id: updateUserDto.rolId } } : { disconnect: true } }
        : {}),
      ...(updateUserDto.sucursalId !== undefined
        ? {
            sucursal: updateUserDto.sucursalId
              ? { connect: { id: updateUserDto.sucursalId } }
              : { disconnect: true },
          }
        : {}),
    };

    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Actualizar usuario
    await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    // Actualizar permisos si se enviaron explícitamente
    if (updateUserDto.permisoIds !== undefined) {
      await this.assignPermissions(id, { permisoIds: updateUserDto.permisoIds }, currentUserId);
    }

    return this.findOne(id);
  }

  async remove(id: number, currentUserId?: number): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        usuarioEliminadorId: currentUserId ?? null,
        estado: false,
      },
    });

    return { message: `Usuario con ID ${id} eliminado exitosamente` };
  }

  async assignPermissions(
    id: number,
    assignPermissionsDto: AssignPermissionsDto,
    currentUserId?: number,
  ): Promise<UserResponseDto> {
    await this.findOne(id);

    // Validar que los permisos existan
    const existingPermisos = await this.prisma.permiso.findMany({
      where: {
        id: { in: assignPermissionsDto.permisoIds },
        deletedAt: null,
      },
    });

    if (existingPermisos.length !== assignPermissionsDto.permisoIds.length) {
      throw new BadRequestException('Uno o más IDs de permisos no existen en el catálogo');
    }

    // Eliminar permisos actuales (soft delete o delete cascade en tabla pivote)
    await this.prisma.permisoUsuario.deleteMany({
      where: { usuarioId: id },
    });

    // Crear nuevas asignaciones
    if (assignPermissionsDto.permisoIds.length > 0) {
      await this.prisma.permisoUsuario.createMany({
        data: assignPermissionsDto.permisoIds.map((permisoId) => ({
          usuarioId: id,
          permisoId,
          usuarioCreadorId: currentUserId ?? null,
        })),
      });
    }

    return this.findOne(id);
  }
}
