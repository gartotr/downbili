import axios from 'axios';
import { get_bvid } from './url';
import { ArticulationEnum, PAGE_LIST_API, PLAYURL_API, WEB_INTERFACE_API } from '../constant';
import type { PlayerTextObject, WebData, WebTextObjectData, WebTextObject } from '../types';

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
 * 获取cid
 * @param {string} bvid
 * @returns
 */
export async function getCid(bvid: string): Promise<number> {
  const api: string = `${PAGE_LIST_API}?bvid=${bvid}&jsonp=jsonp`;
  const res: PlayerTextObject = await axios.get(api);
  return res.data.data[0].cid;
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
  const res: WebTextObjectData = await axios.get(api);
  return res.data.data;
}

/**
 * 根据视频的aid号获取视频的信息
 * @param  {string} aid 视频的aid号
 * @returns {Promise<{WebTextObject}>}
 */
export async function getVideoMessageByAid(aid: string | number): Promise<WebTextObject> {
  const api = `${WEB_INTERFACE_API}?aid=${aid}`;
  const res = await axios.get<WebTextObject>(api);
  return res.data;
}
