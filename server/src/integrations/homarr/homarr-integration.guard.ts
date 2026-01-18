import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HomarrIntegrationGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headerValue = request?.headers?.authorization;
    const token = extractBearerToken(headerValue);

    if (!token) {
      throw new UnauthorizedException('Missing integration token');
    }

    const configuredToken = this.configService.get<string>('HOMARR_INTEGRATION_TOKEN');
    if (configuredToken && token === configuredToken) {
      const userId = this.configService.get<string>('HOMARR_INTEGRATION_USER_ID');
      if (!userId) {
        throw new UnauthorizedException('Homarr integration user is not configured');
      }
      request.homarrUserId = userId;
      return true;
    }

    const user = await this.prisma.user.findFirst({
      where: { apiToken: token },
      select: { id: true, status: true },
    });

    if (!user || user.status !== UserStatus.active) {
      throw new UnauthorizedException('Invalid integration token');
    }

    request.homarrUserId = user.id;

    return true;
  }
}

const extractBearerToken = (header?: string | string[]) => {
  if (!header) return null;

  const value = Array.isArray(header) ? header[0] : header;
  if (!value) return null;

  const [scheme, token] = value.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
};
