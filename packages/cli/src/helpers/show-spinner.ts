import { blue, gray } from 'picocolors';

export function showSpinner(message: string) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write('\r' + blue(frames[i]) + ' ' + gray(message));
    i = (i + 1) % frames.length;
  }, 80);

  return {
    stop: () => {
      clearInterval(interval);
      process.stdout.write('\r' + ' '.repeat(message.length + 2) + '\r');
    },
  };
}
