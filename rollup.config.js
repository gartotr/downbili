import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

const commonConfig = {
  input: 'src/index.ts', // 修改为你的源码入口路径
  external: ['axios', 'fluent-ffmpeg', 'single-line-log', 'path', 'fs', 'child_process'],
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          declarationDir: 'dist/types',
        },
      },
    }),
    json(),
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
    input: 'dist/types/index.d.ts',
    output: [
      {
        file: 'dist/types/index.d.ts',
        format: 'es',
      },
    ],
    plugins: [dts()],
  },
];
