import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import {
  buildPaginatedResult,
  PaginatedResult,
} from '../../common/helpers/pagination.helper';
import { AuthUser } from '../../common/types/auth-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

const BCRYPT_COST = 12;
const SAFE_PROJECTION = '-passwordHash';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /** Includes passwordHash — for internal auth use only. */
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findByIdInternal(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async create(dto: CreateUserDto, currentUser: AuthUser): Promise<User> {
    if (dto.role && currentUser.role !== 'superadmin') {
      throw new ForbiddenException('Only superadmin can assign roles');
    }
    const existing = await this.userModel.findOne({
      email: dto.email.toLowerCase(),
    });
    if (existing) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }
    const created = await this.userModel.create({
      email: dto.email.toLowerCase(),
      passwordHash: await bcrypt.hash(dto.password, BCRYPT_COST),
      name: dto.name,
      role: dto.role ?? 'editor',
      isActive: dto.isActive ?? true,
    });
    const obj = created.toObject() as Partial<User>;
    delete obj.passwordHash;
    return obj as User;
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<User>> {
    const { page, limit } = query;
    const filter = query.search
      ? {
          $or: [
            { email: { $regex: query.search, $options: 'i' } },
            { name: { $regex: query.search, $options: 'i' } },
          ],
        }
      : {};
    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select(SAFE_PROJECTION)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);
    return buildPaginatedResult(data as User[], total, page, limit);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select(SAFE_PROJECTION).lean();
    if (!user) throw new NotFoundException('User not found');
    return user as User;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    currentUser: AuthUser,
  ): Promise<User> {
    if (dto.role && currentUser.role !== 'superadmin') {
      throw new ForbiddenException('Only superadmin can change roles');
    }
    const update: Record<string, unknown> = {};
    if (dto.email) update.email = dto.email.toLowerCase();
    if (dto.name) update.name = dto.name;
    if (dto.role) update.role = dto.role;
    if (dto.isActive !== undefined) update.isActive = dto.isActive;
    if (dto.password) {
      update.passwordHash = await bcrypt.hash(dto.password, BCRYPT_COST);
    }

    if (update.email) {
      const conflict = await this.userModel.findOne({
        email: update.email,
        _id: { $ne: id },
      });
      if (conflict) {
        throw new ConflictException(`Email ${dto.email} is already in use`);
      }
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, update, { new: true })
      .select(SAFE_PROJECTION)
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user as User;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('User not found');
    return { deleted: true };
  }
}
