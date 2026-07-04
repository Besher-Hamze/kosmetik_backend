import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../../common/schemas/localized-string.schema';

@Schema({ _id: false })
export class Address {
  @Prop({ default: '' })
  street: string;

  @Prop({ default: '' })
  zip: string;

  @Prop({ default: '' })
  city: string;

  @Prop({ type: LocalizedStringSchema })
  country: LocalizedString;
}
export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ _id: false })
export class ContactInfo {
  @Prop({ default: '' })
  ownerName: string;

  @Prop({ type: AddressSchema })
  address: Address;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  whatsapp: string;
}
export const ContactInfoSchema = SchemaFactory.createForClass(ContactInfo);

@Schema({ _id: false })
export class SocialLinks {
  @Prop({ default: '' })
  instagram: string;

  @Prop({ default: '' })
  tiktok: string;

  @Prop({ default: '' })
  facebook: string;

  @Prop({ default: '' })
  whatsapp: string;
}
export const SocialLinksSchema = SchemaFactory.createForClass(SocialLinks);

@Schema({ _id: false })
export class OpeningHour {
  @Prop({ required: true })
  day: string;

  @Prop({ default: '' })
  open: string;

  @Prop({ default: '' })
  close: string;

  @Prop({ default: false })
  closed: boolean;
}
export const OpeningHourSchema = SchemaFactory.createForClass(OpeningHour);

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({ collection: 'settings', timestamps: true })
export class Settings {
  @Prop({ type: LocalizedStringSchema, required: true })
  siteName: LocalizedString;

  @Prop({ type: LocalizedStringSchema })
  tagline: LocalizedString;

  @Prop({ type: ContactInfoSchema })
  contact: ContactInfo;

  @Prop({ type: SocialLinksSchema })
  social: SocialLinks;

  @Prop({ type: [OpeningHourSchema], default: [] })
  openingHours: OpeningHour[];

  @Prop({ type: Number, default: null })
  foundedYear: number | null;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
