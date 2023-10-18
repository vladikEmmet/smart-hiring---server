import { PartialType } from '@nestjs/mapped-types';
import { CreateVacancyDto } from './create-vacancy.dto';

export class UpdateVacancyDto extends PartialType(CreateVacancyDto) {
    id: number;
    title: string;
    company: string;
    description: string;
    location: string;
    salary: number;
}
