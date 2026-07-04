import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { Navigation, NavigationDocument } from './schemas/navigation.schema';

@Injectable()
export class NavigationService {
  constructor(
    @InjectModel(Navigation.name)
    private readonly navigationModel: Model<NavigationDocument>,
  ) {}

  async get(): Promise<Navigation> {
    const doc = await this.navigationModel.findOne().lean();
    if (!doc) throw new NotFoundException('Navigation not configured yet');
    return doc;
  }

  async upsert(dto: UpdateNavigationDto): Promise<Navigation> {
    const doc = await this.navigationModel
      .findOneAndUpdate({}, { $set: dto }, { new: true, upsert: true })
      .lean();
    return doc;
  }
}
