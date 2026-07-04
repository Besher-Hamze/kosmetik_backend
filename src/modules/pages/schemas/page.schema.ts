import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../../common/schemas/localized-string.schema';

@Schema({ _id: false })
export class PageSection {
  @Prop({ type: LocalizedStringSchema, required: true })
  heading: LocalizedString;

  @Prop({ type: LocalizedStringSchema, required: true })
  body: LocalizedString;
}

export const PageSectionSchema = SchemaFactory.createForClass(PageSection);

export type PageDocument = HydratedDocument<Page>;

@Schema({ collection: 'pages', timestamps: true })
export class Page {
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ type: LocalizedStringSchema, required: true })
  title: LocalizedString;

  @Prop({ type: [PageSectionSchema], default: [] })
  sections: PageSection[];
}

export const PageSchema = SchemaFactory.createForClass(Page);
