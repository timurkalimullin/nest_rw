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
}
