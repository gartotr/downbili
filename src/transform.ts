import ffmpeg from "fluent-ffmpeg";
import path from "path";
import * as fs from "fs";

import { downBili } from './download';
import type { FormatDefaultType, OmitUrlOption } from './types';
import { DEFAULT_CONVERTER } from './constant';


/**
 * 默认配置项
 */
const convertSingOption: Omit<FormatDefaultType, 'url'> = {
  format: DEFAULT_CONVERTER,
  deleteSourceMedia: true,
};

/**
 * 转换输出路径
 * @param {FormatDefaultType} option FormatDefaultType
 * @param {string} mediaPath 视频资源路径
 * @param {string} originalName 原始文件名称
 * @param {string} format 指定格式
 * @returns
 */
function determineOutputPath(option: FormatDefaultType, mediaPath: string, originalName: string, format?: string): string {
  const fileName = option.fileName ?? path.basename(originalName, path.extname(originalName));
  const filePath = option.filePath ? path.join(option.filePath, `${ fileName }.${ format }`) : path.join(mediaPath, `${ fileName }.${ format }`);
  return filePath;
}

/**
 * 删除下载的视频文件
 * @param {string} resourcePath 资源路径
 */
function deleteSourceFile(resourcePath: string) {
  try {
    fs.unlinkSync(resourcePath);
  } catch (error) {
    console.error(error);
  }
}

/**
 * 下载并转换单个视频为音频
 * @deprecated 请使用 options 参数传入format
 * @param {FormatDefaultType} video 视频对象
 * @param {Option} downloadOption 下载视频配置
 */
export const downloadSingleToAudio = async (video: FormatDefaultType, downloadOption?: OmitUrlOption): Promise<void> => {
  const option = {...convertSingOption, ...video};
  const preload = {...downloadOption, url: option.url};
  const download = await downBili(preload);
  const {mediaPath, fPath, name} = download;
  const formatter = option.format || DEFAULT_CONVERTER;
  const outputPath = determineOutputPath(option, mediaPath, name, formatter);

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(fPath)
        .noVideo()
        .format(formatter)
        .on('start', () => {
          if (option.filePath && !fs.existsSync(option.filePath)) {
            fs.mkdir(option.filePath, {}, (err: NodeJS.ErrnoException | null) => {
              if (err) {
                throw err;
              }
            });
          }
        })
        .on('error', (err: any) => {
          console.error(err);
          option.errorCallback?.();
          reject(err);
        })
        .on('end', () => {
          if (option.deleteSourceMedia) {
            deleteSourceFile(fPath);
          }
          option.successCallback?.();
          resolve();
        })
        .save(outputPath);
    });
  } catch (err) {
    console.error(`Error converting video at ${ option.url }:`, err);
  }
};

/**
 * 转换多个视频（顺序执行）
 * @param {FormatDefaultType[]} batchVideo 多个视频对象组成的数组
 * @param {OmitUrlOption} downloadOption 下载配置，不需要视频URL
 */
export const videoToAudioConverter = async (batchVideo: FormatDefaultType[], downloadOption?: OmitUrlOption): Promise<void> => {
  for (const video of batchVideo) {
    await downloadSingleToAudio(video, downloadOption);
  }
};

/**
 * 转换多个视频（并发执行）
 * @param {FormatDefaultType[]} batchVideo 多个视频对象组成的数组
 * @param {OmitUrlOption} downloadOption 下载配置，不需要视频URL
 */
export const videoToAudioConverterParallel = async (batchVideo: FormatDefaultType[], downloadOption?: OmitUrlOption): Promise<void> => {
  await Promise.all(batchVideo.map(video => downloadSingleToAudio(video, downloadOption)));
};
