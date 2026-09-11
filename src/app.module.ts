import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { ClientesModule } from './clientes/clientes.module.js';
import { MarcasModule } from './marcas/marcas.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { ProveedoresModule } from './proveedores/proveedores.module.js';
import { SucursalesModule } from './sucursales/sucursales.module.js';
import { ProductosModule } from './productos/productos.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientesModule,
    MarcasModule,
    CategoriasModule,
    ProveedoresModule,
    SucursalesModule,
    ProductosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
