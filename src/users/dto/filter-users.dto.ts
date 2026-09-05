import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export class FilterUsersDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por ID de rol', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El rolId debe ser un número entero' })
  rolId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por ID de sucursal', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El sucursalId debe ser un número entero' })
  sucursalId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por estado activo/inactivo', example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return value;
  })
  @IsBoolean({ message: 'El estado debe ser booleano' })
  estado?: boolean;
}
