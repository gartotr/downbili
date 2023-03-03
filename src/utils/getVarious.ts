import { parse } from 'url';
import websect, { get as websectGet } from 'websect';

import { WEB_INTERFACE_API, PAGE_LIST_API } from '../constant';
import type { PlayerResponse, PlayerTextObject, WebResponse, WebTextObject, WebData } from '../types/responseType';

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
  const res = await websectGet(epurl);
  const htmlstr = res.uncompress().toString();
  websect(htmlstr)
    .find('a.av-link')
    .each((el: any) => {
      let av: string = el.innerHTML.replace('AV', '');
      const reg = new RegExp('"aid":(\\d+?),"bvid":"' + av + '"', 'g');
      htmlstr.replace(reg, function (_match: any, key: any) {
        av = key;
      });
      return av;
    });
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
    const matched = match1 ? match1[1] : match2 ? match2[1] : '';
    return matched;
  } else {
    throw new Error('is not bvid url...');
  }
}

/**
 * 获取cid
 * @param {string} bvid
 * @returns
 */
export async function get_cid(bvid: string): Promise<number> {
  const api: string = `${PAGE_LIST_API}?bvid=${bvid}&jsonp=jsonp`;
  const res: PlayerResponse = await reero(api);
  const parseText: PlayerTextObject = JSON.parse(res.text);
  const cid: number = parseText.data[0].cid;
  return cid;
}

/**
 * 用bvurl获取获取视频信息对象
 * @param {string} bvidurl
 * @returns {WebData}
 */
export async function get_view_by_bvidurl(bvidurl: string): Promise<WebData> {
  const bvid: string = get_bvid(bvidurl);
  const cid: number = await get_cid(bvid);
  const api: string = `${WEB_INTERFACE_API}?cid=${cid}&bvid=${bvid}`;
  const res: WebResponse = await reero(api);
  const parseText: WebTextObject = JSON.parse(res.text);
  const data: WebData = parseText.data;
  return data;
}

/**
 * bvidurl获取aid
 * @param {string} bvidurl
 * @returns {number}
 */
export async function get_aid_by_bvidurl(bvidurl: string): Promise<number> {
  const { aid } = await get_view_by_bvidurl(bvidurl);
  return aid;
}

/**
 * 获取mid
 * @param {string} url
 * @returns {string}
 */
export function get_mid_by_url(url: string): string {
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
  const parseText: WebTextObject = JSON.parse(res.text);
  return parseText;
}
