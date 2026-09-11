import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProveedorDto {
  @ApiProperty({
    description: 'Nombre de la empresa o razón social del proveedor',
    example: 'Distribuidora Global S.A.',
  })
  @IsNotEmpty({ message: 'El nombre de la empresa es requerido' })
  @IsString({ message: 'El nombre de la empresa debe ser una cadena de texto' })
  nombreEmpresa: string;

  @ApiPropertyOptional({
    description: 'Nombre de la persona de contacto o representante comercial',
    example: 'Lic. Roberto Méndez',
  })
  @IsOptional()
  @IsString({ message: 'El nombre de contacto debe ser una cadena de texto' })
  contactoNombre?: string;

  @ApiPropertyOptional({
    description: 'Número de Identificación Tributaria (NIT, RUC o Cédula fiscal)',
    example: '1029384019',
  })
  @IsOptional()
  @IsString({ message: 'El NIT/RUC debe ser una cadena de texto' })
  nitRuc?: string;

  @ApiPropertyOptional({
    description: 'Teléfono o celular de contacto',
    example: '70011223',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico de contacto o ventas',
    example: 'ventas@global.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Dirección o domicilio comercial del proveedor',
    example: 'Parque Industrial, Mz. 5 Galpón 12',
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  direccion?: string;
}
