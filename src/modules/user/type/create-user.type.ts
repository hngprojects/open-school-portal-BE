import CreateRecordGeneric from '../../../types/generic/create-record-type';
import UserInterface from '../type/user.interface';

type CreateUserRecordPayload = Partial<UserInterface>;

type CreateUserRecordOptions = CreateRecordGeneric<CreateUserRecordPayload>;

export default CreateUserRecordOptions;
