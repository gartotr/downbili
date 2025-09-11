import axios from 'axios';
import path from 'path';
import type { Option, OrString, RequestHeaderType, DownloadObject, Durl, DownLoadRequestResult, DownFileMessage } from '../types';
import { VideoTypeEnum } from '../constant';
import { downloadOne, withSelectedAddress } from '.';

/**
 * 处理文件名和扩展名
 */
function handleFileNameAndExt(opt: Option, url: string): void {
  const match = url.match(/\/([^\/]+?)\?/) || [];
  opt.defaultName = match[1]?.trim() || '';
  let ext: string = path.parse(opt.defaultName).ext;

  if (ext === '.m4s') {
    if (opt.type === VideoTypeEnum.silent) {
      ext = '.mp4';
    } else if (opt.type === VideoTypeEnum.audio) {
      ext = '.mp3';
    }
    opt.defaultName = path.parse(opt.defaultName).name + ext;
  }

  opt.name = (opt.fileName && opt.fileName + ext) || opt.defaultName;
}

/**
 * 下载单个视频URL
 */
async function downloadVideoUrl(opt: Option, url: string, headers: RequestHeaderType): Promise<DownFileMessage> {
  handleFileNameAndExt(opt, url);
  return await downloadOne(opt, url, headers);
}

/**
 * 输入链接下载视频
 * @param {Option} opt 视频下载配置
 * @param {RequestHeaderType} headers http请求头
 * @param {OrString} addr B站视频下载地址
 * @returns {Promise<DownFileMessage | DownFileMessage[]>} 下载完成后返回信息
 */
export async function dealLink(opt: Option, headers: RequestHeaderType, addr: OrString): Promise<DownFileMessage | DownFileMessage[]> {
  const finalAddr = withSelectedAddress(opt.url, addr);

  const res: DownloadObject = await axios.get(finalAddr, { headers });

  // 检查响应状态
  if (res.code === -404 && res.message !== 'success') {
    const hasNonDefaultType = opt.type && opt.type !== VideoTypeEnum.default;
    throw new Error(hasNonDefaultType ? 'Please correspond to the URL video type!!' : 'Please pass in sessdata!!');
  }

  const data: DownLoadRequestResult = res.data;
  const durl: Durl[] = !opt.type || opt.type === VideoTypeEnum.default ? data.data.durl : [];

  if (durl.length === 0) {
    throw new Error('No downloadable video link found.');
  }

  // 单文件
  if (durl.length === 1) {
    return await downloadVideoUrl(opt, durl[0].url, headers);
  }

  // 多文件
  const downloadPromises = durl.map(({ url }) => downloadVideoUrl(opt, url, headers));
  return await Promise.all(downloadPromises);
}
