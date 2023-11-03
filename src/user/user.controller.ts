import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateSkill, UpdateUserDto } from './dto/update-user.dto';
import { RemoveUserDto } from './dto/remove-user.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { RefreshJwtGuard } from 'src/guards/refresh.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  @HttpCode(200)
  register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  @Post("login")
  @HttpCode(200)
  login(@Body() removeUserDto: RemoveUserDto) {
    const {email, password} = removeUserDto;
    return this.userService.login(email, password);
  }

  @Patch(':id')
  @HttpCode(200)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Post(":userId/add-skill/:skillId")
  @HttpCode(200)
  addSkill(@Param("userId") userId: string, @Param("skillId") skillId: string) {
    return this.userService.addSkill(+userId, +skillId);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string, @Body() removeUserDto: RemoveUserDto) {
    return this.userService.remove(+id, removeUserDto);
  }

  @Get()
  getAll() {
    return this.userService.getAll();
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.userService.getProfile(+id);
  }

  @UseGuards(RefreshJwtGuard)
  @Post("refresh")
  @HttpCode(200)
  refresh(@Request() req) {
    return this.userService.refresh(req.user);
  }

  @UseGuards(JwtGuard)
  @Patch(":userId/update-lvl/:skillId")
  @HttpCode(200)
  updateLvl(@Param("userId") userId: string, @Param("skillId") skillId: string, @Body() body: UpdateSkill) {
    const {level} = body;
    return this.userService.updateLvl(+userId, +skillId, level);
  }

  @Get("/employers")
  getEmployers() {
    return this.userService.getEmployers();
  }
}
