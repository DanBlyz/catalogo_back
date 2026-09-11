import { Module } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service.js';
import { ProveedoresController } from './proveedores.controller.js';

@Module({
  providers: [ProveedoresService],
  controllers: [ProveedoresController],
  exports: [ProveedoresService],
})
export class ProveedoresModule {}
