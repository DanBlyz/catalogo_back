import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProveedorResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Distribuidora Global S.A.', nullable: true })
  nombreEmpresa: string | null;

  @ApiProperty({ example: 'Lic. Roberto Méndez', nullable: true })
  contactoNombre: string | null;

  @ApiProperty({ example: '1029384019', nullable: true })
  nitRuc: string | null;

  @ApiProperty({ example: '70011223', nullable: true })
  telefono: string | null;

  @ApiProperty({ example: 'ventas@global.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: 'Parque Industrial, Mz. 5 Galpón 12', nullable: true })
  direccion: string | null;

  @ApiPropertyOptional({ example: 42, description: 'Cantidad de productos suministrados por este proveedor' })
  totalProductos?: number;

  @ApiProperty({ example: '2026-09-10T12:00:00.000Z', nullable: true })
  createdAt: Date | null;

  @ApiProperty({ example: '2026-09-10T12:00:00.000Z', nullable: true })
  updatedAt: Date | null;
}
