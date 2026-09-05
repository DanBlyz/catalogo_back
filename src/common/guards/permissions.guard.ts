import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';
import { AuthenticatedUser } from '../decorators/current-user.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Administrador cuenta con acceso irrestricto
    if (user.rolCodigo === 'ADMIN') {
      return true;
    }

    const userPermissions = user.permisos ?? [];
    const hasAllPermissions = requiredPermissions.every((permiso) =>
      userPermissions.includes(permiso),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `No cuentas con los permisos necesarios (${requiredPermissions.join(', ')})`,
      );
    }

    return true;
  }
}
