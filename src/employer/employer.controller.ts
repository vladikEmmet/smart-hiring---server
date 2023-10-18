import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { EmployerService } from './employer.service';
import { CreateEmployerDto } from './dto/create-employer.dto';
import { UpdateEmployerDto } from './dto/update-employer.dto';
import { RemoveEmployerDto } from './dto/remove-employer.dto';

@Controller('employer')
export class EmployerController {
  constructor(private readonly employerService: EmployerService) {}

  @Post("register")
  @HttpCode(200)
  register(@Body() createEmployerDto: CreateEmployerDto) {
    return this.employerService.register(createEmployerDto);
  }

  @Post("login")
  @HttpCode(200)
  login(@Body() removeEmployerDto: RemoveEmployerDto) {
    const {email, password} = removeEmployerDto;
    return this.employerService.login(email, password);
  }

  @Patch(':id')
  @HttpCode(200)
  update(@Param('id') id: string, @Body() updateEmployerDto: UpdateEmployerDto) {
    return this.employerService.update(+id, updateEmployerDto);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string, @Body() removeEmployerDto: RemoveEmployerDto) {
    return this.employerService.remove(+id, removeEmployerDto);
  }
}
