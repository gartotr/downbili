import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { Readable } from 'stream';
import { getWebObject, getVideoMessageByAid, downloadFile, isBangumi, extractArcFields } from '.';
import { ArticulationEnum, PLAYURL_API, AudioFormatEnum } from '../constant';
import type { Option, DownFileMessage, RequestHeaderType, DownLinkResult, ArcObject } from '../types';

/**
 * 获取链接地址
 * @param {string} aid 视频的aid号
 * @param {number} cid cid
 * @param {ArticulationEnum} level
 * @returns {string} 链接地址
 */
export const initialUrl = (aid: string | number, cid: number, level: ArticulationEnum): string => {
  return `${PLAYURL_API}?avid=${aid}&cid=${cid}&qn=${level}&otype=json`;
};

/**
 * 根据 视频的aid号 获取 视频的下载链接信息
 * @param {string} aid 视频的aid号
 * @param {number} level 视频的清晰度
 * @returns {Promise<string | string[]>} B站视频下载地址
 */
export const getVideoDownloadLinkByAid = async (aid: string, level:ArticulationEnum): Promise<string | string[]> => {
  const webTextObject = await getVideoMessageByAid(aid);
  const pages = webTextObject.data.pages;
  if (pages.length > 1) {
    const links: string[] = [];
    for (let i = 0, len = pages.length; i < len; i++) {
      const cid = pages[i].cid;
      const link = initialUrl(aid, cid, level);
      links.push(link);
    }
    return links;
  } else {
    const cid = webTextObject.data.cid;
    return initialUrl(aid, cid, level);
  }
};

/**
 * 解析script内容获取arc字段
 * @param {url} url 视频的播放地址
 * @returns
 */
export async function parseScript(url: string): Promise<ArcObject> {
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);

  let scriptContent = '';

  // 查找包含 playurlSSRData 的 script 标签
  $('script').each((_, el) => {
    const text = $(el).text();
    if (text.includes('playurlSSRData')) {
      scriptContent = text;
      return;
    }
  });
  const scriptMatch = extractArcFields(scriptContent);
  if (!scriptMatch) {
    throw new Error('Failed to extract arc.');
  }
  return JSON.parse(scriptMatch);
}

/**
 * 获取番剧下载地址
 * @param {string} url 视频的播放地址
 * @param {ArticulationEnum} level
 * @returns {DownLinkResult} 包含链接、标题信息
 */
export const getBangumiLink = async (url: string, level: ArticulationEnum): Promise<DownLinkResult> => {
  const { aid, cid } = await parseScript(url);
  const videoMessage = await getVideoMessageByAid(aid);
  const ul = initialUrl(aid, cid, level);
  return {
    title: videoMessage.data.title,
    links: ul,
  };
};

/**
 * 根据 视频播放地址 获取 视频的下载链接信息
 * @param {string} url 视频的播放地址
 * @param {ArticulationEnum} level
 * @returns {DownLinkResult} 包含链接、标题信息
 */
export const getVideoDownLinkByurl = async (url: string, level: ArticulationEnum): Promise<DownLinkResult> => {
  // 番剧
  if (isBangumi(url)) {
    return await getBangumiLink(url, level);
  }

  const webObject = await getWebObject(url);
  const downloadLink = await getVideoDownloadLinkByAid(webObject.aid.toString(), level);
  return {
    title: webObject.title,
    links: downloadLink,
  };
};

/**
 * 下载单个视频链接
 * @param {Option} options 下载选项
 * @param {string} url 视频链接
 * @param {RequestHeaderType} headers 请求头
 * @returns {Promise<DownFileMessage>} 返回文件路径信息
 */
export async function downloadOne(options: Option, url: string, headers: RequestHeaderType): Promise<DownFileMessage> {
  const transform = Object.values(AudioFormatEnum).includes(options.format as AudioFormatEnum);

  const config: AxiosRequestConfig<Readable> = {
    headers,
    maxRedirects: 5,
    validateStatus: (status: number) => status >= 200 && status < 300,
    responseType: 'stream',
  };

  const response: AxiosResponse<Readable> = await axios.get<Readable>(url, config);
  return downloadFile(response, options, transform);
}
