import type { IVideoComments, ICommentsFormat, ICommentsFormatOmit } from '../types';
// import _ from 'reero';

const $ = require('websect');
const path = require('path');
const fs = require('fs');
const _ = require('reero');
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
 * @returns {boolean}
 */
export function get_mid_by_url(url: string): string {
  const matched = url.match(/md(\d+)/) || ['', ''];
  return matched[1];
}

/**
 * 获取fan_message
 * @param {string} sid
 * @returns {boolean}
 */
export function get_fan_message_by_sid(sid: unknown): Promise<any> {
  var ul = 'https://api.bilibili.com/pgc/web/season/section?season_id=' + sid;
  return new Promise((resolve, _reject) => {
    $.get(ul).then((res: any) => {
      resolve(JSON.parse(res.text));
    });
  });
}

/**
 * 获取aid
 * @param {string} sid
 * @returns {boolean}
 */
export function get_aid_by_bvidurl(bvidurl: string): Promise<any> {
  return new Promise(resolve => {
    get_view_by_bvidurl(bvidurl).then(view => {
      resolve(view.aid);
    });
  });
}

/**
 * 获取view
 * @param {string} sid
 * @returns {boolean}
 */
export function get_view_by_bvidurl(bvidurl: string): Promise<any> {
  var bvid = get_bvid(bvidurl);
  return new Promise(resolve => {
    get_cid(bvid).then(cid => {
      var cid = cid;
      _('https://api.bilibili.com/x/web-interface/view?cid=' + cid + '&bvid=' + bvid).then((response: any) => {
        var data = JSON.parse(response.text).data;
        resolve(data);
      });
    });
  });
}

/**
 * 获取cid
 * @param {string} sid
 * @returns {boolean}
 */
export function get_cid(bvid: unknown): Promise<any> {
  return new Promise(resolve => {
    _('https://api.bilibili.com/x/player/pagelist?bvid=' + bvid + '&jsonp=jsonp').then((response: any) => {
      var cid = JSON.parse(response.text).data[0].cid;
      resolve(cid);
    });
  });
}

/**
 * 获取cid
 * @param {string} url
 * @returns {boolean}
 */
export function get_bvid(url: string): string {
  if (isbvidurl(url)) {
    const matched = url.match(/\/([^/]+?)\?/) || ['', ''];
    return matched[1];
  } else {
    throw new Error('is not bvid url...');
  }
}
