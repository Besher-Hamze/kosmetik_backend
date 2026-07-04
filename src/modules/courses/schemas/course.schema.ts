import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../../common/schemas/localized-string.schema';
import { Seo, SeoSchema } from '../../../common/schemas/seo.schema';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ collection: 'courses', timestamps: true })
export class Course {
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: LocalizedStringSchema, required: true })
  name: LocalizedString;

  @Prop({ type: LocalizedStringSchema })
  subtitle?: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  duration: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  schedule: LocalizedString;

  @Prop({ type: Number, default: null })
  priceFrom: number | null;

  @Prop({ type: LocalizedStringSchema, required: true })
  excerpt: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  description: LocalizedString;

  @Prop({ type: [LocalizedStringSchema], default: [] })
  curriculum: LocalizedString[];

  @Prop({ type: LocalizedStringSchema, required: true })
  certificate: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  audience: LocalizedString;

  @Prop({ default: '' })
  image?: string;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ type: SeoSchema })
  seo?: Seo;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
CourseSchema.index({ isPublished: 1, order: 1 });
