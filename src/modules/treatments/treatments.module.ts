import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Treatment, TreatmentSchema } from './schemas/treatment.schema';
import { TreatmentsController } from './treatments.controller';
import { TreatmentsService } from './treatments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Treatment.name, schema: TreatmentSchema },
    ]),
  ],
  controllers: [TreatmentsController],
  providers: [TreatmentsService],
})
export class TreatmentsModule {}
