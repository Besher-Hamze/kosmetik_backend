import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { AuditService } from '../../modules/audit/audit.service';
import { AuthUser } from '../types/auth-user.interface';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

/**
 * Logs every successful authenticated mutation (admin activity) into the
 * auditlogs collection. Public unauthenticated POSTs (contact, appointments,
 * testimonials) and auth endpoints are not audited.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthUser | undefined;

    if (!user || !MUTATING_METHODS.has(request.method)) {
      return next.handle();
    }

    const segments = request.path.split('/').filter(Boolean); // ['api','v1','treatments',':id',...]
    const entity = segments[2] ?? 'unknown';
    if (entity === 'auth') return next.handle();

    const entityId =
      segments.slice(3).find((seg) => OBJECT_ID_RE.test(seg)) ??
      segments[3] ??
      null;

    return next.handle().pipe(
      tap(() =>
        this.auditService.record({
          userId: user.userId,
          userEmail: user.email,
          method: request.method,
          path: request.path,
          entity,
          entityId,
        }),
      ),
    );
  }
}
