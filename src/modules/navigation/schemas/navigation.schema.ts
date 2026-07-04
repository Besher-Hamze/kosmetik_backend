import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  LocalizedString,
  LocalizedStringSchema,
} from '../../../common/schemas/localized-string.schema';

@Schema({ _id: false })
export class NavItem {
  @Prop({ required: true })
  key: string;

  @Prop({ type: LocalizedStringSchema, required: true })
  label: LocalizedString;

  @Prop({ default: '' })
  href: string;

  @Prop({ default: false })
  hidden: boolean;
}
export const NavItemSchema = SchemaFactory.createForClass(NavItem);

export type NavigationDocument = HydratedDocument<Navigation>;

@Schema({ collection: 'navigation', timestamps: true })
export class Navigation {
  @Prop({ type: [NavItemSchema], default: [] })
  quickMenu: NavItem[];

  @Prop({ type: [NavItemSchema], default: [] })
  legalMenu: NavItem[];
}

export const NavigationSchema = SchemaFactory.createForClass(Navigation);
