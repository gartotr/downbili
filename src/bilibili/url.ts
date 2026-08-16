import type { OrString } from '../types';

/**
 * 根据视频播放地址获取 视频的av号
 * @param  {string} avurl 视频的播放地址 【注意：不是番剧的视频播放地址】
 * @returns {string}
 */
export function getavByavurl(avurl: string): string {
  const match = avurl.match(/\/video\/av(\d+)/);
  return match ? match[1] : '';
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
 */
export function get_bvid(url: string): string {
  if (isbvidurl(url)) {
    const match = url.match(/\/video\/(BV[0-9a-zA-Z]+)/);
    return match ? match[1] : '';
  } else {
    throw new Error('Is not bvid url...');
  }
}

/**
 * 是否是番剧 目前只识别bangumi
 * @param {string} url 视频的播放地址
 * @returns {boolean}
 */
export function isBangumi(url: string): boolean {
  return url.includes('bangumi');
}

/**
 * 判断是不是av的播放地址
 * @param {string} url
 * @returns {boolean}
 */
export function isAvurl(url: string): boolean {
  return /av\d+/g.test(url);
}

/**
 * 获取QueryString
 * @param {string} url url地址
 * @param {string} getValue 要获取的参数
 * @returns string | null
 */
export function getQueryString(url: string, getValue: string) {
  const newUrl = new URL(url);
  return new URLSearchParams(newUrl.search).get(getValue);
}

/**
 * 根据信息返回最终下载地址
 * @param {string} url 视频播放地址
 * @param {OrString} addr 视频下载地址
 * @returns {string} 最终下载地址
 */
export function withSelectedAddress(url: string, addr: OrString): string {
  if (Array.isArray(addr)) {
    const indexParam = getQueryString(url, 'p');
    if (indexParam !== null) {
      const index = parseInt(indexParam, 10);
      addr = addr[index - 1];
    } else {
      addr = addr[0];
    }
  }
  return addr;
}
