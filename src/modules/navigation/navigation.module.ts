import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NavigationController } from './navigation.controller';
import { NavigationService } from './navigation.service';
import { Navigation, NavigationSchema } from './schemas/navigation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Navigation.name, schema: NavigationSchema },
    ]),
  ],
  controllers: [NavigationController],
  providers: [NavigationService],
})
export class NavigationModule {}
