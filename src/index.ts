import $ from 'websect';
import { getavByurl, getVideoMessageByav } from './utils';
import { parse as _parse } from 'path';
import { httpGet as _get } from './utils/httpio';
import _ from 'reero';

import { deallink } from './utils/addr';
import type { Option } from './types/types';
import type { IWebInfo } from './types/responseType';

const defauotOptions: Option = {
  type: 'default',
  url: '',
  level: 16,
  sessdata: '',
};

const downBili = {
  /**
   * 再次对视频的信息进行一次封装
   * @param {string} av 视频的av号
   * @returns {IWebInfo}
   */
  getVideoIntroByav: function (av: string): Promise<IWebInfo> {
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
  },

  /**
   * 使用mid获取sid
   * @param {string} mid
   * @returns
   */
  get_sid_by_mid: function (mid: string) {
    const ul = 'https://api.bilibili.com/pgc/review/user?media_id=' + mid;
    return new Promise((resolve, _reject) => {
      $.get(ul).then((res: any) => {
        const data = JSON.parse(res.text);
        resolve(data.result.media.season_id);
      });
    });
  },

  /**
   * 根据 视频的av号 获取 视频的下载链接信息
   * @param {string} av 视频的av号
   * @param {number} level 视频的清晰度，112是1080P+，80是1080P，64是720P+，32是480P，16是360P
   * @returns  Promise<string | string[]>
   */
  getVideoDownloadLinkByav: function (av: string, level: number = 16): Promise<string | string[]> {
    return new Promise(async resolve => {
      const info = await this.getVideoIntroByav(av);
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
  },

  /**
   * 根据 视频播放地址 获取 视频的下载链接信息
   * @param {string} url 视频的播放地址
   * @param {number} level 视频的清晰度，112是1080P+，80是1080P，64是720P+，32是480P，16是360P
   */
  getVideoDownLinkByurl: function (url: string, level: number): Promise<string | string[]> {
    return new Promise(async resolve => {
      const res = await getavByurl(url);
      const data = await this.getVideoDownloadLinkByav(res, level);
      resolve(data);
    });
  },

  /**
   * 专门用于下载哔哩哔哩的视频
   * @param {Option} opt
   */
  downloadVideo: async function (opt: Option = defauotOptions) {
    return new Promise(async resolve => {
      if (!opt.url) {
        // 如果不存在就直接报错
        throw new Error('opt.url is not defined!');
      }

      const videourl = opt.url;
      const options = {
        Referer: videourl,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15',
        Cookie: '',
      };

      let { level = 16 } = opt;
      if (opt.sessdata) {
        options['Cookie'] = 'SESSDATA=' + opt.sessdata;
        level = 112;
        opt.level = opt.level ?? 112; // 有会员获取的视频自动设置为1080p+
      }
      const addr = await this.getVideoDownLinkByurl(videourl, level);
      resolve(await deallink(opt, options, addr, videourl));
    });
  },
};

export default downBili;
