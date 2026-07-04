import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from './localized-string.schema';

@Schema({ _id: false })
export class Seo {
  @Prop({ type: LocalizedStringSchema })
  title?: LocalizedString;

  @Prop({ type: LocalizedStringSchema })
  description?: LocalizedString;
}

export const SeoSchema = SchemaFactory.createForClass(Seo);
