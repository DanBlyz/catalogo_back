import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PermisoItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'usuarios.ver' })
  codigo: string | null;

  @ApiProperty({ example: 'Ver Usuarios' })
  nombre: string | null;

  @ApiProperty({ example: 'USUARIOS' })
  modulo: string | null;
}

export class RolItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'ADMIN' })
  codigo: string | null;

  @ApiProperty({ example: 'Administrador' })
  nombre: string | null;
}

export class SucursalItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sucursal Central' })
  nombre: string | null;
}

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'juanp', nullable: true })
  name: string | null;

  @ApiProperty({ example: 'Juan', nullable: true })
  nombres: string | null;

  @ApiProperty({ example: 'Pérez', nullable: true })
  apellidoPaterno: string | null;

  @ApiProperty({ example: 'Gómez', nullable: true })
  apellidoMaterno: string | null;

  @ApiProperty({ example: '7891234', nullable: true })
  cedula: string | null;

  @ApiProperty({ example: '71234567', nullable: true })
  telefono: string | null;

  @ApiProperty({ example: 'Calle Comercio #456', nullable: true })
  direccion: string | null;

  @ApiProperty({ example: 'juan.perez@sistema.com' })
  email: string | null;

  @ApiProperty({ example: true })
  estado: boolean | null;

  @ApiPropertyOptional({ type: RolItemDto })
  rol?: RolItemDto | null;

  @ApiPropertyOptional({ type: SucursalItemDto })
  sucursal?: SucursalItemDto | null;

  @ApiProperty({ type: [PermisoItemDto] })
  permisos: PermisoItemDto[];

  @ApiProperty({ example: '2026-09-05T02:00:00.000Z' })
  createdAt: Date | null;

  @ApiProperty({ example: '2026-09-05T02:00:00.000Z' })
  updatedAt: Date | null;
}
