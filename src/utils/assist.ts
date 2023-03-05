import ProgressBar from './progress-bar';
import { createfolder } from '.';
import type { Option, ProgressOptions } from '../types/types';
import { VideoTypeEnum } from '../constant';
import { printType } from '.';

const fs = require('fs');
const path = require('path');

export function progressWithCookie(res: any, opt: Option & { progress?: ProgressOptions }): Promise<any> {
  return new Promise((resolve, _reject) => {
    const defaultCb = () => console.log('\n 下载成功！ \n');

    const { progress, folder = 'media', name, oncomplete = defaultCb } = opt;
    const labelname = progress?.labelname ?? '正在下载：';
    const progressLength = progress?.length ?? 50;

    const pb = new ProgressBar(labelname, progressLength);
    const headers = res.headers;
    const total = headers['content-length'];
    const dir = path.join(process.cwd(), folder);
    createfolder(folder);
    const fpath = path.join(dir, name);

    if (!opt.type || name === VideoTypeEnum.default) {
      printType('视频', name, folder);
    }
    if (opt.type === VideoTypeEnum.silent) {
      printType('无声视频', name, folder);
    }
    if (opt.type === VideoTypeEnum.audio) {
      printType('音频', name, folder);
    }

    res.pipe(fs.createWriteStream(fpath));
    let completed = 0;
    res.on('data', (chunk: any) => {
      completed += chunk.length;
      pb.render({ completed, total });
    });
    res.on('end', () => {
      oncomplete();
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
    createfolder(folder);
    const fpath = path.join(process.cwd(), folder, opt.name);

    if (!opt.type || opt.name === 'default') {
      printType('视频', opt.name, opt.folder);
    }
    if (opt.type === VideoTypeEnum.silent) {
      printType('无声视频, opt.name, opt.folder');
    }
    if (opt.type === VideoTypeEnum.audio) {
      printType('音频', opt.name, opt.folder);
    }

    res.pipe(fs.createWriteStream(fpath));
    let completed = 0;
    res.on('data', (chunk: any) => {
      completed += chunk.length;
      pb.render({ completed, total });
    });
    const defaultCb = () => console.log('\nDownload complete!\n');
    const cb = opt.oncomplete || defaultCb;
    const d = { opt: 'opt' };
    res.on('end', () => {
      cb();
      resolve(d);
    });
    res.on('error', (err: any) => {
      throw err;
    });
  });
}
