import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fandom } from './fandom.entity';
import { FandomService } from './fandom.service';
import { FandomController } from './fandom.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Fandom])],
  providers: [FandomService],
  controllers: [FandomController],
})
export class FandomModule {} 