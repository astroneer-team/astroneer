import picocolors from 'picocolors';

/**
 * Displays a spinner animation with a given message.
 * @param message - The message to display alongside the spinner animation.
 * @returns An object with a `stop` function that can be called to stop the spinner animation.
 */
export function showSpinner(message: string) {
  const spinner = {
    interval: 100,
    frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  };

  let i = 0;

  const interval = setInterval(() => {
    const { frames } = spinner;
    process.stdout.write(`\r${frames[i]} ${picocolors.blue(message)}`);
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
