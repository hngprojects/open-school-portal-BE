import { DeepPartial, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import CreateRecordGeneric from '../types/generic/create-record-type';

export abstract class AbstractModelAction<T extends ObjectLiteral> {
  model: EntityTarget<T>;

  constructor(
    protected readonly repository: Repository<T>,
    model: EntityTarget<T>,
  ) {
    this.model = model;
  }

  async create(
    createRecordOptions: CreateRecordGeneric<DeepPartial<T>>,
  ): Promise<T | null> {
    const { createPayload, transactionOptions } = createRecordOptions;

    const modelRepository = transactionOptions.useTransaction
      ? transactionOptions.transaction.getRepository(this.model)
      : this.repository;

    const response: T | null = (await modelRepository.save(
      createPayload,
    )) as T | null;
    return response;
  }

  async get(
    getRecordIdentifierOptions: object,
    queryOptions?: object,
    relations?: object,
  ) {
    return this.repository.findOne({
      where: getRecordIdentifierOptions,
      ...queryOptions,
      relations,
    });
  }
}
