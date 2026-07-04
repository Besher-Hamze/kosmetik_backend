import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Content,
  CONTENT_KEYS,
  ContentDocument,
  ContentKey,
} from './schemas/content.schema';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Content.name)
    private readonly contentModel: Model<ContentDocument>,
  ) {}

  private assertKey(key: string): ContentKey {
    if (!CONTENT_KEYS.includes(key as ContentKey)) {
      throw new BadRequestException(
        `Unknown content key '${key}'. Valid keys: ${CONTENT_KEYS.join(', ')}`,
      );
    }
    return key as ContentKey;
  }

  async get(key: string): Promise<Content> {
    const validKey = this.assertKey(key);
    const doc = await this.contentModel.findOne({ key: validKey }).lean();
    if (!doc) throw new NotFoundException(`Content '${key}' not found`);
    return doc;
  }

  async upsert(key: string, data: Record<string, unknown>): Promise<Content> {
    const validKey = this.assertKey(key);
    const doc = await this.contentModel
      .findOneAndUpdate(
        { key: validKey },
        { key: validKey, data },
        { new: true, upsert: true },
      )
      .lean();
    return doc;
  }
}
