import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { LocalizedString } from '../../../common/schemas/localized-string.schema';

export type CertificateDocument = HydratedDocument<Certificate>;

@Schema({ collection: 'certificates', timestamps: true })
export class Certificate {
  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ required: true })
  studentName: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  courseName: LocalizedString | string;

  @Prop({ default: '' })
  courseSlug?: string;

  @Prop({ type: Date, required: true })
  issueDate: Date;

  @Prop({ type: Date, default: null })
  expiryDate?: Date | null;

  @Prop({ default: '' })
  pdfUrl?: string;

  @Prop({ default: true })
  isValid: boolean;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);
