import { cpSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
const required = ['app/index.html', ...['1-cover','2-editor','3-cover','4-cover'].map(name => 'screenshots/' + name + '.jpg')];
const missing = required.filter(path => !statSync(resolve(root,path), { throwIfNoEntry: false })?.isFile());
if (missing.length) throw new Error('Missing required files: ' + missing.join(', '));

mkdirSync(output, { recursive: true });
for (const directory of ['app','screenshots']) {
  cpSync(resolve(root,directory), resolve(output,directory), { recursive: true });
}

const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000
});
writeFileSync(resolve(output,'dossier.json'),dossier);
