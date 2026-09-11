import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSucursalDto {
  @ApiProperty({
    description: 'Nombre de la sucursal o sede comercial',
    example: 'Sucursal Norte',
  })
  @IsNotEmpty({ message: 'El nombre de la sucursal es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Dirección o ubicación física de la sucursal',
    example: 'Av. Banzer entre 4to y 5to anillo',
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Teléfono o celular de contacto de la sucursal',
    example: '33445566',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Indica si esta sede es la sucursal principal del sistema',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo esPrincipal debe ser un booleano' })
  esPrincipal?: boolean;
}
