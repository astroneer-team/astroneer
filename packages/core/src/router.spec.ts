import { AstroneerRouter } from './router';

describe('AstroneerRouter', () => {
  let router: AstroneerRouter;

  beforeEach(() => {
    router = new AstroneerRouter();
  });

  it('should preload routes', async () => {
    await router.preloadRoutes();
  });
});
