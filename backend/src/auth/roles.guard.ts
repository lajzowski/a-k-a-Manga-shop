import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // если не указано — доступен всем
    }
    const request = context.switchToHttp().getRequest<Request>();
    let role = request.headers['x-role'];
    if (Array.isArray(role)) role = role[0];
    if (typeof role !== 'string') role = '';
    if (!requiredRoles.includes(role)) {
      throw new ForbiddenException('Недостаточно прав');
    }
    return true;
  }
} 