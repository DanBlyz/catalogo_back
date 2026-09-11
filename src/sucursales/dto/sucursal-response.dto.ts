import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SucursalResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sucursal Central', nullable: true })
  nombre: string | null;

  @ApiProperty({ example: 'Av. Principal #123, Zona Central', nullable: true })
  direccion: string | null;

  @ApiProperty({ example: '70012345', nullable: true })
  telefono: string | null;

  @ApiProperty({ example: true, nullable: true })
  esPrincipal: boolean | null;

  @ApiPropertyOptional({ example: 5, description: 'Cantidad de usuarios asignados a esta sucursal' })
  totalUsuarios?: number;

  @ApiPropertyOptional({ example: 2, description: 'Cantidad de cajas vinculadas a esta sucursal' })
  totalCajas?: number;

  @ApiProperty({ example: '2026-09-10T12:00:00.000Z', nullable: true })
  createdAt: Date | null;

  @ApiProperty({ example: '2026-09-10T12:00:00.000Z', nullable: true })
  updatedAt: Date | null;
}
