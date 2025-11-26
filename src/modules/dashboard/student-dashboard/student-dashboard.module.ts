import { Module } from '@nestjs/common';

import { StudentModule } from '../../student/student.module';
import { UserModule } from '../../user/user.module';

import { StudentDashboardController } from './student-dashboard.controller';
import { StudentDashboardService } from './student-dashboard.service';

@Module({
    imports: [UserModule, StudentModule],
    controllers: [StudentDashboardController],
    providers: [StudentDashboardService],
    exports: [StudentDashboardService],
})
export class StudentDashboardModule { }
