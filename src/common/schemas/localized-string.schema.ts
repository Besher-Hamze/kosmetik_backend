import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class LocalizedString {
  @Prop({ type: String, default: '' })
  de: string;

  @Prop({ type: String, default: '' })
  ar: string;
}

export const LocalizedStringSchema =
  SchemaFactory.createForClass(LocalizedString);
