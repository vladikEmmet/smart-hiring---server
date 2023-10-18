import { Module } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { VacancyController } from './vacancy.controller';
import { PrismaService } from 'src/prisma.service';
import { EmployerService } from 'src/employer/employer.service';

@Module({
  controllers: [VacancyController],
  providers: [VacancyService, PrismaService, EmployerService]
})
export class VacancyModule {}
