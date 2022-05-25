import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag) private readonly repository: Repository<Tag>
  ) {}

  async create(createTagDto: CreateTagDto) {
    return 'This action adds a new tag';
  }

  async findAll(): Promise<Tag[]> {
    return await this.repository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} tag`;
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return `This action updates a #${id} tag`;
  }

  remove(id: number) {
    return `This action removes a #${id} tag`;
  }
}
