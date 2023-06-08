import * as deal from './deal';
import type { Option, OrString, RequestHeaderType } from '../types/types';
import { DownloadObject, Durl, DownLoadRequestResult } from '../types/responseType';
import { VideoTypeEnum } from '../constant';

const websect = require('websect');
const path = require('path');

export async function deallink(opt: Option, options: RequestHeaderType, addr: OrString, videourl: OrString): Promise<unknown> {
  return new Promise(async resolve => {
    if (Array.isArray(addr)) {
      addr = addr[0];
    }
    const res: DownLoadRequestResult = await websect.get({
      url: addr,
      headers: options,
    });
    const data: DownloadObject = JSON.parse(res.text);

    if (data.code === -404 && data.message !== 'success') {
      if (opt.type && opt.type !== VideoTypeEnum.default) {
        throw new Error(`请对应url视频类型`);
      } else {
        throw new Error('请传入sessdata!！');
      }
    }

    let durl: Durl[] = [];
    if (!opt.type || opt.type === VideoTypeEnum.default) {
      durl = data.data.durl;
    }

    if (durl.length > 1) {
      for (let i = 0; i < durl.length; i++) {
        const ul = durl[i].url;
        const match = ul.match(/\/([^\/]+?)\?/) || [];
        opt.default_name = match[1].trim();
        const filename = opt.filename;
        let ext: string = path.parse(opt.default_name).ext;
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
      const match = ul.match(/\/([^\/]+?)\?/) || [];
      opt.default_name = match[1].trim();
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
