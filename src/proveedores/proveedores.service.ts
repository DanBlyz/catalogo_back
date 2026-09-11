import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProveedorDto } from './dto/create-proveedor.dto.js';
import { UpdateProveedorDto } from './dto/update-proveedor.dto.js';
import { FilterProveedoresDto } from './dto/filter-proveedores.dto.js';
import { ProveedorResponseDto } from './dto/proveedor-response.dto.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToResponse(proveedor: {
    id: number;
    nombreEmpresa: string | null;
    contactoNombre: string | null;
    nitRuc: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    _count?: {
      productos: number;
    };
  }): ProveedorResponseDto {
    return {
      id: proveedor.id,
      nombreEmpresa: proveedor.nombreEmpresa,
      contactoNombre: proveedor.contactoNombre,
      nitRuc: proveedor.nitRuc,
      telefono: proveedor.telefono,
      email: proveedor.email,
      direccion: proveedor.direccion,
      totalProductos: proveedor._count?.productos,
      createdAt: proveedor.createdAt,
      updatedAt: proveedor.updatedAt,
    };
  }

  async findAll(
    filterDto: FilterProveedoresDto,
  ): Promise<PaginatedResult<ProveedorResponseDto> | ProveedorResponseDto[]> {
    const { page = 1, limit = 10, search, all } = filterDto;

    const where: Prisma.ProveedorWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { nombreEmpresa: { contains: search, mode: 'insensitive' } },
              { contactoNombre: { contains: search, mode: 'insensitive' } },
              { nitRuc: { contains: search, mode: 'insensitive' } },
              { telefono: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // Modo selector para frontend
    if (all) {
      const proveedores = await this.prisma.proveedor.findMany({
        where,
        orderBy: { nombreEmpresa: 'asc' },
        include: {
          _count: {
            select: {
              productos: { where: { deletedAt: null } },
            },
          },
        },
      });
      return proveedores.map((p) => this.mapToResponse(p));
    }

    const skip = (page - 1) * limit;

    const [total, proveedores] = await Promise.all([
      this.prisma.proveedor.count({ where }),
      this.prisma.proveedor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          _count: {
            select: {
              productos: { where: { deletedAt: null } },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: proveedores.map((p) => this.mapToResponse(p)),
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

  async findOne(id: number): Promise<ProveedorResponseDto> {
    const proveedor = await this.prisma.proveedor.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            productos: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }

    return this.mapToResponse(proveedor);
  }

  async create(
    createProveedorDto: CreateProveedorDto,
    currentUserId?: number,
  ): Promise<ProveedorResponseDto> {
    // Validar unicidad opcional de nitRuc
    if (createProveedorDto.nitRuc?.trim()) {
      const nitFormatted = createProveedorDto.nitRuc.trim();
      const existing = await this.prisma.proveedor.findFirst({
        where: {
          nitRuc: nitFormatted,
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe un proveedor registrado con el NIT/RUC: "${nitFormatted}"`,
        );
      }
    }

    const created = await this.prisma.proveedor.create({
      data: {
        nombreEmpresa: createProveedorDto.nombreEmpresa.trim(),
        contactoNombre: createProveedorDto.contactoNombre?.trim() ?? null,
        nitRuc: createProveedorDto.nitRuc?.trim() ?? null,
        telefono: createProveedorDto.telefono?.trim() ?? null,
        email: createProveedorDto.email?.trim().toLowerCase() ?? null,
        direccion: createProveedorDto.direccion?.trim() ?? null,
        usuarioCreadorId: currentUserId ?? null,
      },
    });

    return this.mapToResponse(created);
  }

  async update(
    id: number,
    updateProveedorDto: UpdateProveedorDto,
    currentUserId?: number,
  ): Promise<ProveedorResponseDto> {
    await this.findOne(id);

    // Validar unicidad de nitRuc si se modifica
    if (updateProveedorDto.nitRuc?.trim()) {
      const nitFormatted = updateProveedorDto.nitRuc.trim();
      const existing = await this.prisma.proveedor.findFirst({
        where: {
          nitRuc: nitFormatted,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe otro proveedor registrado con el NIT/RUC: "${nitFormatted}"`,
        );
      }
    }

    const updated = await this.prisma.proveedor.update({
      where: { id },
      data: {
        ...(updateProveedorDto.nombreEmpresa
          ? { nombreEmpresa: updateProveedorDto.nombreEmpresa.trim() }
          : {}),
        ...(updateProveedorDto.contactoNombre !== undefined
          ? { contactoNombre: updateProveedorDto.contactoNombre?.trim() ?? null }
          : {}),
        ...(updateProveedorDto.nitRuc !== undefined
          ? { nitRuc: updateProveedorDto.nitRuc?.trim() ?? null }
          : {}),
        ...(updateProveedorDto.telefono !== undefined
          ? { telefono: updateProveedorDto.telefono?.trim() ?? null }
          : {}),
        ...(updateProveedorDto.email !== undefined
          ? { email: updateProveedorDto.email?.trim().toLowerCase() ?? null }
          : {}),
        ...(updateProveedorDto.direccion !== undefined
          ? { direccion: updateProveedorDto.direccion?.trim() ?? null }
          : {}),
        usuarioModificadorId: currentUserId ?? null,
      },
      include: {
        _count: {
          select: {
            productos: { where: { deletedAt: null } },
          },
        },
      },
    });

    return this.mapToResponse(updated);
  }

  async remove(id: number, currentUserId?: number): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.proveedor.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        usuarioEliminadorId: currentUserId ?? null,
      },
    });

    return { message: `Proveedor con ID ${id} eliminado exitosamente` };
  }
}
