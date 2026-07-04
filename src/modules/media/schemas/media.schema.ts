import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../../common/schemas/localized-string.schema';

export type MediaDocument = HydratedDocument<Media>;

@Schema({ collection: 'media', timestamps: true })
export class Media {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  url: string;

  @Prop({ default: '' })
  thumbUrl?: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop({ type: Number, default: null })
  width?: number | null;

  @Prop({ type: Number, default: null })
  height?: number | null;

  @Prop({ type: LocalizedStringSchema })
  alt?: LocalizedString;

  @Prop({ required: true })
  folder: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
