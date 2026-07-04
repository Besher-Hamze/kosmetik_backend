import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ReorderDto } from '../../common/dto/reorder.dto';
import { rethrowDuplicateKey } from '../../common/helpers/mongo.helper';
import {
  buildPaginatedResult,
  PaginatedResult,
  parseSort,
} from '../../common/helpers/pagination.helper';
import {
  CreateTreatmentDto,
  UpdateTreatmentDto,
} from './dto/create-treatment.dto';
import { Treatment, TreatmentDocument } from './schemas/treatment.schema';

@Injectable()
export class TreatmentsService {
  constructor(
    @InjectModel(Treatment.name)
    private readonly treatmentModel: Model<TreatmentDocument>,
  ) {}

  async findPublished(): Promise<Treatment[]> {
    return this.treatmentModel
      .find({ isPublished: true })
      .sort({ order: 1 })
      .lean();
  }

  async findPublishedBySlug(slug: string): Promise<Treatment> {
    const doc = await this.treatmentModel
      .findOne({ slug, isPublished: true })
      .lean();
    if (!doc) throw new NotFoundException(`Treatment '${slug}' not found`);
    return doc;
  }

  async findAllAdmin(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Treatment>> {
    const { page, limit } = query;
    const filter = query.search
      ? {
          $or: [
            { slug: { $regex: query.search, $options: 'i' } },
            { 'name.de': { $regex: query.search, $options: 'i' } },
            { 'name.ar': { $regex: query.search, $options: 'i' } },
          ],
        }
      : {};
    const sort = parseSort(query.sort, { order: 1 });
    const [data, total] = await Promise.all([
      this.treatmentModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.treatmentModel.countDocuments(filter),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  async findByIdAdmin(id: string): Promise<Treatment> {
    const doc = await this.treatmentModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Treatment not found');
    return doc;
  }

  async create(dto: CreateTreatmentDto): Promise<Treatment> {
    try {
      const created = await this.treatmentModel.create(dto);
      return created.toObject();
    } catch (error) {
      rethrowDuplicateKey(error, 'Treatment');
    }
  }

  async update(id: string, dto: UpdateTreatmentDto): Promise<Treatment> {
    try {
      const doc = await this.treatmentModel
        .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
        .lean();
      if (!doc) throw new NotFoundException('Treatment not found');
      return doc;
    } catch (error) {
      rethrowDuplicateKey(error, 'Treatment');
    }
  }

  async setPublished(id: string, isPublished: boolean): Promise<Treatment> {
    const doc = await this.treatmentModel
      .findByIdAndUpdate(id, { isPublished }, { new: true })
      .lean();
    if (!doc) throw new NotFoundException('Treatment not found');
    return doc;
  }

  async reorder(dto: ReorderDto): Promise<{ updated: number }> {
    const result = await this.treatmentModel.bulkWrite(
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
    const result = await this.treatmentModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Treatment not found');
    return { deleted: true };
  }
}
