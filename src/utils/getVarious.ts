import { parse } from 'url';
import websect, { get as websectGet } from 'websect';

import { isAvurl, isEpurl } from '.';
import { PAGE_LIST_API, WEB_INTERFACE_API } from '../constant';
import type { PlayerResponse, PlayerTextObject, WebData, WebResponse, WebTextObject } from '../types/responseType';

const reero = require('reero');

/**
 * 根据视频播放地址获取 视频的av号
 * @param  {string} avurl 视频的播放地址 【注意：不是番剧的视频播放地址】
 * @returns {string}
 */
export function getavByavurl(avurl: string): string {
  const path = parse(avurl).pathname;
  return path?.replace('/video/av', '') ?? '';
}

/**
 * 根据番剧地址获取 视频的av号
 * @param {string} epurl 视频的番剧地址
 * @returns {Promise<string>}
 */
export async function getavByepurl(epurl: string): Promise<string> {
  try {
    const res = await websectGet(epurl);
    const htmlstr = res.uncompress().toString();
    const avLinks = websect(htmlstr).find('a.av-link');

    if (avLinks.length > 0) {
      const av = avLinks[0].innerHTML.replace('AV', '');
      // 使用正则表达式查找并提取 av 号
      const reg = new RegExp('"aid":(\\d+?),"bvid":"' + av + '"', 'g');
      const match = reg.exec(htmlstr);

      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // 如果没有找到 av 号或出现错误，则返回空字符串
  return '';
}


/**
 * 判断是不是bv的播放地址
 * @param {string} url
 * @returns {boolean}
 */
export function isbvidurl(url: string): boolean {
  return /video\/BV/g.test(url);
}

/**
 * 获取bvid
 * @param {string} url
 * @returns {boolean}
 *
 */
export function get_bvid(url: string): string {
  if (isbvidurl(url)) {
    const match1 = url.match(/\/([^/]+?)\/\?/); // video/BV1122223sr/?
    const match2 = url.match(/\/([^/]+?)\?/); // video/BV1122223sr?
    return match1 ? match1[1] : match2 ? match2[1] : '';
  } else {
    throw new Error('is not bvid url...');
  }
}

/**
 * 获取cid
 * @param {string} bvid
 * @returns
 */
export async function getCid(bvid: string): Promise<number> {
  const api: string = `${PAGE_LIST_API}?bvid=${bvid}&jsonp=jsonp`;
  const res: PlayerResponse = await reero(api);
  const parseText: PlayerTextObject = JSON.parse(res.text);
  return parseText.data[0].cid;
}

/**
 * 用bvurl获取获取视频信息对象
 * @param {string} bvidurl
 * @returns {WebData}
 */
export async function getViewByBvidUrl(bvidurl: string): Promise<WebData> {
  const bvid: string = get_bvid(bvidurl);
  const cid: number = await getCid(bvid);
  const api: string = `${WEB_INTERFACE_API}?cid=${cid}&bvid=${bvid}`;
  const res: WebResponse = await reero(api);
  const parseText: WebTextObject = JSON.parse(res.text);
  return parseText.data;
}

/**
 * bvidurl获取aid
 * @param {string} bvidurl
 * @returns {number}
 */
export async function getAidByBvidurl(bvidurl: string): Promise<number> {
  const { aid } = await getViewByBvidUrl(bvidurl);
  return aid;
}

/**
 * 获取mid
 * @param {string} url
 * @returns {string}
 */
export function getMidByUrl(url: string): string {
  const matched = url.match(/md(\d+)/) || ['', ''];
  return matched[1];
}

/**
 * 根据视频的av号获取视频的信息
 * @param  {string} av 视频的av号
 * @returns {Promise<{WebTextObject}>}
 */
export async function getVideoMessageByav(av: string): Promise<WebTextObject> {
  const api = `${WEB_INTERFACE_API}?aid=${av}`;
  const res: WebResponse = await websectGet(api);
  return JSON.parse(res.text);
}

/**
 * 根据视频播放地址获取 视频的av号
 * @param {string} url 视频的播放地址
 * @returns {Promise<string>}
 */
export async function getAvByurl(url: string): Promise<string> {
  if (isAvurl(url)) {
    return getavByavurl(url);
  }
  // 判断是不是番剧的播放地址
  if (isEpurl(url)) {
    return await getavByepurl(url);
  }
  // 判断是不是视频地址
  if (isbvidurl(url)) {
    const aid = await getAidByBvidurl(url);
    return String(aid);
  }
  return '';
}
