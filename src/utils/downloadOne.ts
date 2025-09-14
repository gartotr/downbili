import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Readable } from 'stream';
import { getWebObject, getVideoMessageByav, downloadFile } from '.';
import { ArticulationEnum, PLAYURL_API, AudioFormatEnum } from '../constant';
import type { IWebInfo, Option, DownFileMessage, RequestHeaderType, DownLinkResult } from '../types';

/**
 * 再次对视频的信息进行一次封装
 * @param {string} av 视频的av号
 * @returns {IWebInfo}
 */
export const getVideoIntroByav = async (av: string): Promise<IWebInfo> => {
  const { data } = await getVideoMessageByav(av);
  return {
    aid: data.aid,
    tid: data.tid,
    tname: data.tname,
    pic: data.pic,
    title: data.title,
    desc: data.desc,
    url: data.redirect_url,
    name: data.owner.name,
    mid: data.owner.mid,
    face: data.owner.face,
    cid: data.cid,
    like: data.stat.like,
    dislike: data.stat.dislike,
    pages: data.pages,
    redirect_url: data.redirect_url,
  };
};

/**
 * 获取链接地址
 * @param {string} av 视频的av号
 * @param {number} cid cid
 * @param {ArticulationEnum} level
 * @returns {string} 链接地址
 */
export const initialUrl = (av: string, cid: number, level: ArticulationEnum): string => {
  return `${PLAYURL_API}?avid=${av}&cid=${cid}&qn=${level}&otype=json`;
};

/**
 * 根据 视频的av号 获取 视频的下载链接信息
 * @param {string} av 视频的av号
 * @param {number} level 视频的清晰度
 * @returns {Promise<string | string[]>} B站视频下载地址
 */
export const getVideoDownloadLinkByav = async (av: string, level: ArticulationEnum = ArticulationEnum._16): Promise<string | string[]> => {
  const info = await getVideoIntroByav(av);
  const pages = info.pages;
  if (pages.length > 1) {
    const links: string[] = [];
    for (let i = 0, len = pages.length; i < len; i++) {
      const cid = pages[i].cid;
      const link = initialUrl(av, cid, level);
      links.push(link);
    }
    return links;
  } else {
    const cid = info.cid;
    return initialUrl(av, cid, level);
  }
};

/**
 * 根据 视频播放地址 获取 视频的下载链接信息
 * @param {string} url 视频的播放地址
 * @param {ArticulationEnum} level
 * @returns {DownLinkResult} 包含链接、标题信息
 */
export const getVideoDownLinkByurl = async (url: string, level: ArticulationEnum): Promise<DownLinkResult> => {
  const webObject = await getWebObject(url);
  const downloadLinkByav = await getVideoDownloadLinkByav(webObject.aid.toString(), level);
  return {
    title: webObject.title,
    links: downloadLinkByav,
  }
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
