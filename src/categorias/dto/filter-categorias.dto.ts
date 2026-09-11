import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export class FilterCategoriasDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Si es true, devuelve todas las categorías sin paginación (ideal para selectores en frontend)',
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
