import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';
import { FilterProductosDto } from './dto/filter-productos.dto.js';
import {
  ProductoResponseDto,
  StockPorSucursalDto,
} from './dto/producto-response.dto.js';
import { PaginatedResult } from '../common/dto/pagination.dto.js';

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToResponse(producto: {
    id: number;
    codigoBarras: string | null;
    sku: string | null;
    nombre: string | null;
    descripcion: string | null;
    categoriaId: number | null;
    marcaId: number | null;
    proveedorId: number | null;
    precioCompra: Prisma.Decimal | null;
    precioVenta: Prisma.Decimal | null;
    stockMinimo: Prisma.Decimal | null;
    unidadMedida: string | null;
    imagen: string | null;
    estado: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    categoria?: { id: number; nombre: string | null } | null;
    marca?: { id: number; nombre: string | null } | null;
    proveedor?: { id: number; nombreEmpresa: string | null } | null;
    productoSucursales?: Array<{
      id: number;
      sucursalId: number | null;
      stockActual: Prisma.Decimal | null;
      ubicacionAlmacen: string | null;
      sucursal?: { id: number; nombre: string | null } | null;
    }>;
  }): ProductoResponseDto {
    const stockPorSucursales: StockPorSucursalDto[] = (producto.productoSucursales ?? [])
      .filter((ps) => ps.sucursalId !== null)
      .map((ps) => ({
        sucursalId: ps.sucursalId!,
        sucursalNombre: ps.sucursal?.nombre ?? `Sucursal #${ps.sucursalId}`,
        stockActual: Number(ps.stockActual ?? 0),
        ubicacionAlmacen: ps.ubicacionAlmacen,
      }));

    const stockTotal = stockPorSucursales.reduce((acc, curr) => acc + curr.stockActual, 0);

    return {
      id: producto.id,
      codigoBarras: producto.codigoBarras,
      sku: producto.sku,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoriaId: producto.categoriaId,
      marcaId: producto.marcaId,
      proveedorId: producto.proveedorId,
      precioCompra: Number(producto.precioCompra ?? 0),
      precioVenta: Number(producto.precioVenta ?? 0),
      stockMinimo: Number(producto.stockMinimo ?? 0),
      unidadMedida: producto.unidadMedida,
      imagen: producto.imagen,
      estado: producto.estado,
      categoria: producto.categoria
        ? { id: producto.categoria.id, nombre: producto.categoria.nombre }
        : null,
      marca: producto.marca
        ? { id: producto.marca.id, nombre: producto.marca.nombre }
        : null,
      proveedor: producto.proveedor
        ? { id: producto.proveedor.id, nombreEmpresa: producto.proveedor.nombreEmpresa }
        : null,
      stockTotal,
      stockPorSucursales,
      createdAt: producto.createdAt,
      updatedAt: producto.updatedAt,
    };
  }

  private getProductoIncludes() {
    return {
      categoria: { select: { id: true, nombre: true } },
      marca: { select: { id: true, nombre: true } },
      proveedor: { select: { id: true, nombreEmpresa: true } },
      productoSucursales: {
        where: { deletedAt: null },
        include: {
          sucursal: { select: { id: true, nombre: true } },
        },
      },
    };
  }

  async findAll(
    filterDto: FilterProductosDto,
  ): Promise<PaginatedResult<ProductoResponseDto> | ProductoResponseDto[]> {
    const {
      page = 1,
      limit = 10,
      search,
      categoriaId,
      marcaId,
      proveedorId,
      sucursalId,
      estado,
      all,
    } = filterDto;

    const where: Prisma.ProductoWhereInput = {
      deletedAt: null,
      ...(estado !== undefined ? { estado } : {}),
      ...(categoriaId ? { categoriaId } : {}),
      ...(marcaId ? { marcaId } : {}),
      ...(proveedorId ? { proveedorId } : {}),
      ...(sucursalId
        ? {
            productoSucursales: {
              some: { sucursalId, deletedAt: null },
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { nombre: { contains: search, mode: 'insensitive' } },
              { codigoBarras: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { descripcion: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // Modo selector para frontend
    if (all) {
      const productos = await this.prisma.producto.findMany({
        where,
        orderBy: { nombre: 'asc' },
        include: this.getProductoIncludes(),
      });
      return productos.map((p) => this.mapToResponse(p));
    }

    const skip = (page - 1) * limit;

    const [total, productos] = await Promise.all([
      this.prisma.producto.count({ where }),
      this.prisma.producto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: this.getProductoIncludes(),
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: productos.map((p) => this.mapToResponse(p)),
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

  async findOne(id: number): Promise<ProductoResponseDto> {
    const producto = await this.prisma.producto.findFirst({
      where: { id, deletedAt: null },
      include: this.getProductoIncludes(),
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return this.mapToResponse(producto);
  }

  async findByCodigo(codigo: string): Promise<ProductoResponseDto> {
    const codigoFormatted = codigo.trim();

    const producto = await this.prisma.producto.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { codigoBarras: { equals: codigoFormatted, mode: 'insensitive' } },
          { sku: { equals: codigoFormatted, mode: 'insensitive' } },
        ],
      },
      include: this.getProductoIncludes(),
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto con código de barras o SKU "${codigoFormatted}" no encontrado`,
      );
    }

    return this.mapToResponse(producto);
  }

  async create(
    createProductoDto: CreateProductoDto,
    currentUserId?: number,
  ): Promise<ProductoResponseDto> {
    const nombreFormatted = createProductoDto.nombre.trim();

    // 1. Validar unicidad de código de barras
    if (createProductoDto.codigoBarras?.trim()) {
      const codigoBarras = createProductoDto.codigoBarras.trim();
      const existing = await this.prisma.producto.findFirst({
        where: { codigoBarras, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException(
          `Ya existe un producto con el código de barras "${codigoBarras}"`,
        );
      }
    }

    // 2. Validar unicidad de SKU
    if (createProductoDto.sku?.trim()) {
      const sku = createProductoDto.sku.trim();
      const existing = await this.prisma.producto.findFirst({
        where: { sku, deletedAt: null },
      });
      if (existing) {
        throw new ConflictException(`Ya existe un producto con el SKU "${sku}"`);
      }
    }

    // 3. Validar foráneas
    if (createProductoDto.categoriaId) {
      const cat = await this.prisma.categoria.findFirst({
        where: { id: createProductoDto.categoriaId, deletedAt: null },
      });
      if (!cat) {
        throw new BadRequestException(
          `La categoría con ID ${createProductoDto.categoriaId} no existe`,
        );
      }
    }

    if (createProductoDto.marcaId) {
      const marca = await this.prisma.marca.findFirst({
        where: { id: createProductoDto.marcaId, deletedAt: null },
      });
      if (!marca) {
        throw new BadRequestException(`La marca con ID ${createProductoDto.marcaId} no existe`);
      }
    }

    if (createProductoDto.proveedorId) {
      const prov = await this.prisma.proveedor.findFirst({
        where: { id: createProductoDto.proveedorId, deletedAt: null },
      });
      if (!prov) {
        throw new BadRequestException(
          `El proveedor con ID ${createProductoDto.proveedorId} no existe`,
        );
      }
    }

    // 4. Crear producto y gestionar stock inicial en transacción si corresponde
    const createdProducto = await this.prisma.$transaction(async (tx) => {
      const producto = await tx.producto.create({
        data: {
          nombre: nombreFormatted,
          codigoBarras: createProductoDto.codigoBarras?.trim() ?? null,
          sku: createProductoDto.sku?.trim() ?? null,
          descripcion: createProductoDto.descripcion?.trim() ?? null,
          categoriaId: createProductoDto.categoriaId ?? null,
          marcaId: createProductoDto.marcaId ?? null,
          proveedorId: createProductoDto.proveedorId ?? null,
          precioCompra: createProductoDto.precioCompra ?? 0.0,
          precioVenta: createProductoDto.precioVenta ?? 0.0,
          stockMinimo: createProductoDto.stockMinimo ?? 5.0,
          unidadMedida: createProductoDto.unidadMedida?.trim() ?? 'UNIDAD',
          imagen: createProductoDto.imagen?.trim() ?? null,
          estado: createProductoDto.estado ?? true,
          usuarioCreadorId: currentUserId ?? null,
        },
      });

      // Manejar stock inicial
      if (createProductoDto.stockInicial && createProductoDto.stockInicial > 0) {
        let sucursalId = createProductoDto.sucursalIdInicial;
        if (!sucursalId) {
          const principal = await tx.sucursal.findFirst({
            where: { esPrincipal: true, deletedAt: null },
          });
          sucursalId = principal?.id ?? 1;
        }

        await tx.productoSucursal.create({
          data: {
            productoId: producto.id,
            sucursalId,
            stockActual: createProductoDto.stockInicial,
            usuarioCreadorId: currentUserId ?? null,
          },
        });

        await tx.movimientoInventario.create({
          data: {
            sucursalId,
            productoId: producto.id,
            tipoMovimiento: 'ENTRADA',
            cantidad: createProductoDto.stockInicial,
            precioCompra: createProductoDto.precioCompra ?? 0.0,
            precioVenta: createProductoDto.precioVenta ?? 0.0,
            stockAnterior: 0.0,
            stockNuevo: createProductoDto.stockInicial,
            motivo: 'Stock inicial de apertura de producto',
            referenciaTipo: 'INICIAL',
            fechaMovimiento: new Date(),
            usuarioCreadorId: currentUserId ?? null,
          },
        });
      }

      return producto;
    });

    return this.findOne(createdProducto.id);
  }

  async update(
    id: number,
    updateProductoDto: UpdateProductoDto,
    currentUserId?: number,
  ): Promise<ProductoResponseDto> {
    await this.findOne(id);

    // Validar unicidad de código de barras
    if (updateProductoDto.codigoBarras) {
      const codigoBarras = updateProductoDto.codigoBarras.trim();
      const existing = await this.prisma.producto.findFirst({
        where: {
          codigoBarras,
          deletedAt: null,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(
          `Ya existe otro producto con el código de barras "${codigoBarras}"`,
        );
      }
    }

    // Validar unicidad de SKU
    if (updateProductoDto.sku) {
      const sku = updateProductoDto.sku.trim();
      const existing = await this.prisma.producto.findFirst({
        where: {
          sku,
          deletedAt: null,
          NOT: { id },
        },
      });
      if (existing) {
        throw new ConflictException(`Ya existe otro producto con el SKU "${sku}"`);
      }
    }

    // Validar foráneas
    if (updateProductoDto.categoriaId) {
      const cat = await this.prisma.categoria.findFirst({
        where: { id: updateProductoDto.categoriaId, deletedAt: null },
      });
      if (!cat) {
        throw new BadRequestException(
          `La categoría con ID ${updateProductoDto.categoriaId} no existe`,
        );
      }
    }

    if (updateProductoDto.marcaId) {
      const marca = await this.prisma.marca.findFirst({
        where: { id: updateProductoDto.marcaId, deletedAt: null },
      });
      if (!marca) {
        throw new BadRequestException(`La marca con ID ${updateProductoDto.marcaId} no existe`);
      }
    }

    if (updateProductoDto.proveedorId) {
      const prov = await this.prisma.proveedor.findFirst({
        where: { id: updateProductoDto.proveedorId, deletedAt: null },
      });
      if (!prov) {
        throw new BadRequestException(
          `El proveedor con ID ${updateProductoDto.proveedorId} no existe`,
        );
      }
    }

    await this.prisma.producto.update({
      where: { id },
      data: {
        ...(updateProductoDto.nombre ? { nombre: updateProductoDto.nombre.trim() } : {}),
        ...(updateProductoDto.codigoBarras !== undefined
          ? { codigoBarras: updateProductoDto.codigoBarras?.trim() ?? null }
          : {}),
        ...(updateProductoDto.sku !== undefined
          ? { sku: updateProductoDto.sku?.trim() ?? null }
          : {}),
        ...(updateProductoDto.descripcion !== undefined
          ? { descripcion: updateProductoDto.descripcion?.trim() ?? null }
          : {}),
        ...(updateProductoDto.categoriaId !== undefined
          ? { categoriaId: updateProductoDto.categoriaId }
          : {}),
        ...(updateProductoDto.marcaId !== undefined
          ? { marcaId: updateProductoDto.marcaId }
          : {}),
        ...(updateProductoDto.proveedorId !== undefined
          ? { proveedorId: updateProductoDto.proveedorId }
          : {}),
        ...(updateProductoDto.precioCompra !== undefined
          ? { precioCompra: updateProductoDto.precioCompra }
          : {}),
        ...(updateProductoDto.precioVenta !== undefined
          ? { precioVenta: updateProductoDto.precioVenta }
          : {}),
        ...(updateProductoDto.stockMinimo !== undefined
          ? { stockMinimo: updateProductoDto.stockMinimo }
          : {}),
        ...(updateProductoDto.unidadMedida !== undefined
          ? { unidadMedida: updateProductoDto.unidadMedida?.trim() ?? 'UNIDAD' }
          : {}),
        ...(updateProductoDto.imagen !== undefined
          ? { imagen: updateProductoDto.imagen?.trim() ?? null }
          : {}),
        ...(updateProductoDto.estado !== undefined ? { estado: updateProductoDto.estado } : {}),
        usuarioModificadorId: currentUserId ?? null,
      },
    });

    return this.findOne(id);
  }

  async remove(id: number, currentUserId?: number): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.producto.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        usuarioEliminadorId: currentUserId ?? null,
      },
    });

    return { message: `Producto con ID ${id} eliminado exitosamente` };
  }
}
