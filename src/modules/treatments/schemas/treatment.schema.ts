import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../../common/schemas/localized-string.schema';
import { Seo, SeoSchema } from '../../../common/schemas/seo.schema';

@Schema({ _id: false })
export class TreatmentGalleryImage {
  @Prop({ required: true })
  src: string;

  @Prop({ type: LocalizedStringSchema, default: () => ({ de: '', ar: '' }) })
  alt: LocalizedString;

  @Prop({ type: LocalizedStringSchema })
  caption?: LocalizedString;
}

export const TreatmentGalleryImageSchema =
  SchemaFactory.createForClass(TreatmentGalleryImage);

@Schema({ _id: false })
export class TreatmentSection {
  @Prop({ type: LocalizedStringSchema, required: true })
  heading: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  body: LocalizedString;

  @Prop({ type: [TreatmentGalleryImageSchema], default: [] })
  images: TreatmentGalleryImage[];
}

export const TreatmentSectionSchema =
  SchemaFactory.createForClass(TreatmentSection);

@Schema({ _id: false })
export class BeforeAfterPair {
  @Prop({ required: true })
  before: string;

  @Prop({ required: true })
  after: string;

  @Prop({ type: LocalizedStringSchema })
  caption?: LocalizedString;
}

export const BeforeAfterPairSchema =
  SchemaFactory.createForClass(BeforeAfterPair);

export type TreatmentDocument = HydratedDocument<Treatment>;

@Schema({ collection: 'treatments', timestamps: true })
export class Treatment {
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ type: LocalizedStringSchema, required: true })
  name: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  excerpt: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  description: LocalizedString;

  @Prop({ type: [LocalizedStringSchema], default: [] })
  benefits: LocalizedString[];

  @Prop({ type: [TreatmentSectionSchema], default: [] })
  sections: TreatmentSection[];

  @Prop({ type: [TreatmentGalleryImageSchema], default: [] })
  gallery: TreatmentGalleryImage[];

  @Prop({ type: [BeforeAfterPairSchema], default: [] })
  beforeAfter: BeforeAfterPair[];

  @Prop({ default: '' })
  image: string;

  @Prop({ default: true })
  isPublished: boolean;

  @Prop({ type: SeoSchema })
  seo?: Seo;
}

export const TreatmentSchema = SchemaFactory.createForClass(Treatment);
TreatmentSchema.index({ isPublished: 1, order: 1 });
