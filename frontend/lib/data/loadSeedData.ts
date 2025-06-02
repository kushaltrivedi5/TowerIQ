import fs from 'fs';
import path from 'path';

export function loadSeedData<T = any>(filename: string): T[] {
  const filePath = path.join(process.cwd(), 'lib/data/seed-data', filename);
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
} 