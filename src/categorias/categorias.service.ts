import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
import { FilterCategoriasDto } from './dto/filter-categorias.dto.js';
import { CategoriaResponseDto } from './dto/categoria-response.dto.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToResponse(categoria: {
    id: number;
    nombre: string | null;
    descripcion: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    _count?: {
      productos: number;
    };
  }): CategoriaResponseDto {
    return {
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      totalProductos: categoria._count?.productos,
      createdAt: categoria.createdAt,
      updatedAt: categoria.updatedAt,
    };
  }

  async findAll(
    filterDto: FilterCategoriasDto,
  ): Promise<PaginatedResult<CategoriaResponseDto> | CategoriaResponseDto[]> {
    const { page = 1, limit = 10, search, all } = filterDto;

    const where: Prisma.CategoriaWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { nombre: { contains: search, mode: 'insensitive' } },
              { descripcion: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // Si se solicita all=true para selects en frontend, devuelve listado plano
    if (all) {
      const categorias = await this.prisma.categoria.findMany({
        where,
        orderBy: { nombre: 'asc' },
        include: {
          _count: {
            select: {
              productos: { where: { deletedAt: null } },
            },
          },
        },
      });
      return categorias.map((c) => this.mapToResponse(c));
    }

    const skip = (page - 1) * limit;

    const [total, categorias] = await Promise.all([
      this.prisma.categoria.count({ where }),
      this.prisma.categoria.findMany({
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
      data: categorias.map((c) => this.mapToResponse(c)),
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

  async findOne(id: number): Promise<CategoriaResponseDto> {
    const categoria = await this.prisma.categoria.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: {
            productos: { where: { deletedAt: null } },
          },
        },
      },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return this.mapToResponse(categoria);
  }

  async create(
    createCategoriaDto: CreateCategoriaDto,
    currentUserId?: number,
  ): Promise<CategoriaResponseDto> {
    const nombreFormatted = createCategoriaDto.nombre.trim();

    // Validar nombre único entre registros activos
    const existing = await this.prisma.categoria.findFirst({
      where: {
        nombre: { equals: nombreFormatted, mode: 'insensitive' },
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(`Ya existe una categoría con el nombre: "${nombreFormatted}"`);
    }

    const created = await this.prisma.categoria.create({
      data: {
        nombre: nombreFormatted,
        descripcion: createCategoriaDto.descripcion?.trim() ?? null,
        usuarioCreadorId: currentUserId ?? null,
      },
    });

    return this.mapToResponse(created);
  }

  async update(
    id: number,
    updateCategoriaDto: UpdateCategoriaDto,
    currentUserId?: number,
  ): Promise<CategoriaResponseDto> {
    await this.findOne(id);

    // Validar nombre único si se está modificando
    if (updateCategoriaDto.nombre) {
      const nombreFormatted = updateCategoriaDto.nombre.trim();
      const existing = await this.prisma.categoria.findFirst({
        where: {
          nombre: { equals: nombreFormatted, mode: 'insensitive' },
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`Ya existe otra categoría con el nombre: "${nombreFormatted}"`);
      }
    }

    const updated = await this.prisma.categoria.update({
      where: { id },
      data: {
        ...(updateCategoriaDto.nombre ? { nombre: updateCategoriaDto.nombre.trim() } : {}),
        ...(updateCategoriaDto.descripcion !== undefined
          ? { descripcion: updateCategoriaDto.descripcion?.trim() ?? null }
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

    await this.prisma.categoria.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        usuarioEliminadorId: currentUserId ?? null,
      },
    });

    return { message: `Categoría con ID ${id} eliminada exitosamente` };
  }
}
