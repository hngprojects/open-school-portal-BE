import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AcademicSessionModule } from '../academic-session/academic-session.module';
import { ClassModule } from '../class/class.module';
import { FileModule } from '../shared/file/file.module';
import { UserModule } from '../user/user.module';

import { StudentController } from './controllers';
import { Student } from './entities';
import { StudentModelAction } from './model-actions';
import { StudentService } from './services';

//these import is added on the provide to enable sudent growth graph calculation

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    forwardRef(() => UserModule),
    forwardRef(() => FileModule),
    forwardRef(() => ClassModule),
    forwardRef(() => AcademicSessionModule),
  ],
  controllers: [StudentController],
  providers: [StudentService, StudentModelAction],
  exports: [StudentModelAction, StudentService],
})
export class StudentModule {}
