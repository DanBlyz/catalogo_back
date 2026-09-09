import { ApiProperty } from "@nestjs/swagger";

export class MarcaResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Nestle' })
    nombre: string | null;

    @ApiProperty({ example: 'Distribuidor de productos Nestle' })
    descripcion: string | null;

    @ApiProperty({ example: '2026-09-05T02:00:00.000Z', nullable: true })
    createdAt: Date | null;

    @ApiProperty({ example: '2026-09-05T02:00:00.000Z', nullable: true })
    updatedAt: Date | null;
}