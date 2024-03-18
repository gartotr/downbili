import { downBili } from './download';
import { FormatDefaultType } from './types/types';
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const defaultOption: FormatDefaultType = {
  format: 'wav',
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
  const filePath = option.filePath ? path.join(option.filePath, `${fileName}.${format}`) : path.join(mediaPath, `${fileName}.${format}`);
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
 * 下载视频以转音频
 * @param {FormatDefaultType} option FormatDefaultType
 * @param {string} url 视频的url
 */
export const formatDownFile = async (url: string, option: FormatDefaultType = defaultOption): Promise<void> => {
  const download = await downBili({ url });
  const { mediaPath, fPath, name } = download;
  const formatter = option.format || defaultOption.format;
  const outputPath = determineOutputPath(option, mediaPath, name, formatter);

  ffmpeg(fPath)
    .noVideo()
    .format(formatter)
    .on('error', (err: any) => {
      console.error(err);
      option.errorCallback?.();
    })
    .on('end', () => {
      if (option.deleteSourceMedia) {
        deleteSourceFile(fPath);
      }
      option.successCallback?.();
    })
    .save(outputPath);
};
