import ProgressBar from './progress-bar';
import { createfolder } from '.';
import type { Option, ProgressOptions } from '../types/types';

const fs = require('fs');
const path = require('path');

export function progressWithCookie(res: any, opt: Option & { progress?: ProgressOptions }): Promise<any> {
  return new Promise((resolve, _reject) => {
    const labelname = opt.progress?.labelname ?? 'Download progress';
    const progressLength = opt.progress?.length ?? 50;

    const pb = new ProgressBar(labelname, progressLength);
    const headers = res.headers;
    const total = headers['content-length'];
    const folder = opt.folder ?? 'media';
    const dir = path.join(process.cwd(), folder);
    createfolder(folder);
    const fpath = path.join(dir, opt.name);

    const printType = (type: string) => console.log(`The ${type} named \033[33m${opt.name}\033[39m is stored in \033[33m${dir}\033[39m`);

    if (!opt.type || opt.name === 'default') {
      printType('video');
    }
    if (opt.type === 'silent') {
      printType('silent video');
    }
    if (opt.type === 'audio') {
      printType('audio');
    }

    res.pipe(fs.createWriteStream(fpath));
    let completed = 0;
    res.on('data', (chunk: any) => {
      completed += chunk.length;
      pb.render({ completed, total });
    });
    const defaultCb = () => console.log('\nDownload complete!\n');
    const cb = opt.oncomplete || defaultCb;
    res.on('end', () => {
      cb();
      resolve(res);
    });
    res.on('error', (err: any) => {
      throw err;
    });
  });
}

export function progressWithoutCookie(res: any, opt: Option): Promise<any> {
  return new Promise((resolve, _reject) => {
    const pb = new ProgressBar('Download progress', 50);
    const headers = res.headers;
    const total = headers['content-length'];
    const folder = opt.folder ?? 'media';
    const dir = path.join(process.cwd(), folder);
    createfolder(folder);
    const fpath = path.join(process.cwd(), folder, opt.name);

    const printType = (type: string) => console.log(`The ${type} named \033[33m${opt.name}\033[39m is stored in \033[33m${dir}\033[39m`);

    if (!opt.type || opt.name === 'default') {
      printType('video');
    }
    if (opt.type === 'silent') {
      printType('silent video');
    }
    if (opt.type === 'audio') {
      printType('audio');
    }

    res.pipe(fs.createWriteStream(fpath));
    let completed = 0;
    res.on('data', (chunk: any) => {
      completed += chunk.length;
      pb.render({ completed, total });
    });
    const defaultCb = () => console.log('\nDownload complete!\n');
    const cb = opt.oncomplete || defaultCb;
    res.on('end', () => {
      cb();
      resolve(res);
    });
    res.on('error', (err: any) => {
      throw err;
    });
  });
}
