import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClienteDto {
  @ApiProperty({
    description: 'Nombre completo o razón social del cliente',
    example: 'Comercializadora San Juan S.R.L.',
  })
  @IsNotEmpty({ message: 'El nombre o razón social es requerido' })
  @IsString({ message: 'El nombre o razón social debe ser una cadena de texto' })
  nombreRazonSocial: string;

  @ApiPropertyOptional({
    description: 'Cédula de identidad, NIT o RUC del cliente',
    example: '1029384756',
  })
  @IsOptional()
  @IsString({ message: 'La cédula, NIT o RUC debe ser una cadena de texto' })
  cedulaNitRuc?: string;

  @ApiPropertyOptional({
    description: 'Teléfono o celular de contacto',
    example: '71234567',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del cliente',
    example: 'contacto@sanjuan.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Dirección o domicilio fiscal',
    example: 'Av. Las Américas #789',
  })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  direccion?: string;
}
