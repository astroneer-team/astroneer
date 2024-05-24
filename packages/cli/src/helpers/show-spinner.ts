import { blue, gray } from 'picocolors';

export function showSpinner(message: string) {
  const spinner = {
    interval: 100,
    frames: ['◜', '◠', '◝', '◞', '◡', '◟'],
  };

  let i = 0;

  const interval = setInterval(() => {
    const { frames } = spinner;
    process.stdout.write(`\r${frames[i]} ${blue(message)} ${gray('...')}`);
    i = (i + 1) % frames.length;
  }, spinner.interval);

  const stop = () => {
    clearInterval(interval);
    process.stdout.write('\r' + ' '.repeat(message.length * 1.5) + '\r');
  };

  return { stop };
}

export async function showSpinnerWithPromise<T>(
  promise: () => Promise<T>,
  message: string,
): Promise<T> {
  const { stop } = showSpinner(message);
  return promise().finally(() => stop());
}
