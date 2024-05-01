import { AstroneerRouter } from './astroneer-router';
import { AstroneerServer } from './astroneer-server';

export function astroneer({
  devmode,
  hostname,
  port,
}: {
  devmode: boolean;
  hostname: string;
  port: number;
}) {
  const router = new AstroneerRouter({
    devmode,
    routesDir: 'routes',
  });

  const app = new AstroneerServer({
    devmode,
    hostname,
    port,
    router,
  });

  return app;
}
