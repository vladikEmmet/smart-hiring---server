import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

interface Experience {
  id: number
  title: string
  company: string
  startDate: string
  endDate?: string
  description?: string
  location?: string
  current: boolean
}

interface Skills {
    id: number;
    name: string;
    rating: number;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
    password?: string;
    name?: string;
    avatar?: string;
    experience?: Experience[];
    education?: string;
    skills?: Skills[];
    about: string;
}
