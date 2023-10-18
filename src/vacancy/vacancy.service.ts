import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { PrismaService } from 'src/prisma.service';
import { EmployerService } from 'src/employer/employer.service';

@Injectable()
export class VacancyService {
  constructor(private readonly prisma: PrismaService, private readonly employerServer: EmployerService) {}
  async findAll() {
    const vacancies = await this.prisma.vacancy.findMany({
      include: {
        employer: true,
      },
    });
    return vacancies;
  }

  async findOne(id: number) {
    const vacancy = await this.prisma.vacancy.findUnique({
      where: {
        id,
      },
      include: {
        employer: true,
      },
    });
    if (!vacancy) throw new NotFoundException("Vacancy not found");
    return vacancy;
  }

  async remove(employerId: number, id: number) {
    const employer = await this.employerServer.findEmployerById(employerId);
    if (!employer) throw new BadRequestException("Employer not found or you're not employer");
    const vacancy = await this.prisma.vacancy.findUnique({
      where: {
        id,
      },
    });
    if (!vacancy) throw new NotFoundException("Vacancy not found");
    return this.prisma.vacancy.delete({
      where: {
        id,
      },
    });
  }

  async addVacancy(id: number, vacancy: CreateVacancyDto) {
    const employer = await this.prisma.employer.findUnique({
      where: {
        id,
      },
    });
    if (!employer) throw new BadRequestException("Employer not found or you're not employer");
    const { title, company, description, location, salary } = vacancy;
    return this.prisma.vacancy.create({
      data: {
        title,
        company,
        description,
        location,
        salary,
        employer: {
          connect: {
            id,
          },
        },
      },
    });
  }
}
