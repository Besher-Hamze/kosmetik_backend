import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ collection: 'auditlogs', timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class AuditLog {
  @Prop({ required: true })
  userId: string;

  @Prop({ default: '' })
  userEmail: string;

  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  entity: string;

  @Prop({ default: null, type: String })
  entityId: string | null;

  timestamp?: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ timestamp: -1 });
