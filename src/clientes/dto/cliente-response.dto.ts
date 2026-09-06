import { ApiProperty } from '@nestjs/swagger';

export class ClienteResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Comercializadora San Juan S.R.L.', nullable: true })
  nombreRazonSocial: string | null;

  @ApiProperty({ example: '1029384756', nullable: true })
  cedulaNitRuc: string | null;

  @ApiProperty({ example: '71234567', nullable: true })
  telefono: string | null;

  @ApiProperty({ example: 'contacto@sanjuan.com', nullable: true })
  email: string | null;

  @ApiProperty({ example: 'Av. Las Américas #789', nullable: true })
  direccion: string | null;

  @ApiProperty({ example: '2026-09-05T02:00:00.000Z', nullable: true })
  createdAt: Date | null;

  @ApiProperty({ example: '2026-09-05T02:00:00.000Z', nullable: true })
  updatedAt: Date | null;
}
