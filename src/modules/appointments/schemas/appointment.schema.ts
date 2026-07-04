import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AppointmentType = 'treatment' | 'course';
export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({ collection: 'appointments', timestamps: true })
export class Appointment {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ default: '' })
  email?: string;

  @Prop({ type: String, enum: ['treatment', 'course'], required: true })
  type: AppointmentType;

  @Prop({ required: true })
  serviceSlug: string;

  @Prop({ required: true })
  serviceName: string;

  @Prop({ type: Date, required: true })
  preferredDate: Date;

  @Prop({ default: '' })
  preferredTime?: string;

  @Prop({ default: '' })
  message?: string;

  @Prop({ default: 'de' })
  locale: string;

  @Prop({
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: AppointmentStatus;

  @Prop({ default: '' })
  adminNote?: string;

  createdAt?: Date;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
AppointmentSchema.index({ status: 1, preferredDate: 1 });
