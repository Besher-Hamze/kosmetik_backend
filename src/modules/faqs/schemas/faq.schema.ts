import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../../common/schemas/localized-string.schema';

export type FaqDocument = HydratedDocument<Faq>;

@Schema({ collection: 'faqs', timestamps: true })
export class Faq {
  @Prop({ default: 0 })
  order: number;

  @Prop({ type: LocalizedStringSchema, required: true })
  question: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  answer: LocalizedString;

  @Prop({ default: true })
  isPublished: boolean;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
FaqSchema.index({ isPublished: 1, order: 1 });
