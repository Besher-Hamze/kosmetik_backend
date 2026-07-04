import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReorderDto } from '../../common/dto/reorder.dto';
import { rethrowDuplicateKey } from '../../common/helpers/mongo.helper';
import { CreateAlbumDto, UpdateAlbumDto } from './dto/album.dto';
import { Album, AlbumDocument } from './schemas/album.schema';

@Injectable()
export class GalleryService {
  constructor(
    @InjectModel(Album.name) private readonly albumModel: Model<AlbumDocument>,
  ) {}

  async findAll(): Promise<Album[]> {
    return this.albumModel.find().sort({ order: 1 }).lean();
  }

  async findBySlug(slug: string): Promise<Album> {
    const doc = await this.albumModel.findOne({ slug }).lean();
    if (!doc) throw new NotFoundException(`Album '${slug}' not found`);
    return doc;
  }

  async create(dto: CreateAlbumDto): Promise<Album> {
    try {
      const created = await this.albumModel.create(dto);
      return created.toObject();
    } catch (error) {
      rethrowDuplicateKey(error, 'Album');
    }
  }

  async update(id: string, dto: UpdateAlbumDto): Promise<Album> {
    try {
      const doc = await this.albumModel
        .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
        .lean();
      if (!doc) throw new NotFoundException('Album not found');
      return doc;
    } catch (error) {
      rethrowDuplicateKey(error, 'Album');
    }
  }

  async reorder(dto: ReorderDto): Promise<{ updated: number }> {
    const result = await this.albumModel.bulkWrite(
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
    const result = await this.albumModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Album not found');
    return { deleted: true };
  }
}
