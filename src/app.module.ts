import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TagModule } from './tag/tag.module';
import { config } from '../ormconfig';

@Module({
  imports: [TypeOrmModule.forRoot(config), TagModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
