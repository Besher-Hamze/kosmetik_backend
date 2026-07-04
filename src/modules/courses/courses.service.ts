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
import { CreateCourseDto, UpdateCourseDto } from './dto/create-course.dto';
import { Course, CourseDocument } from './schemas/course.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async findPublished(): Promise<Course[]> {
    return this.courseModel.find({ isPublished: true }).sort({ order: 1 }).lean();
  }

  async findPublishedBySlug(slug: string): Promise<Course> {
    const doc = await this.courseModel.findOne({ slug, isPublished: true }).lean();
    if (!doc) throw new NotFoundException(`Course '${slug}' not found`);
    return doc;
  }

  async findAllAdmin(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Course>> {
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
      this.courseModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.courseModel.countDocuments(filter),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  async findByIdAdmin(id: string): Promise<Course> {
    const doc = await this.courseModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Course not found');
    return doc;
  }

  async create(dto: CreateCourseDto): Promise<Course> {
    try {
      const created = await this.courseModel.create(dto);
      return created.toObject();
    } catch (error) {
      rethrowDuplicateKey(error, 'Course');
    }
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course> {
    try {
      const doc = await this.courseModel
        .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
        .lean();
      if (!doc) throw new NotFoundException('Course not found');
      return doc;
    } catch (error) {
      rethrowDuplicateKey(error, 'Course');
    }
  }

  async setPublished(id: string, isPublished: boolean): Promise<Course> {
    const doc = await this.courseModel
      .findByIdAndUpdate(id, { isPublished }, { new: true })
      .lean();
    if (!doc) throw new NotFoundException('Course not found');
    return doc;
  }

  async reorder(dto: ReorderDto): Promise<{ updated: number }> {
    const result = await this.courseModel.bulkWrite(
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
    const result = await this.courseModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Course not found');
    return { deleted: true };
  }
}
