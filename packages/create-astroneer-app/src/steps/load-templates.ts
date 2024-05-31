import { showSpinnerWithPromise } from '@astroneer/common';
import { downloadTemplates } from '../helpers';

export async function loadTemplates() {
  return await showSpinnerWithPromise(
    () => downloadTemplates(),
    'Downloading Astroneer.js templates...',
  );
}
