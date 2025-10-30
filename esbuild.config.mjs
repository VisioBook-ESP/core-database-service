import * as esbuild from 'esbuild';

// Build configuration for NestJS with ES modules
await esbuild.build({
  entryPoints: ['./src/main.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outdir: './dist',
  sourcemap: true,
  minify: false,
  keepNames: true,
  metafile: true,

  // External packages - don't bundle these (they should be in node_modules)
  external: [
    '@nestjs/*',
    '@prisma/client',
    '.prisma/client',
    'class-transformer',
    'class-validator',
    'ioredis',
    'redis',
    'pg',
    'reflect-metadata',
    'rxjs',
  ],

  // Preserve decorators and metadata
  tsconfigRaw: {
    compilerOptions: {
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
    },
  },

  // Add banner to enable ES module features
  banner: {
    js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`.trim(),
  },
}).then(() => {
  console.log('✅ Build completed successfully!');
}).catch(() => {
  process.exit(1);
});
