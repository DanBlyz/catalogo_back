import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service.js';
import { ProductosController } from './productos.controller.js';

@Module({
  providers: [ProductosService],
  controllers: [ProductosController],
  exports: [ProductosService],
})
export class ProductosModule {}
