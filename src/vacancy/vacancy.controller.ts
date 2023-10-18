import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';

@Controller('vacancy')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  @Post(":id")
  create(@Param() id: string, @Body() createVacancyDto: CreateVacancyDto) {
    return this.vacancyService.addVacancy(+id, createVacancyDto);
  }

  @Get()
  findAll() {
    return this.vacancyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vacancyService.findOne(+id);
  }

  @Delete(':employerId/:id')
  remove(@Param("employerId") employerId: string, @Param('id') id: string) {
    return this.vacancyService.remove(+employerId, +id);
  }
}
