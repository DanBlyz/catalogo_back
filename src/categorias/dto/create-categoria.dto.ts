import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Bebidas y Licores',
  })
  @IsNotEmpty({ message: 'El nombre de la categoría es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la categoría',
    example: 'Todo tipo de bebidas gaseosas, jugos, aguas y licores nacionales e importados',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  descripcion?: string;
}
