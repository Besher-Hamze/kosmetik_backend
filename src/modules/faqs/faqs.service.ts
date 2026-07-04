import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ReorderDto } from '../../common/dto/reorder.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
  parseSort,
} from '../../common/helpers/pagination.helper';
import { CreateFaqDto, UpdateFaqDto } from './dto/create-faq.dto';
import { Faq, FaqDocument } from './schemas/faq.schema';

@Injectable()
export class FaqsService {
  constructor(
    @InjectModel(Faq.name) private readonly faqModel: Model<FaqDocument>,
  ) {}

  async findPublished(): Promise<Faq[]> {
    return this.faqModel.find({ isPublished: true }).sort({ order: 1 }).lean();
  }

  async findAllAdmin(query: PaginationQueryDto): Promise<PaginatedResult<Faq>> {
    const { page, limit } = query;
    const filter = query.search
      ? {
          $or: [
            { 'question.de': { $regex: query.search, $options: 'i' } },
            { 'question.ar': { $regex: query.search, $options: 'i' } },
          ],
        }
      : {};
    const sort = parseSort(query.sort, { order: 1 });
    const [data, total] = await Promise.all([
      this.faqModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.faqModel.countDocuments(filter),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  async create(dto: CreateFaqDto): Promise<Faq> {
    const created = await this.faqModel.create(dto);
    return created.toObject();
  }

  async update(id: string, dto: UpdateFaqDto): Promise<Faq> {
    const doc = await this.faqModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .lean();
    if (!doc) throw new NotFoundException('FAQ not found');
    return doc;
  }

  async setPublished(id: string, isPublished: boolean): Promise<Faq> {
    const doc = await this.faqModel
      .findByIdAndUpdate(id, { isPublished }, { new: true })
      .lean();
    if (!doc) throw new NotFoundException('FAQ not found');
    return doc;
  }

  async reorder(dto: ReorderDto): Promise<{ updated: number }> {
    const result = await this.faqModel.bulkWrite(
      dto.items.map((item) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: { order: item.order } },
        },
      })),
    );
    return { updated: result.modifiedCount };
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.faqModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('FAQ not found');
    return { deleted: true };
  }
}
