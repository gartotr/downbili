import axios from 'axios';
import path from 'path';
import type { Option, OrString, RequestHeaderType, DownloadObject, Durl, DownLoadRequestResult, DownFileMessage } from '../types';
import { VideoTypeEnum } from '../constant';
import { downloadOne, withSelectedAddress } from '.';

/**
 * 处理文件名和扩展名
 * @param {Option} option - 下载选项配置
 * @param {string} url - 视频URL
 */
function handleFileNameAndExt(option: Option, url: string): void {
  // URL提取文件名
  const match = url.match(/\/([^\/]+?)\?/);
  const matchName = match?.[1]?.trim() || '';
  const parsedPath = path.parse(matchName);

  // 确定扩展名
  let finalExt = parsedPath.ext;
  if (finalExt === '.m4s') {
    if (option.type === VideoTypeEnum.silent) {
      finalExt = '.mp4';
    }
    if (option.type === VideoTypeEnum.audio) {
      finalExt = '.mp3';
    }
  }

  // 文件名（不含扩展名）
  const baseName = option.defaultName || parsedPath.name;

  // 生成最终文件名
  option.name = option.fileName ? option.fileName + finalExt : baseName + finalExt;
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
 * @param {Option} option 视频下载配置
 * @param {RequestHeaderType} headers http请求头
 * @param {OrString} address B站视频下载地址
 * @returns {Promise<DownFileMessage | DownFileMessage[]>} 下载完成后返回信息
 */
export async function dealLink(option: Option, headers: RequestHeaderType, address: OrString): Promise<DownFileMessage | DownFileMessage[]> {
  const finalAddr = withSelectedAddress(option.url, address);

  const res: DownloadObject = await axios.get(finalAddr, { headers });
  // 检查响应状态
  if (res.code === -404 && res.message !== 'success') {
    const hasNonDefaultType = option.type && option.type !== VideoTypeEnum.default;
    throw new Error(hasNonDefaultType ? 'Please correspond to the URL video type!!' : 'Please pass in sessdata!!');
  }

  const data: DownLoadRequestResult = res.data;
  const durl: Durl[] = !option.type || option.type === VideoTypeEnum.default ? data.data.durl : [];

  if (durl.length === 0) {
    throw new Error('No downloadable video link found.');
  }

  // 单文件
  if (durl.length === 1) {
    return await downloadVideoUrl(option, durl[0].url, headers);
  }

  // 多文件
  const downloadPromises = durl.map(({ url }) => downloadVideoUrl(option, url, headers));
  return await Promise.all(downloadPromises);
}
