import fs from 'fs';
import path from 'path';
import { PassThrough, Readable } from 'stream';
import type { AxiosResponse } from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import { createfolder, printType, setFfmpegPath, ProgressBar, getUniqueFilePath } from '.';
import type { Option, DownFileMessage } from '../types';
import { VideoTypeEnum } from '../constant';

interface DownloadConfig {
  stream: Readable;
  progressBar: ProgressBar;
  outputPath: string;
  outputDir: string;
  total: number | null;
}

/**
 * 默认完成执行函数
 */
const defaultComplete = () => console.log('\nDownload successfully!\n');

/**
 * 验证下载参数
 * @param {AxiosResponse<Readable>} res - axios响应对象
 * @param {Option} option - 下载选项配置
 */
function validateDownloadParams(res: AxiosResponse<Readable>, option: Option): void {
  if (!res || !res.data) {
    throw new Error('Invalid response: missing data stream');
  }

  if (!option) {
    throw new Error('Invalid option: option parameter is required');
  }
}

/**
 * 生成输出文件路径
 * @param {Option} option - 下载选项配置
 * @param {string} dir - 输出目录
 * @param {boolean} transform - 是否进行格式转换
 * @returns {string} 完整的输出文件路径
 */
function generateOutputPath(option: Option, dir: string, transform: boolean): string {
  if (transform) {
    const baseName = option.name?.split('.')[0];
    const format = option.format || 'mp3';
    const filename = `${baseName}.${format}`;
    const unique = getUniqueFilePath(dir, filename);
    // 更新 option.name 为最终文件名（含后缀）
    option.name = path.basename(unique);
    return unique;
  }
  const filename = option.name || '';
  const unique = getUniqueFilePath(dir, filename);
  option.name = path.basename(unique);
  return unique;
}

/**
 * 初始化下载配置
 * @param {Option} option - 下载选项配置
 * @param {AxiosResponse<Readable>} res - axios响应对象
 * @param {boolean} transform - 是否进行格式转换
 * @returns {Object} 初始化后的配置对象
 */
function initializeDownloadConfig(option: Option, res: AxiosResponse<Readable>, transform: boolean): DownloadConfig {
  const { folder = 'media' } = option;
  const labelName = 'Downloading：';
  const progressLength = 50;
  const stream: Readable = res.data;
  const progressBar = new ProgressBar(labelName, progressLength);
  const contentLength = res.headers['content-length'];
  const total = contentLength && isFinite(Number(contentLength)) ? Number(contentLength) : null;
  const outputDir = option.output || folder;
  const dir = path.isAbsolute(outputDir) ? outputDir : path.join(process.cwd(), outputDir);

  createfolder(dir);

  const outputPath = generateOutputPath(option, dir, transform);

  return {
    stream,
    progressBar,
    outputPath,
    outputDir: dir,
    total,
  };
}

/**
 * 打印下载类型
 * @param {Option} option - 下载选项配置
 * @param {string} outputDir - 输出目录
 */
function printDownloadType(option: Option, outputDir: string): void {
  const { type, name } = option;
  if (!type || name === VideoTypeEnum.default) {
    printType('Video', name, outputDir);
  } else if (type === VideoTypeEnum.silent) {
    printType('Silent Video', name, outputDir);
  } else if (type === VideoTypeEnum.audio) {
    printType('Audio', name, outputDir);
  }
}

/**
 * 处理格式转换下载
 * @param {Readable} stream - 数据流
 * @param {ProgressBar} progressBar - 进度条实例
 * @param {string} outputPath - 输出文件路径
 * @param {Option} option - 下载选项配置
 * @param {number|null} total - 文件总大小（可能为null）
 * @param {Function} resolve - Promise resolve回调
 * @param {Function} reject - Promise reject回调
 */
function handleTransformDownload(
  stream: Readable,
  progressBar: ProgressBar,
  outputPath: string,
  option: Option,
  total: number | null,
  resolve: (value: DownFileMessage) => void,
  reject: (reason?: any) => void
): void {
  let completed = 0;
  let passThroughStream: PassThrough | null = null;
  let ffmpegProcess: any = null;
  const outputDir = path.dirname(outputPath);

  const cleanup = () => {
    if (passThroughStream && !passThroughStream.destroyed) {
      passThroughStream.destroy();
    }
    if (ffmpegProcess) {
      ffmpegProcess.kill();
    }
  };

  stream.on('data', (chunk: Buffer) => {
    try {
      completed += chunk.length;
      if (total) {
        progressBar.render({ completed, total });
      } else {
        // 当没有确切总大小时，显示已下载的字节数
        console.log(`\r${progressBar.description} ${(completed / 1024 / 1024).toFixed(2)} MB downloaded...`);
      }

      if (!passThroughStream) {
        passThroughStream = new PassThrough();
        ffmpegProcess = setupFfmpegTransform(passThroughStream, outputPath, option, outputDir, resolve, reject);
      }

      if (passThroughStream && !passThroughStream.destroyed) {
        passThroughStream.write(chunk);
      }
    } catch (error) {
      cleanup();
      reject(error);
    }
  });

  stream.on('end', () => {
    try {
      if (passThroughStream && !passThroughStream.destroyed) {
        passThroughStream.end();
      }
    } catch (error) {
      cleanup();
      reject(error);
    }
  });

  stream.on('error', (err: Error) => {
    cleanup();
    reject(err);
  });
}

