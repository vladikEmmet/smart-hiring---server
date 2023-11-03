import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SkillService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createSkillDto: CreateSkillDto) {
    const isExists = await this.prisma.skill.findFirst({
      where: {
        name: createSkillDto.name,
      }
    });
    if(isExists) throw new BadRequestException("Skill already exists");

    const newSkill = await this.prisma.skill.create({
      data: {
        name: createSkillDto.name,
      },
    });
    return newSkill;
  }

  async findAll() {
    return this.prisma.skill.findMany();
  }

  async findOne(id: number) {
    const skill = await this.prisma.skill.findUnique({
      where: {
        id,
      }
    });
    if(!skill) throw new NotFoundException("Skill not found");
    return skill;
  }

  async remove(id: number) {
    const skill = await this.prisma.skill.findUnique({
      where: {
        id,
      }
    });
    if(!skill) throw new NotFoundException("Skill not found");
    return this.prisma.skill.delete({
      where: {id}
    })
  }
}
