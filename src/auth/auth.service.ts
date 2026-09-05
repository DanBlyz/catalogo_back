import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthUserPayloadDto, LoginResponseDto } from './dto/auth-response.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: loginDto.email.trim().toLowerCase(),
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

    if (!user || user.estado === false || !user.password) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      rol: user.rol?.codigo ?? null,
    };

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '8h';
    const accessToken = await this.jwtService.signAsync(payload);

    const permisos = user.permisosUsuario
      .map((pu) => pu.permiso?.codigo)
      .filter((codigo): codigo is string => typeof codigo === 'string' && codigo.length > 0);

    const userPayload: AuthUserPayloadDto = {
      id: user.id,
      email: user.email ?? '',
      name: user.name,
      nombres: user.nombres,
      apellidoPaterno: user.apellidoPaterno,
      rolId: user.rolId,
      rolCodigo: user.rol?.codigo ?? null,
      rolNombre: user.rol?.nombre ?? null,
      sucursalId: user.sucursalId,
      sucursalNombre: user.sucursal?.nombre ?? null,
      permisos,
    };

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: userPayload,
    };
  }

  async getProfile(userId: number): Promise<AuthUserPayloadDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
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

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const permisos = user.permisosUsuario
      .map((pu) => pu.permiso?.codigo)
      .filter((codigo): codigo is string => typeof codigo === 'string' && codigo.length > 0);

    return {
      id: user.id,
      email: user.email ?? '',
      name: user.name,
      nombres: user.nombres,
      apellidoPaterno: user.apellidoPaterno,
      rolId: user.rolId,
      rolCodigo: user.rol?.codigo ?? null,
      rolNombre: user.rol?.nombre ?? null,
      sucursalId: user.sucursalId,
      sucursalNombre: user.sucursal?.nombre ?? null,
      permisos,
    };
  }
}
