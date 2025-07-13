import { Module } from '@nestjs/common';
import { AuthorController } from './author.controller';
import { AuthorService } from './author.service';
import { UserModule } from '../user/user.module';
import { GoogleIntegrationService } from '../google/google.integration';

@Module({
  imports: [UserModule],
  controllers: [AuthorController],
  providers: [AuthorService, GoogleIntegrationService],
})
export class AuthorModule {} 