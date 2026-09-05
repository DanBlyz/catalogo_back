import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class AssignPermissionsDto {
  @ApiProperty({
    description: 'Arreglo con los IDs de permisos a asignar al usuario',
    example: [1, 2, 3, 4],
    type: [Number],
  })
  @IsArray({ message: 'Los permisos deben enviarse como un arreglo' })
  @ArrayNotEmpty({ message: 'El arreglo de permisos no puede estar vacío' })
  @IsInt({ each: true, message: 'Cada permisoId debe ser un número entero' })
  permisoIds: number[];
}
