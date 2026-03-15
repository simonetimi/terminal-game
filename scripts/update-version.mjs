import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pkg from '../package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const files = [
  '../src/environments/environment.ts',
  '../src/environments/environment.development.ts'
];

files.forEach((filePath) => {
  const fullPath = path.join(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf-8');

  content = content.replace(
    /appVersion:\s*["'].*?["']/,
    `appVersion: "${pkg.version}"`
  );

  fs.writeFileSync(fullPath, content);
  console.log(`Updated ${fullPath} with version ${pkg.version}`);
});
