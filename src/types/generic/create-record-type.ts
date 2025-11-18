import { EntityManager } from 'typeorm';

type CreateRecordGeneric<CreateRecordPayload> = {
  createPayload: CreateRecordPayload;
  transactionOptions:
    | {
        useTransaction: false;
      }
    | {
        useTransaction: true;
        transaction: EntityManager;
      };
};

export default CreateRecordGeneric;
