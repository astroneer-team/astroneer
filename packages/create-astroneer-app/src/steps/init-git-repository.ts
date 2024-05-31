import simpleGit from 'simple-git';

export async function initGitRepository(dir: string) {
  const git = simpleGit(dir);
  await git.init();
  await git.add('.');
  await git.commit('Initial commit');
}
