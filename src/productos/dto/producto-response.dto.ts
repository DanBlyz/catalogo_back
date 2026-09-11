import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoriaSimpleDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Bebidas y Licores' })
  nombre: string | null;
}

export class MarcaSimpleDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Coca Cola' })
  nombre: string | null;
}

export class ProveedorSimpleDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Distribuidora Global S.A.' })
  nombreEmpresa: string | null;
}

export class StockPorSucursalDto {
  @ApiProperty({ example: 1 })
  sucursalId: number;

  @ApiProperty({ example: 'Sucursal Central' })
  sucursalNombre: string;

  @ApiProperty({ example: 50.0 })
  stockActual: number;

  @ApiPropertyOptional({ example: 'Estante A-3', nullable: true })
  ubicacionAlmacen: string | null;
}

export class ProductoResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '7771234567890', nullable: true })
  codigoBarras: string | null;

  @ApiProperty({ example: 'BEB-COC-2L', nullable: true })
  sku: string | null;

  @ApiProperty({ example: 'Coca Cola 2L Descartable' })
  nombre: string | null;

  @ApiProperty({ example: 'Refresco gaseoso sabor cola de 2 litros', nullable: true })
  descripcion: string | null;

  @ApiProperty({ example: 1, nullable: true })
  categoriaId: number | null;

  @ApiProperty({ example: 1, nullable: true })
  marcaId: number | null;

  @ApiProperty({ example: 1, nullable: true })
  proveedorId: number | null;

  @ApiProperty({ example: 10.5 })
  precioCompra: number;

  @ApiProperty({ example: 14.0 })
  precioVenta: number;

  @ApiProperty({ example: 5.0 })
  stockMinimo: number;

  @ApiProperty({ example: 'UNIDAD' })
  unidadMedida: string | null;

  @ApiProperty({ example: 'https://ejemplo.com/imagenes/cocacola2l.jpg', nullable: true })
  imagen: string | null;

  @ApiProperty({ example: true })
  estado: boolean | null;

  @ApiPropertyOptional({ type: CategoriaSimpleDto })
  categoria?: CategoriaSimpleDto | null;

  @ApiPropertyOptional({ type: MarcaSimpleDto })
  marca?: MarcaSimpleDto | null;

  @ApiPropertyOptional({ type: ProveedorSimpleDto })
  proveedor?: ProveedorSimpleDto | null;

  @ApiProperty({ example: 150.0, description: 'Existencias totales sumadas en todas las sucursales' })
  stockTotal: number;

  @ApiProperty({ type: [StockPorSucursalDto], description: 'Detalle de existencias por sucursal' })
  stockPorSucursales: StockPorSucursalDto[];

  @ApiProperty({ example: '2026-09-10T12:00:00.000Z', nullable: true })
  createdAt: Date | null;

  @ApiProperty({ example: '2026-09-10T12:00:00.000Z', nullable: true })
  updatedAt: Date | null;
}
