import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';
import { FilterClientesDto } from './dto/filter-clientes.dto.js';
import { ClienteResponseDto } from './dto/cliente-response.dto.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToResponse(cliente: {
    id: number;
    nombreRazonSocial: string | null;
    cedulaNitRuc: string | null;
    telefono: string | null;
    email: string | null;
    direccion: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }): ClienteResponseDto {
    return {
      id: cliente.id,
      nombreRazonSocial: cliente.nombreRazonSocial,
      cedulaNitRuc: cliente.cedulaNitRuc,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      createdAt: cliente.createdAt,
      updatedAt: cliente.updatedAt,
    };
  }

  async findAll(filterDto: FilterClientesDto): Promise<PaginatedResult<ClienteResponseDto>> {
    const { page = 1, limit = 10, search } = filterDto;
    const skip = (page - 1) * limit;

    const where: Prisma.ClienteWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { nombreRazonSocial: { contains: search, mode: 'insensitive' } },
              { cedulaNitRuc: { contains: search, mode: 'insensitive' } },
              { telefono: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [total, clientes] = await Promise.all([
      this.prisma.cliente.count({ where }),
      this.prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: clientes.map((c) => this.mapToResponse(c)),
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

  async findOne(id: number): Promise<ClienteResponseDto> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, deletedAt: null },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return this.mapToResponse(cliente);
  }

  async create(
    createClienteDto: CreateClienteDto,
    currentUserId?: number,
  ): Promise<ClienteResponseDto> {
    // Validar unicidad opcional de cedulaNitRuc si se proporciona
    if (createClienteDto.cedulaNitRuc?.trim()) {
      const docFormatted = createClienteDto.cedulaNitRuc.trim();
      const existing = await this.prisma.cliente.findFirst({
        where: {
          cedulaNitRuc: docFormatted,
          deletedAt: null,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe un cliente registrado con la cédula/NIT/RUC: ${docFormatted}`,
        );
      }
    }

    const cliente = await this.prisma.cliente.create({
      data: {
        nombreRazonSocial: createClienteDto.nombreRazonSocial.trim(),
        cedulaNitRuc: createClienteDto.cedulaNitRuc?.trim() ?? null,
        telefono: createClienteDto.telefono?.trim() ?? null,
        email: createClienteDto.email?.trim().toLowerCase() ?? null,
        direccion: createClienteDto.direccion?.trim() ?? null,
        usuarioCreadorId: currentUserId ?? null,
      },
    });

    return this.mapToResponse(cliente);
  }

  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
    currentUserId?: number,
  ): Promise<ClienteResponseDto> {
    await this.findOne(id);

    // Validar unicidad de cedulaNitRuc si se modifica
    if (updateClienteDto.cedulaNitRuc?.trim()) {
      const docFormatted = updateClienteDto.cedulaNitRuc.trim();
      const existing = await this.prisma.cliente.findFirst({
        where: {
          cedulaNitRuc: docFormatted,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Ya existe otro cliente registrado con la cédula/NIT/RUC: ${docFormatted}`,
        );
      }
    }

    const updatedCliente = await this.prisma.cliente.update({
      where: { id },
      data: {
        ...(updateClienteDto.nombreRazonSocial
          ? { nombreRazonSocial: updateClienteDto.nombreRazonSocial.trim() }
          : {}),
        ...(updateClienteDto.cedulaNitRuc !== undefined
          ? { cedulaNitRuc: updateClienteDto.cedulaNitRuc?.trim() ?? null }
          : {}),
        ...(updateClienteDto.telefono !== undefined
          ? { telefono: updateClienteDto.telefono?.trim() ?? null }
          : {}),
        ...(updateClienteDto.email !== undefined
          ? { email: updateClienteDto.email?.trim().toLowerCase() ?? null }
          : {}),
        ...(updateClienteDto.direccion !== undefined
          ? { direccion: updateClienteDto.direccion?.trim() ?? null }
          : {}),
        usuarioModificadorId: currentUserId ?? null,
      },
    });

    return this.mapToResponse(updatedCliente);
  }

  async remove(id: number, currentUserId?: number): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.cliente.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        usuarioEliminadorId: currentUserId ?? null,
      },
    });

    return { message: `Cliente con ID ${id} eliminado exitosamente` };
  }
}
