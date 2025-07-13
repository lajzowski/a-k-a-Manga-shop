import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fandom } from './fandom/fandom.entity';
import { FandomService } from './fandom/fandom.service';
import { FandomController } from './fandom/fandom.controller';
import { FandomModule } from './fandom/fandom.module';
import { ReportModule } from './report/report.module';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ReportItem } from './report/report-item.entity';
import { AuthorModule } from './author/author.module';
import { RolesGuard } from './auth/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '5.23.52.14',
      port: 5432,
      username: 'aka_admin',
      password: 'g%5UcDr7ZMnd',
      database: 'shop_prod',
      entities: [Fandom, User, ReportItem],
      migrations: ['dist/migrations/*.js'],
      synchronize: false,
    }),
    FandomModule,
    ReportModule,
    UserModule,
    AuthModule,
    AuthorModule,
  ],
  providers: [
    RolesGuard,
  ],
})
export class AppModule {}

