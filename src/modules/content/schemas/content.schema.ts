import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export const CONTENT_KEYS = ['homepage', 'courses-intro', 'about'] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];

export type ContentDocument = HydratedDocument<Content>;

@Schema({ collection: 'contents', timestamps: true })
export class Content {
  @Prop({ required: true, unique: true, enum: CONTENT_KEYS })
  key: ContentKey;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  data: Record<string, unknown>;
}

export const ContentSchema = SchemaFactory.createForClass(Content);
