import fs from 'fs';
import path from 'path';
import { PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import ProgressBar from './progress-bar';
import { createfolder } from '.';
import type { Option, ProgressOptions, httpGetResponseType, DownFileMessage } from '../types';
import { VideoTypeEnum } from '../constant';
import { printType, setFfmpegPath } from '.';
/**
 * 处理下载进度，支持将下载内容进行格式转换
 * @param res - HTTP响应对象或普通对象
 * @param opt - 下载选项，包含进度配置
 * @param transform - 是否需要进行格式转换
 * @returns 返回一个Promise，解析为包含文件路径等信息的对象，拒绝则返回错误
 */
function handleProgress(
  res: httpGetResponseType | Record<string, any>,
  opt: Option & { progress?: ProgressOptions },
  transform: boolean
): Promise<DownFileMessage> {
  return new Promise((resolve, reject) => {
    const defaultCb = () => console.log('\n 下载成功！ \n');
    const { progress, folder = 'media', name, onComplete = defaultCb } = opt;
    const labelName = progress?.labelname ?? '正在下载：';
    const progressLength = progress?.length ?? 50;

    const pb = new ProgressBar(labelName, progressLength);
    const headers = res.headers;
    const total = headers['content-length'];
    const outputDir = opt.output || folder;
    const dir = path.isAbsolute(outputDir) ? outputDir : path.join(process.cwd(), outputDir);
    createfolder(dir);

    let fPath = '';
    if (transform) {
      opt.name = opt.name?.split('.')[0];
      fPath = path.join(dir, `${opt.name}.${opt.format || 'mp3'}`);
    } else {
      fPath = path.join(dir, name || '');
    }

    if (!opt.type || name === VideoTypeEnum.default) {
      printType('视频', name, dir);
    }
    if (opt.type === VideoTypeEnum.silent) {
      printType('无声视频', name, dir);
    }
    if (opt.type === VideoTypeEnum.audio) {
      printType('音频', name, dir);
    }

    let completed = 0;
    let passThroughStream: PassThrough | null = null;
    setFfmpegPath();
    res.on('data', (chunk: Buffer) => {
      completed += chunk.length;
      pb.render({ completed, total });

      if (transform && !passThroughStream) {
        passThroughStream = new PassThrough();
        ffmpeg(passThroughStream)
          .noVideo()
          .format(opt.format || 'mp3')
          .on('end', () => {
            resolve({
              fPath,
              cwd: process.cwd(),
              name: opt.name as string,
              mediaPath: dir,
            });
          })
          .on('error', err => {
            reject(err);
          })
          .save(fPath);
      }

      if (transform) {
        passThroughStream?.write(chunk);
      }
    });

    res.on('end', () => {
      if (transform) {
        passThroughStream?.end();
      } else {
        onComplete();
        resolve({
          fPath,
          cwd: process.cwd(),
          name: opt.name as string,
          mediaPath: dir,
        });
      }
    });

    res.on('error', (err: Error) => {
      reject(err);
    });

    if (!transform) {
      res.pipe(fs.createWriteStream(fPath));
    }
  });
}

export function progressWithCookie(
  res: httpGetResponseType,
  opt: Option & { progress?: ProgressOptions },
  transform: boolean
): Promise<DownFileMessage> {
  return handleProgress(res, opt, transform);
}

export function progressWithoutCookie(res: Record<string, any>, opt: Option, transform: boolean): Promise<DownFileMessage> {
  return handleProgress(res, opt, transform);
}
