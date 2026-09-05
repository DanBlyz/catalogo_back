import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Iniciando seeder de la base de datos...');

  // 1. Sucursal Principal
  let sucursalPrincipal = await prisma.sucursal.findFirst({
    where: { esPrincipal: true, deletedAt: null },
  });

  if (!sucursalPrincipal) {
    sucursalPrincipal = await prisma.sucursal.create({
      data: {
        nombre: 'Sucursal Central',
        direccion: 'Av. Principal #123, Zona Central',
        telefono: '70012345',
        esPrincipal: true,
      },
    });
    console.log(`✅ Sucursal principal creada: "${sucursalPrincipal.nombre}" (ID: ${sucursalPrincipal.id})`);
  } else {
    console.log(`ℹ️ Sucursal principal existente: "${sucursalPrincipal.nombre}" (ID: ${sucursalPrincipal.id})`);
  }

  // 2. Roles del Sistema
  const rolesData = [
    {
      codigo: 'ADMIN',
      nombre: 'Administrador',
      descripcion: 'Acceso total a todos los módulos y configuraciones del sistema',
    },
    {
      codigo: 'CAJERO',
      nombre: 'Cajero',
      descripcion: 'Gestión de aperturas/cierres de caja, cobros, ventas y arqueos',
    },
    {
      codigo: 'VENDEDOR',
      nombre: 'Vendedor',
      descripcion: 'Atención a clientes, consultas de catálogo y registro de ventas',
    },
    {
      codigo: 'ALMACENERO',
      nombre: 'Encargado de Almacén',
      descripcion: 'Gestión de existencias, productos y movimientos de inventario',
    },
  ];

  const rolesMap = new Map<string, number>();

  for (const r of rolesData) {
    let rol = await prisma.rol.findFirst({
      where: { codigo: r.codigo, deletedAt: null },
    });

    if (!rol) {
      rol = await prisma.rol.create({
        data: r,
      });
      console.log(`✅ Rol creado: ${rol.nombre} (${rol.codigo})`);
    } else {
      console.log(`ℹ️ Rol existente: ${rol.nombre} (${rol.codigo})`);
    }

    rolesMap.set(r.codigo, rol.id);
  }

  // 3. Catálogo de Permisos por Módulo
  const permisosData = [
    // USUARIOS
    { modulo: 'USUARIOS', codigo: 'usuarios.ver', nombre: 'Ver Usuarios', descripcion: 'Ver lista y detalles de usuarios' },
    { modulo: 'USUARIOS', codigo: 'usuarios.crear', nombre: 'Crear Usuarios', descripcion: 'Registrar nuevos usuarios' },
    { modulo: 'USUARIOS', codigo: 'usuarios.editar', nombre: 'Editar Usuarios', descripcion: 'Modificar datos de usuarios' },
    { modulo: 'USUARIOS', codigo: 'usuarios.eliminar', nombre: 'Eliminar Usuarios', descripcion: 'Eliminar usuarios' },

    // ROLES
    { modulo: 'ROLES', codigo: 'roles.ver', nombre: 'Ver Roles', descripcion: 'Ver roles y permisos' },
    { modulo: 'ROLES', codigo: 'roles.crear', nombre: 'Crear Roles', descripcion: 'Registrar nuevos roles' },
    { modulo: 'ROLES', codigo: 'roles.editar', nombre: 'Editar Roles', descripcion: 'Modificar roles existentes' },
    { modulo: 'ROLES', codigo: 'roles.eliminar', nombre: 'Eliminar Roles', descripcion: 'Eliminar roles' },

    // SUCURSALES
    { modulo: 'SUCURSALES', codigo: 'sucursales.ver', nombre: 'Ver Sucursales', descripcion: 'Ver listado de sucursales' },
    { modulo: 'SUCURSALES', codigo: 'sucursales.crear', nombre: 'Crear Sucursales', descripcion: 'Registrar nuevas sucursales' },
    { modulo: 'SUCURSALES', codigo: 'sucursales.editar', nombre: 'Editar Sucursales', descripcion: 'Modificar datos de sucursales' },
    { modulo: 'SUCURSALES', codigo: 'sucursales.eliminar', nombre: 'Eliminar Sucursales', descripcion: 'Eliminar sucursales' },

    // PRODUCTOS
    { modulo: 'PRODUCTOS', codigo: 'productos.ver', nombre: 'Ver Productos', descripcion: 'Ver catálogo de productos' },
    { modulo: 'PRODUCTOS', codigo: 'productos.crear', nombre: 'Crear Productos', descripcion: 'Registrar nuevos productos' },
    { modulo: 'PRODUCTOS', codigo: 'productos.editar', nombre: 'Editar Productos', descripcion: 'Modificar información de productos' },
    { modulo: 'PRODUCTOS', codigo: 'productos.eliminar', nombre: 'Eliminar Productos', descripcion: 'Eliminar productos' },

    // CATEGORÍAS
    { modulo: 'CATEGORIAS', codigo: 'categorias.ver', nombre: 'Ver Categorías', descripcion: 'Ver categorías' },
    { modulo: 'CATEGORIAS', codigo: 'categorias.crear', nombre: 'Crear Categorías', descripcion: 'Registrar nuevas categorías' },
    { modulo: 'CATEGORIAS', codigo: 'categorias.editar', nombre: 'Editar Categorías', descripcion: 'Modificar categorías' },
    { modulo: 'CATEGORIAS', codigo: 'categorias.eliminar', nombre: 'Eliminar Categorías', descripcion: 'Eliminar categorías' },

    // MARCAS
    { modulo: 'MARCAS', codigo: 'marcas.ver', nombre: 'Ver Marcas', descripcion: 'Ver marcas de productos' },
    { modulo: 'MARCAS', codigo: 'marcas.crear', nombre: 'Crear Marcas', descripcion: 'Registrar marcas' },
    { modulo: 'MARCAS', codigo: 'marcas.editar', nombre: 'Editar Marcas', descripcion: 'Modificar marcas' },
    { modulo: 'MARCAS', codigo: 'marcas.eliminar', nombre: 'Eliminar Marcas', descripcion: 'Eliminar marcas' },

    // PROVEEDORES
    { modulo: 'PROVEEDORES', codigo: 'proveedores.ver', nombre: 'Ver Proveedores', descripcion: 'Ver proveedores' },
    { modulo: 'PROVEEDORES', codigo: 'proveedores.crear', nombre: 'Crear Proveedores', descripcion: 'Registrar proveedores' },
    { modulo: 'PROVEEDORES', codigo: 'proveedores.editar', nombre: 'Editar Proveedores', descripcion: 'Modificar proveedores' },
    { modulo: 'PROVEEDORES', codigo: 'proveedores.eliminar', nombre: 'Eliminar Proveedores', descripcion: 'Eliminar proveedores' },

    // CLIENTES
    { modulo: 'CLIENTES', codigo: 'clientes.ver', nombre: 'Ver Clientes', descripcion: 'Ver clientes' },
    { modulo: 'CLIENTES', codigo: 'clientes.crear', nombre: 'Crear Clientes', descripcion: 'Registrar clientes' },
    { modulo: 'CLIENTES', codigo: 'clientes.editar', nombre: 'Editar Clientes', descripcion: 'Modificar datos de clientes' },
    { modulo: 'CLIENTES', codigo: 'clientes.eliminar', nombre: 'Eliminar Clientes', descripcion: 'Eliminar clientes' },

    // INVENTARIO
    { modulo: 'INVENTARIO', codigo: 'inventario.ver', nombre: 'Ver Inventario', descripcion: 'Consultar existencias y stock' },
    { modulo: 'INVENTARIO', codigo: 'inventario.ajustar', nombre: 'Ajustar Inventario', descripcion: 'Ajustes manuales de existencias' },
    { modulo: 'INVENTARIO', codigo: 'inventario.movimientos', nombre: 'Movimientos de Inventario', descripcion: 'Kardex y auditoría de stock' },

    // CAJAS
    { modulo: 'CAJAS', codigo: 'cajas.ver', nombre: 'Ver Cajas', descripcion: 'Ver estado y listado de cajas' },
    { modulo: 'CAJAS', codigo: 'cajas.abrir', nombre: 'Abrir Caja', descripcion: 'Efectuar apertura de turno en caja' },
    { modulo: 'CAJAS', codigo: 'cajas.cerrar', nombre: 'Cerrar Caja', descripcion: 'Efectuar cierre y arqueo de caja' },
    { modulo: 'CAJAS', codigo: 'cajas.movimientos', nombre: 'Ver Movimientos Caja', descripcion: 'Ver ingresos y egresos de caja' },

    // VENTAS
    { modulo: 'VENTAS', codigo: 'ventas.ver', nombre: 'Ver Ventas', descripcion: 'Ver historial de ventas y recibos' },
    { modulo: 'VENTAS', codigo: 'ventas.crear', nombre: 'Crear Ventas', descripcion: 'Emitir y cobrar ventas (POS)' },
    { modulo: 'VENTAS', codigo: 'ventas.anular', nombre: 'Anular Ventas', descripcion: 'Anular ventas y restaurar inventario' },
    { modulo: 'VENTAS', codigo: 'ventas.reportes', nombre: 'Reportes de Ventas', descripcion: 'Reportes y estadísticas de ventas' },

    // PAGOS
    { modulo: 'PAGOS', codigo: 'pagos.ver', nombre: 'Ver Pagos', descripcion: 'Ver historial de pagos' },
    { modulo: 'PAGOS', codigo: 'pagos.registrar', nombre: 'Registrar Pagos', descripcion: 'Registrar pagos de ventas' },
    { modulo: 'PAGOS', codigo: 'pagos.anular', nombre: 'Anular Pagos', descripcion: 'Anular pagos registrados' },
  ];

  const allPermisoIds: number[] = [];

  for (const p of permisosData) {
    let permiso = await prisma.permiso.findFirst({
      where: { codigo: p.codigo, deletedAt: null },
    });

    if (!permiso) {
      permiso = await prisma.permiso.create({
        data: p,
      });
    }

    allPermisoIds.push(permiso.id);
  }
  console.log(`✅ Catálogo de permisos sincronizado (${allPermisoIds.length} permisos totales).`);

  // 4. Usuario Administrador por Defecto
  const adminEmail = 'admin@sistema.com';
  const adminRoleId = rolesMap.get('ADMIN');

  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin1234', 10);

    adminUser = await prisma.user.create({
      data: {
        name: 'admin',
        nombres: 'Administrador',
        apellidoPaterno: 'Principal',
        apellidoMaterno: 'Sistema',
        cedula: '10000001',
        telefono: '70012345',
        direccion: 'Av. Principal #123',
        email: adminEmail,
        password: hashedPassword,
        rolId: adminRoleId,
        sucursalId: sucursalPrincipal.id,
        estado: true,
      },
    });
    console.log(`✅ Usuario Administrador creado: ${adminUser.email} (Password inicial: admin1234)`);
  } else {
    console.log(`ℹ️ Usuario Administrador ya existente: ${adminUser.email}`);
  }

  // 5. Asignar todos los permisos al Usuario Administrador
  for (const permisoId of allPermisoIds) {
    const asignado = await prisma.permisoUsuario.findFirst({
      where: {
        usuarioId: adminUser.id,
        permisoId: permisoId,
        deletedAt: null,
      },
    });

    if (!asignado) {
      await prisma.permisoUsuario.create({
        data: {
          usuarioId: adminUser.id,
          permisoId: permisoId,
        },
      });
    }
  }
  console.log(`✅ Todos los permisos asignados al Administrador (${adminUser.name}).`);

  console.log('🎉 Seeder completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar el seeder:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
