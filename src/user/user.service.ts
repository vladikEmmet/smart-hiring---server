import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hash, verify } from "argon2";
import { RemoveUserDto } from './dto/remove-user.dto';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  
    if (!user) throw new BadRequestException("User not found");
  
    const { email, password, name, age, experience, skills, about, avatar } = updateUserDto;
    let hashedPassword: string;
    if(password) {
      const hashedPassword = await hash(password);
    }
  
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
        password: hashedPassword || user.password,
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

  async addSkill(userId: number, skillId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true }, // Включаем текущие навыки пользователя
    });
  
    if (!user) throw new BadRequestException('User not found');
  
    const userSkills = user.skills || [];
    const isSkillAlreadyAdded = userSkills.some((userSkill) => userSkill.id === skillId);

    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) throw new BadRequestException('Skill not found');
    
    if (isSkillAlreadyAdded) {
      throw new BadRequestException('Skill already exists for the user');
    }

    // Добавляем новый навык к существующим навыкам пользователя
    // return this.prisma.user.update({
    //   where: { id: userId },
    //   data: {
    //     skills: {
    //       connect: { id: skillId },
    //     },
    //   },
    //   include: { skills: true },
    // });
    const result = await this.prisma.skillUser.create({
      data: {
        user: {connect: {id: userId}},
        skill: {connect: {id: skillId}},
        rating: 0,
      }
    });
    return result;
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
    const { email } = createUserDto;
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (user) throw new BadRequestException("User already exists");
    const newUser = this.create(createUserDto);
    return await this.generateJwt(newUser);
  }

  async login(email: string, password: string) {
    const user = await this.verify(email, password);
    console.log(user);
    return this.generateJwt(user);
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

  async getAll() {
    return this.prisma.user.findMany({
      include: {
        experience: true,
        skills: true,
      }
    });
  }

  async getProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        experience: true,
        skills: {
          include: {
            skill: true,
          }
        },
      }
    });
    if (!user) throw new BadRequestException("User not found");
    return user;
  }

  async getEmployers() {
    const employers = await this.prisma.user.findMany({
      where: {
        role: "EMPLOYER",
      },
      include: {
        experience: true,
        skills: true,
      }
    });
  }

  async refresh(user: any) {
    const payload = {
      username: user.username,
      sub: user.sub,
    };

    return {
      user,
      backendTokens: {
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: "1d",
          secret: process.env.JWT_SECRET,
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: "30d",
          secret: process.env.JWT_REFRESH,
        }),
      }
    }
  }

  async updateLvl(userId: number, skillId: number, newLvl: number) {
    const skill = await this.prisma.skillUser.findFirst({
      where: {
        skillId,
        userId,
      },
    });
  
    if (!skill) throw new NotFoundException("Skill not found");
  
    const updatedSkill = await this.prisma.skillUser.update({
      where: {
        id: skill.id, // Поправлено использование id для умения
      },
      data: {
        rating: newLvl,
      },
    });
  
    return updatedSkill;
  }
  

  // private methods

  async generateJwt(user: any) {
    const payload = { email: user.email, sub: {id: user.id, role: user.role} };
    return {
      user,
      backendTokens: {
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: "1d",
          secret: process.env.JWT_SECRET,
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: "30d",
          secret: process.env.JWT_REFRESH,
        }),
      }
    };
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { email, password } = createUserDto;
      const hashedPassword = await hash(password);
      return this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });
    }catch(err) {
      throw new HttpException(err.message, 500);
    }
  }

  async verify(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        experience: true,
        skills: true,
      }
    });
    if (!user) throw new BadRequestException("Invalid email or password");
    const valid = await verify(user.password, password);
    if (!valid) throw new BadRequestException("Invalid email or password");
    const { password: _, ...result } = user;
    return result;
  }
}
