import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { DeepPartial } from 'typeorm/common/DeepPartial';

interface PaginationOptions {
  page?: number;
  limit?: number;
}

export class BaseRepository<T> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async findById(id: string | number, options?: FindOneOptions<T>): Promise<T | null> {
    return await this.repository.findOne({
      where: { id } as any,
      ...options,
    });
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return await this.repository.findOne(options);
  }

  async findMany(options?: FindManyOptions<T>): Promise<T[]> {
    return await this.repository.find(options);
  }

  async update(id: string | number, data: DeepPartial<T>): Promise<T | null> {
    await this.repository.update(id, data as any);
    return await this.findById(id);
  }

  async delete(id: string | number): Promise<void> {
    await this.repository.delete(id);
  }

  async paginate(
    options: FindManyOptions<T> & PaginationOptions,
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, ...findOptions } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      ...findOptions,
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
