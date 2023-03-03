import { getavByavurl, getavByepurl, isbvidurl, get_aid_by_bvidurl } from './getVarious';

const path = require('path');
const fs = require('fs');
/**
 * 判断是不是 Object
 * @param {unknown} o
 * @returns boolean
 */
export function isObject(o: unknown) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

/**
 * 判断是不是 Array
 * @param {unknown} o
 * @returns boolean
 */
export function isArray(o: unknown) {
  return Array.isArray(o);
}

/**
 * 判断是不是 string
 * @param {unknown} o
 * @returns boolean
 */
export function isString(o: unknown) {
  return typeof o === 'string';
}

/**
 * 要创建的文件夹的路径，这里的路径是相对于根目录的路径
 * @param {string} ul
 */
export function createfolder(ul: string) {
  if (!ul) {
    throw new Error('the param is not input!');
  }
  const folders = ul.split('/').filter(el => el);
  let root = process.cwd();
  for (let i = 0, len = folders.length; i < len; i++) {
    root = path.join(root, folders[i]);
    try {
      fs.statSync(root);
    } catch (err) {
      fs.mkdirSync(root);
    }
  }
}

/**
 * 判断是不是番剧的播放地址
 * @param {string} url
 * @returns {boolean}
 */
export function isepurl(url: string): boolean {
  return /ep\d+/g.test(url);
}

/**
 * 判断是不是av的播放地址
 * @param {string} url
 * @returns {boolean}
 */
export function isavurl(url: string): boolean {
  return /av\d+/g.test(url);
}

/**
 * 判断是不是md的播放地址
 * @param {string} url
 * @returns {boolean}
 */
export function ismdurl(url: string): boolean {
  return /md\d+/g.test(url);
}

/**
 * 根据视频播放地址获取 视频的av号
 * @param {string} url 视频的播放地址
 * @returns {Promise<string>}
 */
export async function getavByurl(url: string): Promise<string> {
  if (isavurl(url)) {
    return getavByavurl(url);
  }
  // 判断是不是番剧的播放地址
  if (isepurl(url)) {
    const data = await getavByepurl(url);
    return data;
  }
  // 判断是不是视频地址
  if (isbvidurl(url)) {
    const aid = await get_aid_by_bvidurl(url);
    return String(aid);
  }
  return '';
}
