import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { LocalizedString } from '../../../common/schemas/localized-string.schema';

export type TestimonialSource = 'google' | 'website';
export type TestimonialDocument = HydratedDocument<Testimonial>;

@Schema({ collection: 'testimonials', timestamps: true })
export class Testimonial {
  @Prop({ required: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  text: LocalizedString | string;

  @Prop({ type: Number, min: 1, max: 5, required: true })
  rating: number;

  @Prop({ type: String, enum: ['google', 'website'], default: 'website' })
  source: TestimonialSource;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
TestimonialSchema.index({ isApproved: 1, order: 1 });
