import axios from 'axios';
import path from 'path';
import type { Option, OrString, RequestHeaderType, DownloadObject, Durl, DownLoadRequestResult, DownFileMessage } from '../types';
import { VideoTypeEnum } from '../constant';
import { downloadOne, withSelectedAddress } from '.';

/**
 * 输入链接下载视频
 * @param {Option} opt 视频下载配置
 * @param {RequestHeaderType} headers http请求头
 * @param {OrString} addr B站视频下载地址
 * @returns {Promise<DownFileMessage>} 下载完成后返回信息
 */
export async function dealLink(opt: Option, headers: RequestHeaderType, addr: OrString): Promise<DownFileMessage> {
  return new Promise(async resolve => {
    const finalAddr = withSelectedAddress(opt.url, addr);

    const res: DownloadObject = await axios.get(finalAddr, { headers });

    if (res.code === -404 && res.message !== 'success') {
      if (opt.type && opt.type !== VideoTypeEnum.default) {
        throw new Error(`Please correspond to the URL video type!!`);
      } else {
        throw new Error('Please pass in sessdata!!');
      }
    }

    const data: DownLoadRequestResult = res.data;

    let durl: Durl[] = [];
    if (!opt.type || opt.type === VideoTypeEnum.default) {
      durl = data.data.durl;
    }

    if (durl.length > 1) {
      for (let i = 0; i < durl.length; i++) {
        const ul = durl[i].url;
        const match = ul.match(/\/([^\/]+?)\?/) || [];
        opt.defaultName = match[1].trim();
        const fileName = opt.fileName;
        let ext: string = path.parse(opt.defaultName).ext;
        if (ext === '.m4s' && opt.type === VideoTypeEnum.silent) {
          ext = '.mp4';
          opt.defaultName = path.parse(opt.defaultName).name + ext;
        }
        if (ext === '.m4s' && opt.type === VideoTypeEnum.audio) {
          ext = '.mp3';
          opt.defaultName = path.parse(opt.defaultName).name + ext;
        }
        opt.name = (fileName && fileName + ext) || opt.defaultName;
        await downloadOne(opt, ul, headers);
      }
    } else {
      const ul = durl[0].url;
      const match = ul.match(/\/([^\/]+?)\?/) || [];
      opt.defaultName = match[1].trim();
      const fileName = opt.fileName;
      // 解析文件后缀名称
      let ext = path.parse(opt.defaultName).ext;

      if (ext === '.m4s' && opt.type === VideoTypeEnum.silent) {
        ext = '.mp4';
        opt.defaultName = path.parse(opt.defaultName).name + ext;
      }

      if (ext === '.m4s' && opt.type === VideoTypeEnum.audio) {
        ext = '.mp3';
        opt.defaultName = path.parse(opt.defaultName).name + ext;
      }

      opt.name = (fileName && fileName + ext) || opt.defaultName;

      const result = await downloadOne(opt, ul, headers);
      resolve(result);
    }
  });
}
