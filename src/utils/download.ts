import $ from 'websect';
import { getavByurl, getVideoMessageByav } from '.';
import { parse as _parse } from 'path';
import { httpGet as _get } from './httpio';
import _ from 'reero';

import type { IWebInfo } from '../types/responseType';

/**
 * 使用mid获取sid
 * @param {string} mid
 * @returns
 */
export const get_sid_by_mid = (mid: string) => {
  const ul = 'https://api.bilibili.com/pgc/review/user?media_id=' + mid;
  return new Promise((resolve, _reject) => {
    $.get(ul).then((res: any) => {
      const data = JSON.parse(res.text);
      resolve(data.result.media.season_id);
    });
  });
};

/**
 * 再次对视频的信息进行一次封装
 * @param {string} av 视频的av号
 * @returns {IWebInfo}
 */
export const getVideoIntroByav = (av: string): Promise<IWebInfo> => {
  return new Promise(async resolve => {
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
    resolve(info);
  });
};

/**
 * 根据 视频的av号 获取 视频的下载链接信息
 * @param {string} av 视频的av号
 * @param {number} level 视频的清晰度，112是1080P+，80是1080P，64是720P+，32是480P，16是360P
 * @returns  Promise<string | string[]>
 */
export const getVideoDownloadLinkByav = (av: string, level: number = 16): Promise<string | string[]> => {
  return new Promise(async resolve => {
    const info = await getVideoIntroByav(av);
    const pages = info.pages;
    if (pages.length > 1) {
      const links: string[] = [];
      for (let i = 0, len = pages.length; i < len; i++) {
        const cid = pages[i].cid;
        links.push('https://api.bilibili.com/x/player/playurl?avid=' + av + ' &cid=' + cid + ' &qn=' + level + '&otype=json');
      }
      resolve(links);
    } else {
      const cid = info.cid;
      resolve('https://api.bilibili.com/x/player/playurl?avid=' + av + ' &cid=' + cid + ' &qn=' + level + '&otype=json');
    }
  });
};

/**
 * 根据 视频播放地址 获取 视频的下载链接信息
 * @param {string} url 视频的播放地址
 * @param {number} level 视频的清晰度，112是1080P+，80是1080P，64是720P+，32是480P，16是360P
 */
export const getVideoDownLinkByurl = (url: string, level: number): Promise<string | string[]> => {
  return new Promise(async resolve => {
    const res = await getavByurl(url);
    const data = await getVideoDownloadLinkByav(res, level);
    resolve(data);
  });
};
