import ProgressBar from './progress-bar';
import { createfolder } from '.';
import type { Option, ProgressOptions } from '../types/types';
import type { httpGetResponseType, DownFileMessage } from '../types/responseType';
import { VideoTypeEnum } from '../constant';
import { printType } from '.';

const fs = require('fs');
const path = require('path');

export function progressWithCookie(res: httpGetResponseType, opt: Option & { progress?: ProgressOptions }): Promise<DownFileMessage> {
  return new Promise((resolve, _reject) => {
    const defaultCb = () => console.log('\n 下载成功！ \n');

    const { progress, folder = 'media', name, onComplete = defaultCb } = opt;
    const labelName = progress?.labelname ?? '正在下载：';
    const progressLength = progress?.length ?? 50;

    const pb = new ProgressBar(labelName, progressLength);
    const headers = res.headers;
    const total = headers['content-length'];
    const dir = path.join(process.cwd(), folder);
    createfolder(folder);
    const fPath = path.join(dir, name);

    if (!opt.type || name === VideoTypeEnum.default) {
      printType('视频', name, folder);
    }
    if (opt.type === VideoTypeEnum.silent) {
      printType('无声视频', name, folder);
    }
    if (opt.type === VideoTypeEnum.audio) {
      printType('音频', name, folder);
    }

    res.pipe(fs.createWriteStream(fPath));
    let completed = 0;
    res.on('data', (chunk: Record<string, string>[]) => {
      completed += chunk.length;
      pb.render({ completed, total });
    });
    const response: DownFileMessage = {
      fPath,
      cwd: process.cwd(),
      name: opt.name as string,
      mediaPath: path.join(process.cwd(), folder),
    };
    res.on('end', () => {
      onComplete();
      resolve(response);
    });
    res.on('error', (err: Record<string, string>) => {
      throw err;
    });
  });
}

export function progressWithoutCookie(res: Record<string, any>, opt: Option): Promise<DownFileMessage> {
  return new Promise((resolve, _reject) => {
    const pb = new ProgressBar('Download progress', 50);
    const headers = res.headers;
    const total = headers['content-length'];
    const folder = opt.folder ?? 'media';
    createfolder(folder);
    const fPath = path.join(process.cwd(), folder, opt.name);
    console.log('11', path.join(process.cwd(), folder));

    if (!opt.type || opt.name === 'default') {
      printType('视频', opt.name, opt.folder);
    }
    if (opt.type === VideoTypeEnum.silent) {
      printType('无声视频, opt.name, opt.folder');
    }
    if (opt.type === VideoTypeEnum.audio) {
      printType('音频', opt.name, opt.folder);
    }

    res.pipe(fs.createWriteStream(fPath));
    let completed = 0;
    res.on('data', (chunk: Record<string, string>[]) => {
      completed += chunk.length;
      pb.render({ completed, total });
    });
    const response: DownFileMessage = {
      fPath,
      cwd: process.cwd(),
      name: opt.name as string,
      mediaPath: path.join(process.cwd(), folder),
    };
    const defaultCb = () => console.log('\nDownload complete!\n');
    const cb = opt.onComplete || defaultCb;
    res.on('end', () => {
      cb();
      resolve(response);
    });
    res.on('error', (err: Record<string, string>) => {
      throw err;
    });
  });
}
