import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployerDto } from './create-employer.dto';



export class UpdateEmployerDto extends PartialType(CreateEmployerDto) {
    email: string;
    password: string;
    name?: string;
    avatar?: string;
    about: string;
    location?: string;
    website?: string;
    phone?: string;
    company: string;
}
