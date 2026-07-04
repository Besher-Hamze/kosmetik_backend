import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/helpers/pagination.helper';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

export interface AuditEntry {
  userId: string;
  userEmail: string;
  method: string;
  path: string;
  entity: string;
  entityId: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditModel: Model<AuditLogDocument>,
  ) {}

  record(entry: AuditEntry): void {
    // Fire-and-forget: audit logging must never break the actual request.
    this.auditModel
      .create(entry)
      .catch((err: Error) =>
        this.logger.warn(`Failed to write audit log: ${err.message}`),
      );
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<AuditLog>> {
    const { page, limit } = query;
    const filter = query.search
      ? {
          $or: [
            { path: { $regex: query.search, $options: 'i' } },
            { entity: { $regex: query.search, $options: 'i' } },
            { userEmail: { $regex: query.search, $options: 'i' } },
          ],
        }
      : {};
    const [data, total] = await Promise.all([
      this.auditModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.auditModel.countDocuments(filter),
    ]);
    return buildPaginatedResult(data as AuditLog[], total, page, limit);
  }
}
