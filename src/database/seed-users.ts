import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcryptjs';

import { AppModule } from '../app.module';
import { User } from '../modules/user/models/user.model';
import { UserService } from '../modules/user/user.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  const adminRegNo = 'admin001';
  const adminPassword = 'SuperSecurePassword123!';

  const existingUser = await userService.getUserByRegNo(adminRegNo);

  if (existingUser) {
    console.log(
      `User with Reg No: ${adminRegNo} already exists. Skipping seed.`,
    );
    await app.close();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  const newUser = new User();
  newUser.reg_no = adminRegNo;
  newUser.password = hashedPassword;

  await userService.createUser({
    createPayload: newUser,
    transactionOptions: { useTransaction: false },
  });

  console.log(
    `Successfully seeded user: ${adminRegNo} with password: ${adminPassword}`,
  );

  await app.close();
}

bootstrap().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
