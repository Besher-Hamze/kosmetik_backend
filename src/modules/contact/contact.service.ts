import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  buildPaginatedResult,
  PaginatedResult,
  parseSort,
} from '../../common/helpers/pagination.helper';
import {
  ContactListQueryDto,
  CreateContactMessageDto,
} from './dto/contact.dto';
import {
  ContactMessage,
  ContactMessageDocument,
} from './schemas/contact-message.schema';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name)
    private readonly contactModel: Model<ContactMessageDocument>,
  ) {}

  async create(dto: CreateContactMessageDto): Promise<ContactMessage> {
    const created = await this.contactModel.create({
      ...dto,
      locale: dto.locale ?? 'de',
      isRead: false,
    });
    return created.toObject();
  }

  async findAll(
    query: ContactListQueryDto,
  ): Promise<PaginatedResult<ContactMessage>> {
    const { page, limit } = query;
    const filter: QueryFilter<ContactMessage> = {};
    if (query.isRead !== undefined) filter.isRead = query.isRead;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { subject: { $regex: query.search, $options: 'i' } },
        { message: { $regex: query.search, $options: 'i' } },
      ];
    }
    const sort = parseSort(query.sort, { createdAt: -1 });
    const [data, total] = await Promise.all([
      this.contactModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.contactModel.countDocuments(filter),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  async setRead(id: string, isRead: boolean): Promise<ContactMessage> {
    const doc = await this.contactModel
      .findByIdAndUpdate(id, { isRead }, { new: true })
      .lean();
    if (!doc) throw new NotFoundException('Contact message not found');
    return doc;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.contactModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Contact message not found');
    return { deleted: true };
  }
}
