import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { VacancyModule } from './vacancy/vacancy.module';
import { SkillModule } from './skill/skill.module';

@Module({
  imports: [UserModule, VacancyModule, SkillModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
