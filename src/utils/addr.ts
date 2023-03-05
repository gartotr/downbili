import * as deal from './deal';
import type { Option } from '../types/types';
import { DownloadObject } from '../types/responseType';
import { VideoTypeEnum } from '../constant';

const $ = require('websect');
const path = require('path');

type OrString = string | string[];

export async function deallink(opt: Option, options: Record<string, string>, addr: OrString, videourl: OrString): Promise<unknown> {
  return new Promise(async resolve => {
    if (Array.isArray(addr)) {
      addr = addr[0];
    }
    const res = await $.get({
      url: addr,
      headers: options,
    });
    const data: DownloadObject = JSON.parse(res.text);

    if (data.code === -404 && data.message !== 'success') {
      if (opt.type && opt.type !== 'default') {
        throw new Error(`请对应url视频类型`);
      } else {
        throw new Error('请传入sessdata!！');
      }
    }

    let durl: any = [];
    if (!opt.type || opt.type === VideoTypeEnum.default) {
      durl = data.data.durl;
    }

    if (durl.length > 1) {
      for (const [_index, { url: ul }] of durl.entries()) {
        opt.default_name = ul.match(/\/([^\/]+?)\?/)[1].trim();
        const filename = opt.filename;
        let ext: any = path.parse(opt.default_name).ext;

        if (ext === '.m4s' && opt.type === VideoTypeEnum.silent) {
          ext = '.mp4';
          opt.default_name = path.parse(opt.default_name).name + ext;
        }

        if (ext === '.m4s' && opt.type === VideoTypeEnum.audio) {
          ext = '.mp3';
          opt.default_name = path.parse(opt.default_name).name + ext;
        }

        opt.name = (filename && filename + ext) || opt.default_name;

        await deal.downloadOne(opt, ul, videourl);
      }
    } else {
      const ul = durl[0].url;
      opt.default_name = ul.match(/\/([^\/]+?)\?/)[1].trim();
      const filename = opt.filename;
      let ext = path.parse(opt.default_name).ext;

      if (ext === '.m4s' && opt.type === VideoTypeEnum.silent) {
        ext = '.mp4';
        opt.default_name = path.parse(opt.default_name).name + ext;
      }

      if (ext === '.m4s' && opt.type === VideoTypeEnum.audio) {
        ext = '.mp3';
        opt.default_name = path.parse(opt.default_name).name + ext;
      }

      opt.name = (filename && filename + ext) || opt.default_name;

      const result = await deal.downloadOne(opt, ul, videourl);
      resolve(result);
    }
  });
}
