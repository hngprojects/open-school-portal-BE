import * as bcrypt from 'bcrypt';

export class password_util {
  private static readonly salt_round = 10;

  static async hashPassword(password: string): Promise<string> {
    const result = await bcrypt.hash(password, this.salt_round);
    return result;
  }

  static async comparePassword(
    rawString: string,
    hashedString: string,
  ): Promise<boolean> {
    const result = await bcrypt.compare(rawString, hashedString);
    return result;
  }
}
