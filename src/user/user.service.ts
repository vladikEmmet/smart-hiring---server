import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hash, verify } from "argon2";
import { RemoveUserDto } from './dto/remove-user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  
    if (!user) throw new BadRequestException("User not found");
  
    const { email, password, name, age, experience, skills, about, avatar } = updateUserDto;
    const hashedPassword = await hash(password);
  
    // Проверяем, приходит ли опыт (experience) от пользователя
    if (experience) {
      // Если опыт приходит, создаем/обновляем записи опыта
      await Promise.all(
        experience.map(async (exp) => {
          if (exp.id) {
            // Если есть идентификатор, обновляем существующую запись опыта
            return this.prisma.experience.update({
              where: { id: exp.id },
              data: {
                title: exp.title,
                company: exp.company,
                startDate: exp.startDate,
                endDate: exp.endDate || null,
                description: exp.description || null,
                location: exp.location || null,
                current: exp.current,
              },
            });
          } else {
            // Если нет идентификатора, создаем новую запись опыта
            return this.prisma.experience.create({
              data: {
                title: exp.title,
                company: exp.company,
                startDate: exp.startDate,
                endDate: exp.endDate,
                description: exp.description,
                location: exp.location,
                current: exp.current,
                userId: user.id,
              },
            });
          }
        })
      );
    }
    // Проверяем, приходят ли скиллы (skills) от пользователя
    if (skills) {
      // Если скиллы приходят, создаем/обновляем записи скиллов
      await Promise.all(
        skills.map(async (skill) => {
          if (skill.id) {
            // Если есть идентификатор, обновляем существующую запись скилла
            return this.prisma.skill.update({
              where: { id: skill.id },
              data: {
                name: skill.name,
              },
            });
          } else {
            // Если нет идентификатора, создаем новую запись скилла
            return this.prisma.skill.create({
              data: {
                name: skill.name,
                users: {
                  connect: { id: user.id }, // Связываем с пользователем
                },
              },
            });
          }
        })
      );
    }
  
    // Обновляем пользователя с учетом введенных данных
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        email: email || user.email,
        password: hashedPassword,
        name: name || user.name,
        age: age || user.age,
        about: about || user.about,
        avatar: avatar || user.avatar,
      },
      include: {
        experience: true,
        skills: true,
      }
    });
  }

  async remove(id: number, removeUserDto: RemoveUserDto) {
    const { email, password } = removeUserDto;
    const user = await this.verify(email, password);
    return this.prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const { email } = createUserDto;
      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (user) throw new BadRequestException("User already exists");
      return this.create(createUserDto);
    } catch(err) {
      throw new InternalServerErrorException(err);
    }
  }

  async login(email: string, password: string) {
    const user = await this.verify(email, password);
    return user;
  }

  async removeSkill(id: number, skillId: number) {
    return this.prisma.user.update({
      where: {
        id,
      },
      data: {
        skills: {
          disconnect: {
            id: skillId,
          },
        },
      },
      include: {
        skills: true,
      }
    });
  }


  // private methods

  async create(createUserDto: CreateUserDto) {
    const { email, password, name, age } = createUserDto;
    const hashedPassword = await hash(password);
    return this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        age,
      },
    });
  }

  async verify(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) throw new BadRequestException("Invalid email or password");
    const valid = await verify(user.password, password);
    if (!valid) throw new BadRequestException("Invalid email or password");
    const { password: _, ...result } = user;
    return result;
  }
}
