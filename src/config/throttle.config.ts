import { seconds, ThrottlerOptions } from '@nestjs/throttler';

export const DEFAULT_LIMIT: ThrottlerOptions = {
  ttl: seconds(15),
  limit: 30,
};

export const AUTH_LIMIT: ThrottlerOptions = {
  ttl: seconds(60),
  limit: 10,
};

export const SENSITIVE_LIMIT: ThrottlerOptions = {
  ttl: seconds(60),
  limit: 5,
};

export const PUBLIC_LIMIT: ThrottlerOptions = {
  ttl: seconds(60),
  limit: 100,
};
