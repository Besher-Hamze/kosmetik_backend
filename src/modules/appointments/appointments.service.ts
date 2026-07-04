import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import {
  buildPaginatedResult,
  PaginatedResult,
  parseSort,
} from '../../common/helpers/pagination.helper';
import {
  AppointmentListQueryDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
} from './dto/appointment.dto';
import {
  Appointment,
  AppointmentDocument,
} from './schemas/appointment.schema';

export interface AppointmentStats {
  byStatus: Record<string, number>;
  upcomingThisWeek: number;
  total: number;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const created = await this.appointmentModel.create({
      ...dto,
      locale: dto.locale ?? 'de',
      status: 'pending',
    });
    return created.toObject();
  }

  async findAll(
    query: AppointmentListQueryDto,
  ): Promise<PaginatedResult<Appointment>> {
    const { page, limit } = query;
    const filter: QueryFilter<Appointment> = {};
    if (query.status) filter.status = query.status;
    if (query.from || query.to) {
      filter.preferredDate = {
        ...(query.from ? { $gte: query.from } : {}),
        ...(query.to ? { $lte: query.to } : {}),
      };
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
        { serviceName: { $regex: query.search, $options: 'i' } },
      ];
    }
    const sort = parseSort(query.sort, { createdAt: -1 });
    const [data, total] = await Promise.all([
      this.appointmentModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.appointmentModel.countDocuments(filter),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  async stats(): Promise<AppointmentStats> {
    const now = new Date();
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const [byStatusRaw, upcomingThisWeek, total] = await Promise.all([
      this.appointmentModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.appointmentModel.countDocuments({
        preferredDate: { $gte: now, $lte: weekAhead },
        status: { $in: ['pending', 'confirmed'] },
      }),
      this.appointmentModel.countDocuments(),
    ]);
    const byStatus: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const row of byStatusRaw) byStatus[row._id] = row.count;
    return { byStatus, upcomingThisWeek, total };
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const doc = await this.appointmentModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .lean();
    if (!doc) throw new NotFoundException('Appointment not found');
    return doc;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.appointmentModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Appointment not found');
    return { deleted: true };
  }
}
