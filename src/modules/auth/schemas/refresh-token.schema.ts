import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ collection: 'refreshtokens', timestamps: { createdAt: true, updatedAt: false } })
export class RefreshToken {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
// MongoDB TTL cleanup for expired tokens.
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
