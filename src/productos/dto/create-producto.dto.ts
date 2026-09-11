import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductoDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Coca Cola 2L Descartable',
  })
  @IsNotEmpty({ message: 'El nombre del producto es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Código de barras del producto (EAN-13, UPC o personalizado)',
    example: '7771234567890',
  })
  @IsOptional()
  @IsString({ message: 'El código de barras debe ser una cadena de texto' })
  codigoBarras?: string;

  @ApiPropertyOptional({
    description: 'Código SKU interno para control de inventario',
    example: 'BEB-COC-2L',
  })
  @IsOptional()
  @IsString({ message: 'El SKU debe ser una cadena de texto' })
  sku?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada o especificaciones del producto',
    example: 'Refresco gaseoso sabor cola de 2 litros en envase descartable',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'ID de la categoría a la que pertenece',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El categoriaId debe ser un número entero' })
  categoriaId?: number;

  @ApiPropertyOptional({
    description: 'ID de la marca del producto',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El marcaId debe ser un número entero' })
  marcaId?: number;

  @ApiPropertyOptional({
    description: 'ID del proveedor principal del producto',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El proveedorId debe ser un número entero' })
  proveedorId?: number;

  @ApiPropertyOptional({
    description: 'Precio de compra o costo unitario',
    example: 10.5,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio de compra debe ser un número' })
  @Min(0, { message: 'El precio de compra no puede ser negativo' })
  precioCompra?: number;

  @ApiPropertyOptional({
    description: 'Precio de venta al público',
    example: 14.0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio de venta debe ser un número' })
  @Min(0, { message: 'El precio de venta no puede ser negativo' })
  precioVenta?: number;

  @ApiPropertyOptional({
    description: 'Stock mínimo para alertas de reposición',
    example: 5,
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El stock mínimo debe ser un número' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  stockMinimo?: number;

  @ApiPropertyOptional({
    description: 'Unidad de medida (UNIDAD, PAQUETE, CAJA, LITRO, KG, etc.)',
    example: 'UNIDAD',
    default: 'UNIDAD',
  })
  @IsOptional()
  @IsString({ message: 'La unidad de medida debe ser una cadena de texto' })
  unidadMedida?: string;

  @ApiPropertyOptional({
    description: 'URL o ruta de la imagen del producto',
    example: 'https://ejemplo.com/imagenes/cocacola2l.jpg',
  })
  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  imagen?: string;

  @ApiPropertyOptional({
    description: 'Estado activo o inactivo del producto',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser booleano' })
  estado?: boolean;

  @ApiPropertyOptional({
    description: 'Stock inicial a registrar al momento de crear el producto',
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El stock inicial debe ser un número' })
  @Min(0, { message: 'El stock inicial no puede ser negativo' })
  stockInicial?: number;

  @ApiPropertyOptional({
    description: 'ID de la sucursal donde se registrará el stock inicial (si no se envía, se toma la principal)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El sucursalIdInicial debe ser un número entero' })
  sucursalIdInicial?: number;
}
