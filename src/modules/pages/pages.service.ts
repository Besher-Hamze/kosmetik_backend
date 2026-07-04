import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { rethrowDuplicateKey } from '../../common/helpers/mongo.helper';
import { CreatePageDto, UpdatePageDto } from './dto/create-page.dto';
import { Page, PageDocument } from './schemas/page.schema';

@Injectable()
export class PagesService {
  constructor(
    @InjectModel(Page.name) private readonly pageModel: Model<PageDocument>,
  ) {}

  async findAll(): Promise<Page[]> {
    return this.pageModel.find().sort({ slug: 1 }).lean();
  }

  async findBySlug(slug: string): Promise<Page> {
    const doc = await this.pageModel.findOne({ slug }).lean();
    if (!doc) throw new NotFoundException(`Page '${slug}' not found`);
    return doc;
  }

  async create(dto: CreatePageDto): Promise<Page> {
    try {
      const created = await this.pageModel.create(dto);
      return created.toObject();
    } catch (error) {
      rethrowDuplicateKey(error, 'Page');
    }
  }

  async update(id: string, dto: UpdatePageDto): Promise<Page> {
    try {
      const doc = await this.pageModel
        .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
        .lean();
      if (!doc) throw new NotFoundException('Page not found');
      return doc;
    } catch (error) {
      rethrowDuplicateKey(error, 'Page');
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.pageModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Page not found');
    return { deleted: true };
  }
}
