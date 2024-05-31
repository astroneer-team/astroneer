import { showSpinnerWithPromise } from 'packages/common/dist';
import { downloadTemplates } from '../helpers';

export async function loadTemplates() {
  return await showSpinnerWithPromise(
    () => downloadTemplates(),
    'Downloading Astroneer.js templates...',
  );
}
