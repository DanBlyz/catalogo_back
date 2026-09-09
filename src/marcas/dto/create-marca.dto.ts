import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMarcaDto {
    @ApiProperty({
        description: 'Nombre de la marca',
        example: 'Nestle'
    })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    nombre: string;

    @ApiPropertyOptional({
        description: 'Descripcion de la marca',
        example: 'Distribuidor de productos Nestle'
    })
    @IsOptional()
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    descripcion?: string;
}