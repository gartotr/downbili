import { getavByurl } from './getVarious';
import { parse as _parse } from 'path';
import { httpGet as _get } from './httpio';
import { ArticulationEnum, PLAYURL_API } from '../constant';
import { getVideoMessageByav } from './getVarious';
import type { IWebInfo } from '../types/responseType';

/**
 * 再次对视频的信息进行一次封装
 * @param {string} av 视频的av号
 * @returns {IWebInfo}
 */
export const getVideoIntroByav = async (av: string): Promise<IWebInfo> => {
  const { data } = await getVideoMessageByav(av);
  const info: IWebInfo = {
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
  return info;
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
 * @returns {Promise<string | string[]>}
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
    const link = initialUrl(av, cid, level);
    return link;
  }
};

/**
 * 根据 视频播放地址 获取 视频的下载链接信息
 * @param {string} url 视频的播放地址
 * @param {ArticulationEnum} level
 */
export const getVideoDownLinkByurl = async (url: string, level: ArticulationEnum): Promise<string | string[]> => {
  const res = await getavByurl(url);
  const data = await getVideoDownloadLinkByav(res, level);
  return data;
};
