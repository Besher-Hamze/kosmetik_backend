import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Settings, SettingsDocument } from './schemas/settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name)
    private readonly settingsModel: Model<SettingsDocument>,
  ) {}

  async get(): Promise<Settings> {
    const doc = await this.settingsModel.findOne().lean();
    if (!doc) throw new NotFoundException('Settings not configured yet');
    return doc;
  }

  async upsert(dto: UpdateSettingsDto): Promise<Settings> {
    const doc = await this.settingsModel
      .findOneAndUpdate({}, { $set: dto }, { new: true, upsert: true })
      .lean();
    return doc;
  }
}
