import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';
import { hash, verify } from 'argon2';
import { PrismaService } from 'src/prisma.service';
import { RemoveEmployerDto } from './dto/remove-employer.dto';

@Injectable()
export class EmployerService {
  constructor(private readonly prisma: PrismaService) {}
  async register(createEmployerDto: CreateEmployerDto) {
    const { email } = createEmployerDto;
    const employer = await this.prisma.employer.findUnique({
      where: {
        email,
      },
    });
    if (employer) throw new BadRequestException("User already exists");
    return this.create(createEmployerDto);
  }

  async update(id: number, updateEmployerDto: UpdateEmployerDto) {
    const employer = await this.prisma.employer.findUnique({
      where: {
        id,
      },
    });
    if (!employer) throw new BadRequestException("User not found");
    const { email, password, name, company, phone, website, about, location } = updateEmployerDto;
    const hashedPassword = await hash(password);
    return this.prisma.employer.update({
      where: {
        id,
      },
      data: {
        email: email || employer.email,
        password: hashedPassword,
        name: name || employer.name,
        company: company || employer.company,
        phone: phone || employer.phone,
        website: website || employer.website,
        about: about || employer.about,
        location: location || employer.location,
      },
    });
  }

  async login(email: string, password: string) {
    const employer = await this.verify(email, password);
    return employer;
  }

  async remove(id: number, removeEmployerDto: RemoveEmployerDto) {
    const { email, password } = removeEmployerDto;
    const employer = await this.verify(email, password);
    return await this.prisma.employer.delete({
      where: {
        id,
      },
    });
  }

  // Distribute methods

  async findEmployerById(id: number) {
    return this.prisma.employer.findUnique({
      where: {
        id,
      },
    });
  }

  // private methods

  async create(createEmployerDto: CreateEmployerDto) {
    const { email, password, name, company, phone, website, about, location } = createEmployerDto;
    const hashedPassword = await hash(password);
    return this.prisma.employer.create({
      data: {
        email,
        password: hashedPassword,
        name,
        company,
        phone,
        website,
        location,
        about,
      },
    });
  }

  async verify(email: string, password: string) {
    const employer = await this.prisma.employer.findUnique({
      where: {
        email,
      },
    });
    if (!employer) throw new BadRequestException("Invalid email or password");
    const valid = await verify(employer.password, password);
    if (!valid) throw new BadRequestException("Invalid email or password");
    const { password: _, ...result } = employer;
    return result;
  }
}
