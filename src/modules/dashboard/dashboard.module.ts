import { Module } from '@nestjs/common';

import { ResolverModule } from './resolver/resolver.module';
import { StudentDashboardModule } from './student-dashboard/student-dashboard.module';

@Module({
  imports: [ResolverModule, StudentDashboardModule],
})
export class DashboardModule {}
