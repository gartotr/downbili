import $, { get } from 'websect';
import { parse } from 'url';
import { isepurl, isavurl, isbvidurl, get_mid_by_url, get_fan_message_by_sid, get_aid_by_bvidurl } from './utils';
import { parse as _parse } from 'path';
import { httpGet as _get } from './utils/httpio';
import _ from 'reero';

import { deallink } from './utils/addr';
import { Option, VideoMessage } from './types';

const downBili = {
  /**
   * 根据视频的av号获取视频的信息
   * @param  {string} av 视频的av号
   * @returns {Promise<{data:VideoMessage}>}
   */
  getVideoMessageByav: function (av: string): Promise<{ data: VideoMessage }> {
    return new Promise((resolve, _reject) => {
      get('https://api.bilibili.com/x/web-interface/view?aid=' + av).then((res: { text: string }) => {
        resolve(JSON.parse(res.text));
      });
    });
  },

  /**
   * 再次对视频的信息进行一次封装
   * @param {string} av 视频的av号
   */
  getVideoIntroByav: function (av: string): Promise<any> {
    return new Promise((resolve, _reject) => {
      this.getVideoMessageByav(av).then(res => {
        const { data } = res;
        const info = {
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
    });
  },

  /**
   * 根据视频播放地址获取 视频的av号
   * @param  {string} avurl 视频的播放地址 【注意：不是番剧的视频播放地址】
   * @returns {string}
   */
  getavByavurl: function (avurl: string): string {
    const path = parse(avurl).pathname;
    return path?.replace('/video/av', '') ?? '';
  },
  /**
   * 根据番剧地址获取 视频的av号
   * @param {string} epurl 视频的番剧地址
   */
  getavByepurl: function (epurl: any) {
    return new Promise(resolve => {
      $.get(epurl).then((res: any) => {
        var htmlstr = res.uncompress().toString();
        $(htmlstr)
          .find('a.av-link')
          .each((el: any) => {
            var av = el.innerHTML.replace('AV', '');
            // "aid":70158079,"bvid":"BV1aE411D7fp"
            var reg = new RegExp('"aid":(\\d+?),"bvid":"' + av + '"', 'g');
            // console.log(reg)
            htmlstr.replace(reg, function (_match: any, key: any) {
              av = key;
            });
            resolve(av);
          });
      });
    });
  },
  /**
   * 根据视频播放地址获取 视频的av号
   * @param {string} url 视频的播放地址
   * @returns
   */
  getavByurl: function (url: string) {
    return new Promise((resolve, _reject) => {
      let av = '';
      if (isavurl(url)) {
        av = this.getavByavurl(url);
        resolve(av);
      }
      // 判断是不是番剧的播放地址
      if (isepurl(url)) {
        this.getavByepurl(url).then(data => {
          av = data as string;
          resolve(av);
        });
      }
      // 判断是不是视频地址
      if (isbvidurl(url)) {
        get_aid_by_bvidurl(url).then(aid => {
          resolve(aid);
        });
      }
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
   * 获取粉丝信息
   * @param {string} url
   * @returns
   */
  get_fan_message_by_url: function (url: string) {
    return new Promise((resolve, _reject) => {
      this.get_sid_by_mid(get_mid_by_url(url)).then(sid => {
        get_fan_message_by_sid(sid).then(data => {
          resolve(data);
        });
      });
    });
  },

  /**
   * 根据 视频的av号 获取 视频的下载链接信息
   * @param av {string} 视频的av号
   * @param level {string} 视频的清晰度，112是1080P+，80是1080P，64是720P+，32是480P，16是360P
   */
  getVideoDownloadLinkByav: function (av: string, level = 16): Promise<string | string[]> {
    return new Promise(resolve => {
      this.getVideoIntroByav(av).then(info => {
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
    });
  },

  /**
   * @discription 根据 视频播放地址 获取 视频的下载链接信息
   * @param url {string} 视频的播放地址
   * @param level {string} 视频的清晰度，112是1080P+，80是1080P，64是720P+，32是480P，16是360P
   */
  getVideoDownLinkByurl: function (url: string, level: number): Promise<string | string[]> {
    return new Promise(resolve => {
      this.getavByurl(url).then(res => {
        const av = res as string;
        this.getVideoDownloadLinkByav(av, level).then(data => {
          resolve(data);
        });
      });
    });
  },

  /**
   * 根据视频下载链接 下载视频
   */
  downloadVideoBylink: function (addr: string | string[], opt: any, options: any, videourl: string | string[]) {
    return new Promise(resolve => {
      if (opt.mode === 'av') {
        // videourl=addr ，为了避免 videourl 为undefined ，这里可以给它赋值为 addr
        videourl = addr;
        options['Referer'] = addr; // 这里记得加上来源，因为 videourl此时的值是 undefined
      }
      resolve(deallink(opt, options, addr, videourl));
    });
  },

  /**
   * 专门用于下载哔哩哔哩的视频
   * @param {Option} opt
   *
   */
  downloadVideo: async function (opt: Option) {
    return new Promise((resolve, _reject) => {
      const videourl = opt.url;
      const options = {
        Referer: '',
        'User-Agent': '',
        Cookie: '',
      };
      let level = opt.level || 16;
      options['Referer'] = videourl;
      options['User-Agent'] =
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15';
      if (opt.sessdata) {
        options['Cookie'] = 'SESSDATA=' + opt.sessdata;
        level = 112;
        opt.level = opt.level || 112; // 遇见会员，获取的视频自动设置为1080p+
      }
      if (!opt.url) {
        // 如果不存在就直接报错
        throw new Error('opt.url is not defined!');
      }

      this.getVideoDownLinkByurl(videourl, level).then(addr => {
        resolve(this.downloadVideoBylink(addr, opt, options, videourl));
      });
    });
  },
};

export default downBili;
