import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import * as sysMsg from '../../../constants/system.messages';
import { Class } from '../../class/entities';
import { Fees } from '../../fees/entities/fees.entity';
import { FeesModelAction } from '../../fees/model-action/fees.model-action';
import { FeeNotificationType } from '../../shared/enums';
import { Student } from '../../student/entities';
import { NotificationModelAction } from '../model-actions/notification.model-action';

@Injectable()
export class FeeNotificationService {
  private readonly logger: Logger;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) baseLogger: Logger,
    private readonly notificationModelAction: NotificationModelAction,
    private readonly feesModelAction: FeesModelAction,
  ) {
    this.logger = baseLogger.child({ context: FeeNotificationService.name });
  }

  async createAndUpdateFeesNotification(
    feeId: string,
    type: FeeNotificationType,
  ): Promise<void> {
    const fee = await this.feesModelAction.get({
      identifierOptions: { id: feeId },
      relations: { direct_assignments: { student: { parent: true } } },
    });
    if (!fee) {
      this.logger.error(sysMsg.FEE_NOT_FOUND, { feeId });
      return;
    }
    // const students = fee.direct_assignments.map(
    //   (assignment: FeeAssignment) => assignment.student,
    // );
    const students = this.getFeeStudents(fee);
    this.notificationModelAction.createMany({
      createPayloads: students.map((student) => ({
        title: 'Fee Notification',
        message: `A fee ${fee.component_name} has been ${type} for your child ${student.user.first_name} ${student.user.last_name}.`,
        is_read: false,
        recipient_id: student.parent.user_id,
      })),
      transactionOptions: { useTransaction: false },
    });
    // students.forEach((student) => {
    //   this.notificationModelAction.create({
    //     createPayload: {
    //       title: 'Fee Notification',
    //       message: `A fee ${fee.component_name} has been ${type} for your child ${student.user.first_name} ${student.user.last_name}.`,
    //       is_read: false,
    //       recipient_id: student.parent.user_id,
    //     },
    //     transactionOptions: { useTransaction: false },
    //   });
    // });
  }

  private getFeeStudents(fee: Fees): Student[] {
    const studentSet = new Set<Student>();

    // Students from classes
    fee.classes?.forEach((cls: Class) => {
      cls.student_assignments?.forEach((assignment) => {
        if (assignment?.student) studentSet.add(assignment.student);
      });
    });

    // Directly assigned students
    fee.direct_assignments?.forEach((assignment) => {
      if (assignment?.student) studentSet.add(assignment.student);
    });

    return Array.from(studentSet);
  }
}
