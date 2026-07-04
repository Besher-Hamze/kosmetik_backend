import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomInt } from 'crypto';
import { Model } from 'mongoose';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { rethrowDuplicateKey } from '../../common/helpers/mongo.helper';
import {
  buildPaginatedResult,
  PaginatedResult,
  parseSort,
} from '../../common/helpers/pagination.helper';
import { LocalizedString } from '../../common/schemas/localized-string.schema';
import {
  IssueCertificateDto,
  UpdateCertificateDto,
} from './dto/certificate.dto';
import {
  Certificate,
  CertificateDocument,
} from './schemas/certificate.schema';

export interface VerificationResult {
  valid: boolean;
  studentName?: string;
  courseName?: LocalizedString | string;
  issueDate?: Date;
}

// Unambiguous charset (no 0/O/1/I) for human-friendly codes.
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectModel(Certificate.name)
    private readonly certificateModel: Model<CertificateDocument>,
  ) {}

  generateCode(issueDate: Date = new Date()): string {
    const year = issueDate.getFullYear();
    let random = '';
    for (let i = 0; i < 5; i += 1) {
      random += CODE_CHARS[randomInt(CODE_CHARS.length)];
    }
    return `KK-${year}-${random}`;
  }

  async issue(dto: IssueCertificateDto): Promise<Certificate> {
    // Retry a few times in the (unlikely) case of a generated-code collision.
    for (let attempt = 0; ; attempt += 1) {
      const code =
        dto.code?.toUpperCase() ?? this.generateCode(dto.issueDate);
      try {
        const created = await this.certificateModel.create({
          ...dto,
          code,
          isValid: dto.isValid ?? true,
        });
        return created.toObject();
      } catch (error) {
        const isDuplicate = (error as { code?: number })?.code === 11000;
        if (!isDuplicate || dto.code || attempt >= 4) {
          rethrowDuplicateKey(error, 'Certificate');
        }
      }
    }
  }

  async verify(code: string): Promise<VerificationResult> {
    const cert = await this.certificateModel
      .findOne({ code: code.toUpperCase().trim() })
      .lean();
    if (!cert || !cert.isValid) return { valid: false };
    if (cert.expiryDate && cert.expiryDate.getTime() < Date.now()) {
      return { valid: false };
    }
    return {
      valid: true,
      studentName: cert.studentName,
      courseName: cert.courseName,
      issueDate: cert.issueDate,
    };
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Certificate>> {
    const { page, limit } = query;
    const filter = query.search
      ? {
          $or: [
            { code: { $regex: query.search, $options: 'i' } },
            { studentName: { $regex: query.search, $options: 'i' } },
            { courseSlug: { $regex: query.search, $options: 'i' } },
          ],
        }
      : {};
    const sort = parseSort(query.sort, { issueDate: -1 });
    const [data, total] = await Promise.all([
      this.certificateModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.certificateModel.countDocuments(filter),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string): Promise<Certificate> {
    const doc = await this.certificateModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Certificate not found');
    return doc;
  }

  async update(id: string, dto: UpdateCertificateDto): Promise<Certificate> {
    try {
      const update = dto.code ? { ...dto, code: dto.code.toUpperCase() } : dto;
      const doc = await this.certificateModel
        .findByIdAndUpdate(id, update, { new: true, runValidators: true })
        .lean();
      if (!doc) throw new NotFoundException('Certificate not found');
      return doc;
    } catch (error) {
      rethrowDuplicateKey(error, 'Certificate');
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.certificateModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Certificate not found');
    return { deleted: true };
  }
}
