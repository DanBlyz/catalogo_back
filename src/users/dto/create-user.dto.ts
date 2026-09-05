import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({ example: 'juanp', description: 'Nombre de usuario / username' })
  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
  name?: string;

  @ApiProperty({ example: 'Juan', description: 'Nombres del usuario' })
  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  @IsString({ message: 'Los nombres deben ser una cadena de texto' })
  nombres: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido paterno del usuario' })
  @IsNotEmpty({ message: 'El apellido paterno es requerido' })
  @IsString({ message: 'El apellido paterno debe ser una cadena de texto' })
  apellidoPaterno: string;

  @ApiPropertyOptional({ example: 'Gómez', description: 'Apellido materno del usuario' })
  @IsOptional()
  @IsString({ message: 'El apellido materno debe ser una cadena de texto' })
  apellidoMaterno?: string;

  @ApiPropertyOptional({ example: '7891234', description: 'Cédula de identidad / DNI' })
  @IsOptional()
  @IsString({ message: 'La cédula debe ser una cadena de texto' })
  cedula?: string;

  @ApiPropertyOptional({ example: '71234567', description: 'Teléfono de contacto' })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @ApiPropertyOptional({ example: 'Calle Comercio #456', description: 'Dirección de residencia' })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  direccion?: string;

  @ApiProperty({ example: 'juan.perez@sistema.com', description: 'Correo electrónico único' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña de acceso', minLength: 6 })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe contener al menos 6 caracteres' })
  password: string;

  @ApiPropertyOptional({ example: 2, description: 'ID del rol asignado' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El rolId debe ser un número entero' })
  rolId?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de la sucursal asignada' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El sucursalId debe ser un número entero' })
  sucursalId?: number;

  @ApiPropertyOptional({ example: true, description: 'Estado activo/inactivo', default: true })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser un booleano' })
  estado?: boolean;

  @ApiPropertyOptional({
    example: [1, 2, 5],
    description: 'IDs de permisos específicos a asignar al usuario',
    type: [Number],
  })
  @IsOptional()
  @IsArray({ message: 'Los permisos deben ser un arreglo' })
  @IsInt({ each: true, message: 'Cada permisoId debe ser un número entero' })
  permisoIds?: number[];
}
