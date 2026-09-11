import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export class FilterProductosDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID de categoría', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El categoriaId debe ser un número entero' })
  categoriaId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de marca', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El marcaId debe ser un número entero' })
  marcaId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de proveedor', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El proveedorId debe ser un número entero' })
  proveedorId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de sucursal para consultar existencias locales',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El sucursalId debe ser un número entero' })
  sucursalId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por estado activo o inactivo', example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean({ message: 'El estado debe ser booleano' })
  estado?: boolean;

  @ApiPropertyOptional({
    description: 'Si es true, devuelve solo productos donde el stock total sea menor o igual al stock mínimo',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean({ message: 'El campo bajoStock debe ser booleano' })
  bajoStock?: boolean;

  @ApiPropertyOptional({
    description: 'Si es true, devuelve todos los productos sin paginar (ideal para selectores en ventas/compras)',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean({ message: 'El campo all debe ser booleano' })
  all?: boolean;
}
