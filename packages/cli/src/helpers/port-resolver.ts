export async function portResolver(port: string): Promise<number> {
  const parsedPort = parseInt(port, 10);

  if (isNaN(parsedPort)) {
    throw new Error('Port must be a number');
  }

  if (parsedPort < 0 || parsedPort > 65535) {
    throw new Error('Port must be between 0 and 65535');
  }

  return parsedPort;
}
