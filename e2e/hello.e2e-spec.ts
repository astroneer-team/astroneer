import { Test } from '@astroneer/testing';

describe('/hello', () => {
  const { start, stop } = Test.createServer();

  beforeAll(async () => await start());
  afterAll(() => stop());

  it('should return a greeting', () => {});
});
