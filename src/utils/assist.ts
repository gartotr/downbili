import fs from 'fs';
import path from 'path';
import { PassThrough, Readable } from 'stream';
import type { AxiosResponse } from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import { createfolder, printType, setFfmpegPath, ProgressBar } from '.';
import type { Option, ProgressOptions, DownFileMessage } from '../types';
import { VideoTypeEnum } from '../constant';

/**
 * 处理文件下载和进度显示，支持格式转换
 * @param {AxiosResponse<Readable>} res - axios响应流对象
 * @param opt - 下载选项，包含进度配置
 * @param transform - 是否需要进行格式转换
 * @returns {Promise<DownFileMessage>} 返回文件路径信息
 */
export function downloadFile(
  res: AxiosResponse<Readable>,
  opt: Option & { progress?: ProgressOptions },
  transform: boolean
): Promise<DownFileMessage> {
  return new Promise((resolve, reject) => {
    const defaultCb = () => console.log('\nDownload successfully!\n');
    const { progress, folder = 'media', name, onComplete = defaultCb } = opt;
    const labelName = progress?.labelname ?? 'Downloading：';
    const progressLength = progress?.length ?? 50;
    const stream: Readable = res.data;
    const pb = new ProgressBar(labelName, progressLength);
    const total = res.headers['content-length'];
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
      printType('Video', name, dir);
    }
    if (opt.type === VideoTypeEnum.silent) {
      printType('Silent Video', name, dir);
    }
    if (opt.type === VideoTypeEnum.audio) {
      printType('Audio', name, dir);
    }

    let completed = 0;
    let passThroughStream: PassThrough | null = null;
    setFfmpegPath();

    stream.on('data', (chunk: Buffer) => {
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

    stream.on('end', () => {
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

    stream.on('error', (err: Error) => {
      reject(err);
    });

    if (!transform) {
      stream.pipe(fs.createWriteStream(fPath));
    }
  });
}
