import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import { builtinModules } from 'node:module';

const commonConfig = {
  input: 'src/index.ts', // 修改为你的源码入口路径
  external: [
    'axios',
    'cheerio',
    'fluent-ffmpeg',
    'single-line-log',
    '@ffmpeg-installer/ffmpeg',
    'commander',
    ...builtinModules,
  ],
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: false,
        },
      },
    }),
    terser({
      format: {
        comments: false
      }
    })
  ],
};

export default [
  {
    ...commonConfig,
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      exports: 'auto',
    },
  },
  {
    ...commonConfig,
    output: {
      dir: 'dist/esm',
      format: 'esm',
      preserveModules: true,
    },
  },
  {
    input: 'src/cli.ts',
    output: {
      file: 'dist/cli.js',
      format: 'cjs',
      banner: '#!/usr/bin/env node',
    },
    plugins: [...commonConfig.plugins],
    external: commonConfig.external,
  },
];