/**
 * 处理直接下载
 * @param {Readable} stream - 数据流
 * @param {ProgressBar} progressBar - 进度条实例
 * @param {string} outputPath - 输出文件路径
 * @param {Option} option - 下载选项配置
 * @param {number|null} total - 文件总大小（可能为null）
 * @param {Function} resolve - Promise resolve回调
 * @param {Function} reject - Promise reject回调
 */
function handleDirectDownload(
  stream: Readable,
  progressBar: ProgressBar,
  outputPath: string,
  option: Option,
  total: number | null,
  resolve: (value: DownFileMessage) => void,
  reject: (reason?: any) => void
): void {
  let completed = 0;
  const outputDir = path.dirname(outputPath);
  const onComplete = option.onComplete || defaultComplete;
  let writeStream: fs.WriteStream | null = null;

  try {
    writeStream = fs.createWriteStream(outputPath);
  } catch (error) {
    reject(new Error(`Failed to create write stream: ${error}`));
    return;
  }

  const cleanup = () => {
    if (writeStream && !writeStream.destroyed) {
      writeStream.destroy();
    }
  };

  stream.on('data', (chunk: Buffer) => {
    try {
      completed += chunk.length;
      // 如果有确切的总大小，使用真实值；否则显示下载状态
      if (total) {
        progressBar.render({ completed, total });
      } else {
        // 当没有确切总大小时，显示已下载的字节数
        console.log(`\r${progressBar.description} ${(completed / 1024 / 1024).toFixed(2)} MB downloaded...`);
      }
    } catch (error) {
      cleanup();
      reject(error);
    }
  });

  stream.on('end', () => {
    try {
      onComplete();
      resolve({
        fPath: outputPath,
        cwd: process.cwd(),
        name: option.name as string,
        mediaPath: outputDir,
      });
    } catch (error) {
      cleanup();
      reject(error);
    }
  });

  stream.on('error', (err: Error) => {
    cleanup();
    option.onError?.();
    reject(err);
  });

  writeStream.on('error', (err: Error) => {
    cleanup();
    reject(new Error(`Write stream error: ${err.message}`));
  });

  stream.pipe(writeStream);
}

/**
 * 设置FFmpeg转换
 * @param {PassThrough} passThroughStream - 传递流
 * @param {string} outputPath - 输出文件路径
 * @param {Option} option - 下载选项配置
 * @param {string} outputDir - 输出目录
 * @param {Function} resolve - Promise resolve
 * @param {Function} reject - Promise reject
 * @returns {any} FFmpeg进程实例
 */
function setupFfmpegTransform(
  passThroughStream: PassThrough,
  outputPath: string,
  option: Option,
  outputDir: string,
  resolve: (value: DownFileMessage) => void,
  reject: (reason?: any) => void
): any {
  const onComplete = option.onComplete || defaultComplete;

  return ffmpeg(passThroughStream)
    .noVideo()
    .format(option.format || 'mp3')
    .on('end', () => {
      onComplete();
      resolve({
        fPath: outputPath,
        cwd: process.cwd(),
        name: option.name as string,
        mediaPath: outputDir,
      });
    })
    .on('error', (err: Error) => {
      option.onError?.();
      reject(err);
    })
    .save(outputPath);
}

/**
 * 处理文件下载和进度显示，支持格式转换
 * @param {AxiosResponse<Readable>} res - axios响应流对象
 * @param option - 下载选项，包含进度配置
 * @param transform - 是否需要进行格式转换
 * @returns {Promise<DownFileMessage>} 返回文件路径信息
 */
export function downloadFile(res: AxiosResponse<Readable>, option: Option, transform: boolean): Promise<DownFileMessage> {
  return new Promise((resolve, reject) => {
    try {
      // 参数验证
      validateDownloadParams(res, option);

      const config = initializeDownloadConfig(option, res, transform);
      const { stream, progressBar, outputPath, outputDir, total } = config;

      printDownloadType(option, outputDir);

      if (transform) {
        setFfmpegPath();
        handleTransformDownload(stream, progressBar, outputPath, option, total, resolve, reject);
      } else {
        handleDirectDownload(stream, progressBar, outputPath, option, total, resolve, reject);
      }
    } catch (error) {
      reject(error);
    }
  });
}
