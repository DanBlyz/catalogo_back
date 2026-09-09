import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { MarcaResponseDto } from './dto/marca-response.dto.js';
import { FilterMarcasDto } from './dto/filter-marcas.dto.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';
import { Prisma } from '@prisma/client';
import { CreateMarcaDto } from './dto/create-marca.dto.js';
import { UpdateMarcaDto } from './dto/uptate-marca.dto.js';

@Injectable()
export class MarcasService {
    constructor(private readonly prisma: PrismaService) { }

    private mapToResponse(marca: {
        id: number;
        nombre: string | null;
        descripcion: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }): MarcaResponseDto {
        return {
            id: marca.id,
            nombre: marca.nombre,
            descripcion: marca.descripcion,
            createdAt: marca.createdAt,
            updatedAt: marca.updatedAt,
        }
    }

    async findAll(filterDto: FilterMarcasDto): Promise<PaginatedResult<MarcaResponseDto>> {
        const { page = 1, limit = 10, search } = filterDto;
        const skip = (page - 1) * limit;

        const where: Prisma.MarcaWhereInput = {
            deletedAt: null,
            ...(search
                ? {
                    OR: [
                        { nombre: { contains: search, mode: 'insensitive' } },
                        { descripcion: { contains: search, mode: 'insensitive' } }
                    ],
                }
                : {})
        };

        const [total, marcas] = await Promise.all([
            this.prisma.marca.count({ where }),
            this.prisma.marca.findMany({
                where,
                skip,
                take: limit,
                orderBy: { id: 'desc' },
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: marcas.map((m) => this.mapToResponse(m)),
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

    async fidnOne(id: number): Promise<MarcaResponseDto> {
        const marca = await this.prisma.marca.findFirst({
            where: { id, deletedAt: null },
        });

        if (!marca) {
            throw new NotFoundException(`Marca con ID ${id} no encontrada`)
        }

        return this.mapToResponse(marca);
    }

    async create(
        createMarcaDto: CreateMarcaDto,
        currentUserId?: number,
    ): Promise<MarcaResponseDto> {
        // Validar la unicidad de nombre de la marca
        if (createMarcaDto.nombre?.trim()) {
            const docFormatted = createMarcaDto.nombre.trim();
            const existing = await this.prisma.marca.findFirst({
                where: {
                    nombre: docFormatted,
                    deletedAt: null,
                },
            });

            if (existing) {
                throw new ConflictException(`Ya existe una marca registrada con el nombre: ${docFormatted}`);
            }
        }

        const marca = await this.prisma.marca.create({
            data: {
                nombre: createMarcaDto.nombre.trim(),
                descripcion: createMarcaDto.descripcion?.trim() ?? null,
                usuarioCreadorId: currentUserId ?? null,
            },
        });

        return this.mapToResponse(marca);
    }

    async update(
        id: number,
        updateMarcaDto: UpdateMarcaDto,
        currentUserId?: number,
    ): Promise<MarcaResponseDto> {
        await this.fidnOne(id);

        // Validar unicidad del nombre de la marca se se modifica
        if (updateMarcaDto.nombre?.trim()) {
            const docFormatted = updateMarcaDto.nombre.trim();
            const existing = await this.prisma.marca.findFirst({
                where: {
                    nombre: docFormatted,
                    deletedAt: null,
                    NOT: { id },
                }
            });

            if (existing) {
                throw new ConflictException(`Ya existe una marca registrada con el nombre: ${docFormatted}`);
            }
        }

        const updateMarca = await this.prisma.marca.update({
            where: { id },
            data: {
                ...(updateMarcaDto.nombre
                    ? { nombre: updateMarcaDto.nombre.trim() }
                    : {}
                ),
                ...(updateMarcaDto.descripcion !== undefined
                    ? { updateMarcaDto: updateMarcaDto.descripcion?.trim() ?? null }
                    : {}
                ),
                usuarioModificadorId: currentUserId ?? null,
            }
        });

        return this.mapToResponse(updateMarca);
    }

    async remove(id: number, currentUserId?: number): Promise<{ message: string }> {
        await this.fidnOne(id);

        await this.prisma.marca.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                usuarioEliminadorId: currentUserId ?? null
            },
        });

        return { message: `Marca con ID ${id} eliminada exitosamente` };
    }
}