import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../../common/schemas/localized-string.schema';

@Schema({ _id: false })
export class AlbumImage {
  @Prop({ required: true })
  src: string;

  @Prop({ type: LocalizedStringSchema })
  alt: LocalizedString;

  @Prop({ default: 0 })
  order: number;
}
export const AlbumImageSchema = SchemaFactory.createForClass(AlbumImage);

export type AlbumDocument = HydratedDocument<Album>;

@Schema({ collection: 'galleryalbums', timestamps: true })
export class Album {
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ type: LocalizedStringSchema, required: true })
  title: LocalizedString;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: [AlbumImageSchema], default: [] })
  images: AlbumImage[];
}

export const AlbumSchema = SchemaFactory.createForClass(Album);
