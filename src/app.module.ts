import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { EmployerModule } from './employer/employer.module';
import { VacancyModule } from './vacancy/vacancy.module';

@Module({
  imports: [UserModule, EmployerModule, VacancyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
