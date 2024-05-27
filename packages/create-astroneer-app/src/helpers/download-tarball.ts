import { Octokit } from '@octokit/rest';
import { Readable } from 'stream';

export async function downloadTarball(octokit: Octokit): Promise<Readable> {
  const tar = await octokit.repos.downloadTarballArchive({
    owner: 'astroneer-team',
    repo: 'astroneer-templates',
    ref: 'master',
  });

  const stream = new Readable();
  stream.push(Buffer.from(tar.data as ArrayBuffer));
  stream.push(null);

  return stream;
}
