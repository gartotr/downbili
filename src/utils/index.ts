import { parse } from 'url';
import $, { get } from 'websect';
import type { IVideoComments, ICommentsFormat, ICommentsFormatOmit } from '../types/types';
import type { PlayerResponse, PlayerTextObject, WebResponse, WebTextObject, WebData } from '../types/responseType';
// import _ from 'reero';

const path = require('path');
const fs = require('fs');
const reero = require('reero');
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
 * @discription 格式化评论信息，获取评论的主要信息
 * @param  {object} data 评论的数据
 * @return object
 */
export function formateVideoComments(data: IVideoComments) {
  const obj: ICommentsFormat = {
    mid: data.member.mid,
    uname: data.member.uname,
    sex: data.member.uname,
    avatar: data.member.avatar,
    message: data.content.message,
    ctime: data.ctime,
    like: data.like,
    replies: null,
  };

  const replies = data.replies; // 获取评论的回复
  if (!replies) {
    return obj;
  }
  obj.replies = replies.map(el => formateVideoComments(el));
  return obj;
}

/**
 * 不考虑 replies，只获取主要评论信息
 * @param {object} data  评论的数据
 * @return ICommentsFormatOmit
 */
export function formateVideoCommentsMajoy(data: IVideoComments): ICommentsFormatOmit {
  return {
    mid: data.member.mid,
    uname: data.member.uname,
    sex: data.member.sex,
    avatar: data.member.avatar,
    message: data.content.message,
    ctime: data.ctime,
    like: data.like,
  };
}

/**
 * 格式化Majoy
 * @param {unknow} data  评论的数据
 */
export function formateCommentsMajoy(data: unknown): ICommentsFormatOmit[] {
  if (!data) {
    return [];
  }
  if (!Array.isArray(data)) {
    throw new Error('the param is not array!');
  }
  let arrs: ICommentsFormatOmit[] = [];
  data.map(el => {
    arrs.push(formateVideoCommentsMajoy(el));
    if (el.replies) {
      arrs = arrs.concat(formateCommentsMajoy(el.replies));
    }
  });
  return arrs;
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
 * 判断是不是bv的播放地址
 * @param {string} url
 * @returns {boolean}
 */
export function isbvidurl(url: string): boolean {
  return /video\/BV/g.test(url);
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
 * bvidurl获取aid
 * @param {string} bvidurl
 * @returns {number}
 */
export async function get_aid_by_bvidurl(bvidurl: string): Promise<number> {
  return new Promise(async resolve => {
    const { aid } = await get_view_by_bvidurl(bvidurl);
    resolve(aid);
  });
}

/**
 * 用bvurl获取获取视频信息对象
 * @param {string} bvidurl
 * @returns {WebData}
 */
export async function get_view_by_bvidurl(bvidurl: string): Promise<WebData> {
  const bvid: string = get_bvid(bvidurl);
  return new Promise(async resolve => {
    const cid: number = await get_cid(bvid);
    const res: WebResponse = await reero('https://api.bilibili.com/x/web-interface/view?cid=' + cid + '&bvid=' + bvid);
    const parseText: WebTextObject = JSON.parse(res.text);
    const data: WebData = parseText.data;
    resolve(data);
  });
}

/**
 * 获取cid
 * @param {string} bvid
 * @returns
 */
export async function get_cid(bvid: string): Promise<number> {
  return new Promise(async resolve => {
    const res: PlayerResponse = await reero('https://api.bilibili.com/x/player/pagelist?bvid=' + bvid + '&jsonp=jsonp');
    const parseText: PlayerTextObject = JSON.parse(res.text);
    const cid: number = parseText.data[0].cid;
    resolve(cid);
  });
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
 */
export function getavByepurl(epurl: string): Promise<string> {
  return new Promise(resolve => {
    $.get(epurl).then((res: any) => {
      console.log('[ res res res] >', res);
      const htmlstr = res.uncompress().toString();
      $(htmlstr)
        .find('a.av-link')
        .each((el: any) => {
          let av: string = el.innerHTML.replace('AV', '');
          const reg = new RegExp('"aid":(\\d+?),"bvid":"' + av + '"', 'g');
          htmlstr.replace(reg, function (_match: any, key: any) {
            av = key;
          });
          resolve(av);
        });
    });
  });
}

/**
 * 根据视频播放地址获取 视频的av号
 * @param {string} url 视频的播放地址
 * @returns
 */
export function getavByurl(url: string): Promise<string> {
  return new Promise((resolve, _reject) => {
    if (isavurl(url)) {
      resolve(getavByavurl(url));
    }
    // 判断是不是番剧的播放地址
    if (isepurl(url)) {
      getavByepurl(url).then(data => {
        resolve(data);
      });
    }
    // 判断是不是视频地址
    if (isbvidurl(url)) {
      get_aid_by_bvidurl(url).then(aid => {
        resolve(String(aid));
      });
    }
  });
}

/**
 * 根据视频的av号获取视频的信息
 * @param  {string} av 视频的av号
 * @returns {Promise<{data:VideoMessage}>}
 */
export function getVideoMessageByav(av: string): Promise<WebTextObject> {
  return new Promise(async resolve => {
    const res: WebResponse = await get('https://api.bilibili.com/x/web-interface/view?aid=' + av);
    const parseText: WebTextObject = JSON.parse(res.text);
    resolve(parseText);
  });
}
