import { getVideoDownLinkByurl, dealLink, ArticulationEnum, UserAgent, AudioFormatEnum } from './exports';
import type { Option, RequestHeaderType, DownFileMessage } from './types';

/**
 * 格式化参数
 * @param {Option | string} option - 下载选项对象或视频URL字符串
 * @param {AudioFormatEnum} [format] - 可选的音频格式
 * @returns {Option} - 下载选项对象
 */
function normalizeOptions(option: Option | string, format?: AudioFormatEnum): Option {
  const argsIsString = typeof option === 'string';
  const opt: Option = argsIsString ? { url: option } : { ...option };
  if (argsIsString && format) {
    opt.format = format;
  }
  return opt;
}

/** 构建请求头
 * @param {Option} opt - 下载选项对象
 * @returns {RequestHeaderType} - 请求头对象
 */
function buildRequestHeader(opt: Option): RequestHeaderType {
  return {
    Referer: opt.url,
    Cookie: opt.sessdata ? `SESSDATA=${opt.sessdata}` : '',
    'User-Agent': UserAgent,
  };
}

/** 校验参数
 * @param {Option} opt - 下载选项对象
 * @throws {Error} - 如果URL无效或不包含必需的参数
 */
function validateOptions(opt: Option): void {
  if (!opt.url) {
    throw new Error('URL is required');
  }
  if (!opt.url.includes('bilibili.com')) {
    throw new Error('Invalid Bilibili video URL');
  }
}

/** 确定视频质量等级
 * @param {Option} opt - 下载选项对象
 * @returns {ArticulationEnum} - 视频等级
 */
function determineQualityLevel(opt: Option): ArticulationEnum {
  if (opt.sessdata) {
    return opt.level ?? ArticulationEnum._1080PLUS;
  }
  return opt.level ?? ArticulationEnum._16;
}

function setDefaultName(opt: Option, title: string): void {
  opt.defaultName = title;
}

/**
 * 下载哔哩哔哩的视频
 * @param {Option} option - 完整的下载选项对象
 * @returns {Promise<DownFileMessage>} - 返回下载文件的信息
 */
async function downBili(option: Option): Promise<DownFileMessage>;
/**
 * 下载哔哩哔哩的视频
 * @param {string} url - 视频的URL
 * @param {AudioFormatEnum} [format] - 可选的音频格式
 * @returns {Promise<DownFileMessage | DownFileMessage[]>} - 返回下载文件的信息
 */
async function downBili(url: string, format?: AudioFormatEnum): Promise<DownFileMessage>;
async function downBili(option: Option | string, format?: AudioFormatEnum): Promise<DownFileMessage | DownFileMessage[]> {
  try {
    const opt: Option = normalizeOptions(option, format);
    validateOptions(opt);

    const requestHeader = buildRequestHeader(opt);
    const level = determineQualityLevel(opt);

    const downLinkInfo = await getVideoDownLinkByurl(opt.url, level);
    setDefaultName(opt, downLinkInfo.title);
    return await dealLink(opt, requestHeader, downLinkInfo.links);
  } catch (error) {
    throw new Error(`Download failed: ${(error as Error).message}`);
  }
}

export { downBili };
