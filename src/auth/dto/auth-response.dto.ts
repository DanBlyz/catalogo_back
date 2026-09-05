import { ApiProperty } from '@nestjs/swagger';

export class AuthUserPayloadDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin@sistema.com' })
  email: string;

  @ApiProperty({ example: 'admin', nullable: true })
  name: string | null;

  @ApiProperty({ example: 'Administrador', nullable: true })
  nombres: string | null;

  @ApiProperty({ example: 'Principal', nullable: true })
  apellidoPaterno: string | null;

  @ApiProperty({ example: 1, nullable: true })
  rolId: number | null;

  @ApiProperty({ example: 'ADMIN', nullable: true })
  rolCodigo: string | null;

  @ApiProperty({ example: 'Administrador', nullable: true })
  rolNombre: string | null;

  @ApiProperty({ example: 1, nullable: true })
  sucursalId: number | null;

  @ApiProperty({ example: 'Sucursal Central', nullable: true })
  sucursalNombre: string | null;

  @ApiProperty({ example: ['usuarios.ver', 'inventario.ver'], type: [String] })
  permisos: string[];
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT Bearer',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Tipo de token',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Tiempo de expiración del token',
    example: '8h',
  })
  expiresIn: string;

  @ApiProperty({
    description: 'Datos del usuario autenticado',
    type: AuthUserPayloadDto,
  })
  user: AuthUserPayloadDto;
}
