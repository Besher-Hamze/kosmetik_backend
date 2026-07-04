import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
  parseSort,
} from '../../common/helpers/pagination.helper';
import {
  CreateTestimonialDto,
  SubmitTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonial.dto';
import {
  Testimonial,
  TestimonialDocument,
} from './schemas/testimonial.schema';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name)
    private readonly testimonialModel: Model<TestimonialDocument>,
  ) {}

  async findApproved(): Promise<Testimonial[]> {
    return this.testimonialModel
      .find({ isApproved: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
  }

  async submitPublic(dto: SubmitTestimonialDto): Promise<Testimonial> {
    const created = await this.testimonialModel.create({
      name: dto.name,
      text: dto.text,
      rating: dto.rating,
      source: 'website',
      isApproved: false,
    });
    return created.toObject();
  }

  async findAllAdmin(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Testimonial>> {
    const { page, limit } = query;
    const filter = query.search
      ? { name: { $regex: query.search, $options: 'i' } }
      : {};
    const sort = parseSort(query.sort, { createdAt: -1 });
    const [data, total] = await Promise.all([
      this.testimonialModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.testimonialModel.countDocuments(filter),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  async create(dto: CreateTestimonialDto): Promise<Testimonial> {
    const created = await this.testimonialModel.create(dto);
    return created.toObject();
  }

  async update(id: string, dto: UpdateTestimonialDto): Promise<Testimonial> {
    const doc = await this.testimonialModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .lean();
    if (!doc) throw new NotFoundException('Testimonial not found');
    return doc;
  }

  async setApproved(id: string, isApproved: boolean): Promise<Testimonial> {
    const doc = await this.testimonialModel
      .findByIdAndUpdate(id, { isApproved }, { new: true })
      .lean();
    if (!doc) throw new NotFoundException('Testimonial not found');
    return doc;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.testimonialModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Testimonial not found');
    return { deleted: true };
  }
}
