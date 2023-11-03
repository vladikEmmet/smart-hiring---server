import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class VacancyService {
  constructor(private readonly prisma: PrismaService, private readonly userService: UserService) {}
  async findAll() {
    const vacancies = await this.prisma.vacancy.findMany({
      include: {
        user: true,
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
        user: true,
      },
    });
    if (!vacancy) throw new NotFoundException("Vacancy not found");
    return vacancy;
  }

  async remove(employerId: number, id: number) {
    const employer = await this.userService.getProfile(employerId);
    if (!employer || employer.role !== "EMPLOYER") throw new BadRequestException("Employer not found or you're not employer");
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
    const employer = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    if(employer.role !== "EMPLOYER") throw new BadRequestException("You're not employer");
    if (!employer) throw new BadRequestException("Employer not found or you're not employer");
    const { title, company, description, location, salary } = vacancy;
    return this.prisma.vacancy.create({
      data: {
        title,
        company,
        description,
        location,
        salary,
        user: {
          connect: {
            id,
          },
        },
      },
    });
  }
}
