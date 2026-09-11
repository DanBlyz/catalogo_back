import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSucursalDto } from './dto/create-sucursal.dto.js';
import { UpdateSucursalDto } from './dto/update-sucursal.dto.js';
import { FilterSucursalesDto } from './dto/filter-sucursales.dto.js';
import { SucursalResponseDto } from './dto/sucursal-response.dto.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';

@Injectable()
export class SucursalesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToResponse(sucursal: {
    id: number;
    nombre: string | null;
    direccion: string | null;
    telefono: string | null;
    esPrincipal: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    _count?: {
      usuarios: number;
      cajas: number;
    };
  }): SucursalResponseDto {
    return {
      id: sucursal.id,
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      telefono: sucursal.telefono,
      esPrincipal: sucursal.esPrincipal,
      totalUsuarios: sucursal._count?.usuarios,
      totalCajas: sucursal._count?.cajas,
      createdAt: sucursal.createdAt,
      updatedAt: sucursal.updatedAt,
    };
  }

  async findAll(
    filterDto: FilterSucursalesDto,
  ): Promise<PaginatedResult<SucursalResponseDto> | SucursalResponseDto[]> {
    const { page = 1, limit = 10, search, all } = filterDto;

    const where: Prisma.SucursalWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { nombre: { contains: search, mode: 'insensitive' } },
              { direccion: { contains: search, mode: 'insensitive' } },
              { telefono: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // Modo selector para frontend
    if (all) {
      const sucursales = await this.prisma.sucursal.findMany({
        where,
        orderBy: [{ esPrincipal: 'desc' }, { nombre: 'asc' }],
        include: {
          _count: {
            select: {
              usuarios: { where: { deletedAt: null } },
              cajas: { where: { deletedAt: null } },
            },
          },
        },
      });
      return sucursales.map((s) => this.mapToResponse(s));
    }

    const skip = (page - 1) * limit;

    const [total, sucursales] = await Promise.all([
      this.prisma.sucursal.count({ where }),
      this.prisma.sucursal.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ esPrincipal: 'desc' }, { id: 'desc' }],
        include: {
          _count: {
            select: {
              usuarios: { where: { deletedAt: null } },
              cajas: { where: { deletedAt: null } },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: sucursales.map((s) => this.mapToResponse(s)),
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

  async findOne(id: number): Promise<SucursalResponseDto> {
    const sucursal = await this.prisma.sucursal.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            usuarios: { where: { deletedAt: null } },
            cajas: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!sucursal) {
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    }

    return this.mapToResponse(sucursal);
  }

  async create(
    createSucursalDto: CreateSucursalDto,
    currentUserId?: number,
  ): Promise<SucursalResponseDto> {
    const nombreFormatted = createSucursalDto.nombre.trim();

    // Validar nombre único entre registros activos
    const existing = await this.prisma.sucursal.findFirst({
      where: {
        nombre: { equals: nombreFormatted, mode: 'insensitive' },
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una sucursal con el nombre: "${nombreFormatted}"`);
    }

    // Ejecutar en transacción si se marca como principal
    const created = await this.prisma.$transaction(async (tx) => {
      if (createSucursalDto.esPrincipal) {
        await tx.sucursal.updateMany({
          where: { esPrincipal: true, deletedAt: null },
          data: { esPrincipal: false },
        });
      }

      return tx.sucursal.create({
        data: {
          nombre: nombreFormatted,
          direccion: createSucursalDto.direccion?.trim() ?? null,
          telefono: createSucursalDto.telefono?.trim() ?? null,
          esPrincipal: createSucursalDto.esPrincipal ?? false,
          usuarioCreadorId: currentUserId ?? null,
        },
      });
    });

    return this.mapToResponse(created);
  }

  async update(
    id: number,
    updateSucursalDto: UpdateSucursalDto,
    currentUserId?: number,
  ): Promise<SucursalResponseDto> {
    await this.findOne(id);

    // Validar nombre único si se está modificando
    if (updateSucursalDto.nombre) {
      const nombreFormatted = updateSucursalDto.nombre.trim();
      const existing = await this.prisma.sucursal.findFirst({
        where: {
          nombre: { equals: nombreFormatted, mode: 'insensitive' },
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`Ya existe otra sucursal con el nombre: "${nombreFormatted}"`);
      }
    }

    // Ejecutar en transacción si se altera esPrincipal
    const updated = await this.prisma.$transaction(async (tx) => {
      if (updateSucursalDto.esPrincipal === true) {
        await tx.sucursal.updateMany({
          where: { esPrincipal: true, deletedAt: null, NOT: { id } },
          data: { esPrincipal: false },
        });
      }

      return tx.sucursal.update({
        where: { id },
        data: {
          ...(updateSucursalDto.nombre ? { nombre: updateSucursalDto.nombre.trim() } : {}),
          ...(updateSucursalDto.direccion !== undefined
            ? { direccion: updateSucursalDto.direccion?.trim() ?? null }
            : {}),
          ...(updateSucursalDto.telefono !== undefined
            ? { telefono: updateSucursalDto.telefono?.trim() ?? null }
            : {}),
          ...(updateSucursalDto.esPrincipal !== undefined
            ? { esPrincipal: updateSucursalDto.esPrincipal }
            : {}),
          usuarioModificadorId: currentUserId ?? null,
        },
        include: {
          _count: {
            select: {
              usuarios: { where: { deletedAt: null } },
              cajas: { where: { deletedAt: null } },
            },
          },
        },
      });
    });

    return this.mapToResponse(updated);
  }

  async remove(id: number, currentUserId?: number): Promise<{ message: string }> {
    const sucursal = await this.findOne(id);

    // Evitar eliminar la sucursal principal
    if (sucursal.esPrincipal) {
      throw new BadRequestException(
        'No se puede eliminar la sucursal principal. Asigne otra sucursal como principal antes de eliminar esta.',
      );
    }

    await this.prisma.sucursal.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        usuarioEliminadorId: currentUserId ?? null,
      },
    });

    return { message: `Sucursal con ID ${id} eliminada exitosamente` };
  }
}
