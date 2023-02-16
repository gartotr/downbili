import * as deal from './deal';
import type { DeallinkOptions } from '../types';
const $ = require('websect');
const path = require('path');


type OrString = string | string[];

export async function deallink(opt: DeallinkOptions, options: Record<string, string>, addr: OrString, videourl: OrString): Promise<void> {
  const res = await $.get({
    url: addr,
    headers: options,
  });

  const data = JSON.parse(res.text);

  if (data.code === -404 && data.message !== 'success') {
    if (opt.type && opt.type !== 'default') {
      throw new Error(`${opt.url} can't be divided into ${opt.type} mode`);
    } else {
      throw new Error('You should enter the sessdata！');
    }
  }

  let durl: any = [];
  if (opt.type === 'silent') {
    const dash = data.result.dash;
    const videos = dash.video;
    const level = opt.level ?? 80;
    const filteredVideos = videos.filter((el: any) => el.id === level);
    durl = filteredVideos.map((el: any) => ({ url: el.baseUrl }));

    if (durl.length > 1 && !opt.download_backup) {
      durl = [durl[0]];
    }
  } else if (opt.type === 'audio') {
    const dash = data.result.dash;
    const audios = dash.audio;
    durl = audios.map((el: any) => ({ url: el.baseUrl }));

    if (durl.length > 1 && !opt.download_backup) {
      durl = [durl[0]];
    }
  } else if (!opt.type || opt.type === 'default') {
    durl = data.data.durl;
  }

  if (durl.length > 1) {
    for (const [_index, { url: ul }] of durl.entries()) {
      opt.default_name = ul.match(/\/([^\/]+?)\?/)[1].trim();
      const filename = opt.filename;
      let ext: any = path.parse(opt.default_name).ext;

      if (ext === '.m4s' && opt.type === 'silent') {
        ext = '.mp4';
        opt.default_name = path.parse(opt.default_name).name + ext;
      }

      if (ext === '.m4s' && opt.type === 'audio') {
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

    if (ext === '.m4s' && opt.type === 'silent') {
      ext = '.mp4';
      opt.default_name = path.parse(opt.default_name).name + ext;
    }

    if (ext === '.m4s' && opt.type === 'audio') {
      ext = '.mp3';
      opt.default_name = path.parse(opt.default_name).name + ext;
    }

    opt.name = (filename && filename + ext) || opt.default_name;

    await deal.downloadOne(opt, ul, videourl);
  }
}
