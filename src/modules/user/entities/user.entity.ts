// This file defines the User interface for type checking purposes,
// as the actual entity definition is not being managed by the AI.
import { BaseEntity } from '../../../entities/base-entity';

export interface IUser extends BaseEntity {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
}
