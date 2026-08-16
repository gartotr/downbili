import axios from 'axios';
import { getavByavurl, isAvurl, isbvidurl, isBangumi, withSelectedAddress } from './url';
import { getVideoMessageByAid, getViewByBvidUrl, initialUrl } from './api';
import { getBangumiLink } from './bangumi';
import { ArticulationEnum, VideoTypeEnum } from '../constant';
import type { Option, OrString, RequestHeaderType, DownloadObject, DownLoadRequestResult, Durl, WebObject, DownLinkResult } from '../types';

/**
 * 根据 视频的aid号 获取 视频的下载链接信息
 * @param {string} aid 视频的aid号
 * @param {number} level 视频的清晰度
 * @returns {Promise<string | string[]>} B站视频下载地址
 */
export const getVideoDownloadLinkByAid = async (aid: string, level: ArticulationEnum): Promise<string | string[]> => {
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
 * 根据视频播放地址获取 视频的aid&title
 * @param {string} url 视频的播放地址
 * @returns {Promise<string>}
 */
export async function getWebObject(url: string): Promise<WebObject> {
  if (isAvurl(url)) {
    return {
      aid: Number(getavByavurl(url)),
      title: '',
    };
  }

  // 判断是不是视频地址
  if (isbvidurl(url)) {
    const { aid, title } = await getViewByBvidUrl(url);
    return {
      aid,
      title: title ?? '',
    };
  }
  throw new Error('Failed to get video information!');
}

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
 * 获取下载链接对应的可下载分片列表（durl）
 * @param {Option} option 视频下载配置
 * @param {RequestHeaderType} headers http请求头
 * @param {OrString} address B站视频下载地址
 * @returns {Promise<Durl[]>} 可下载的分片列表
 */
export async function fetchDurl(option: Option, headers: RequestHeaderType, address: OrString): Promise<Durl[]> {
  const finalAddr = withSelectedAddress(option.url, address);

  const res: DownloadObject = await axios.get(finalAddr, { headers });
  // 检查响应状态
  if (res.code === -404 && res.message !== 'success') {
    const hasNonDefaultType = option.type && option.type !== VideoTypeEnum.default;
    throw new Error(hasNonDefaultType ? 'Please correspond to the URL video type!!' : 'Please pass in sessdata!!');
  }

  const data: DownLoadRequestResult = res.data;
  const durl: Durl[] = !option.type || option.type === VideoTypeEnum.default ? data.data.durl : [];

  if (durl.length === 0) {
    throw new Error('No downloadable video link found.');
  }

  return durl;
}
