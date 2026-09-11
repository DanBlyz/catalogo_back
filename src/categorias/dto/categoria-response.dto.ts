import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoriaResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Bebidas y Licores' })
  nombre: string | null;

  @ApiProperty({
    example: 'Todo tipo de bebidas gaseosas, jugos, aguas y licores',
    nullable: true,
  })
  descripcion: string | null;

  @ApiPropertyOptional({ example: 15, description: 'Cantidad de productos asociados a la categoría' })
  totalProductos?: number;

  @ApiProperty({ example: '2026-09-10T12:00:00.000Z', nullable: true })
  createdAt: Date | null;

  @ApiProperty({ example: '2026-09-10T12:00:00.000Z', nullable: true })
  updatedAt: Date | null;
}
