import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator.js';

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'super_secret_jwt_key_catalogo_pos_2026',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        deletedAt: null,
      },
      include: {
        rol: true,
        sucursal: true,
        permisosUsuario: {
          where: { deletedAt: null },
          include: {
            permiso: true,
          },
        },
      },
    });

    if (!user || user.estado === false) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    const permisos = user.permisosUsuario
      .map((pu) => pu.permiso?.codigo)
      .filter((codigo): codigo is string => typeof codigo === 'string' && codigo.length > 0);

    return {
      id: user.id,
      email: user.email ?? '',
      name: user.name,
      nombres: user.nombres,
      rolId: user.rolId,
      rolCodigo: user.rol?.codigo ?? null,
      rolNombre: user.rol?.nombre ?? null,
      sucursalId: user.sucursalId,
      permisos,
    };
  }
}
