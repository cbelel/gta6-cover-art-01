import { cpSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const expected = [
  'app/index.html',
  'app/fonts/Anton-Regular.ttf',
  'screenshots/1-cover.jpg',
  'screenshots/2-editor.jpg',
  'screenshots/3-cover.jpg',
  'screenshots/4-cover.jpg',
];
for (const file of expected) {
  if (!existsSync(join(root, file)) || !statSync(join(root, file)).isFile()) {
    throw new Error(`Missing required deliverable: ${file}`);
  }
  if (file.startsWith('screenshots/') && statSync(join(root, file)).size > 262144) {
    throw new Error(`Screenshot exceeds the 256 KiB limit: ${file}`);
  }
}
mkdirSync(output, { recursive: true });
cpSync(join(root, 'app'), join(output, 'app'), { recursive: true });
cpSync(join(root, 'screenshots'), join(output, 'screenshots'), { recursive: true });
const dossier = buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(output, 'dossier.json'), dossier);
console.log('Vice City Cover Maker packaged successfully.');
