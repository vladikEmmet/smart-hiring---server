export class CreateEmployerDto {
    email: string;
    password: string;
    name?: string;
    about?: string;
    location?: string;
    website?: string;
    phone?: string;
    company: string;
}
