import { Module } from '@nestjs/common';
import { MarcasService } from './marcas.service.js';
import { MarcasController } from './marcas.controller.js';

@Module({
  providers: [MarcasService],
  controllers: [MarcasController]
})
export class MarcasModule {}
