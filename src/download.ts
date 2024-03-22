import { getVideoDownLinkByurl, dealLink, ArticulationEnum, UserAgent } from './exports';
import type { Option, RequestHeaderType, DownFileMessage } from './types';

/**
 * 下载哔哩哔哩的视频
 * @param {Option} opt
 */
export const downBili = async (opt: Option): Promise<DownFileMessage> => {
  let {url, sessdata, level = ArticulationEnum._16} = opt;
  if (!url) {
    // 如果不存在就直接报错
    throw new Error('必须传入url!!');
  }

  const requestHeader: RequestHeaderType = {
    Referer: url,
    Cookie: sessdata ? `SESSDATA=${ sessdata }` : '',
    'User-Agent': UserAgent,
  };

  if (sessdata) {
    level = ArticulationEnum._1080PLUS;
    opt.level = opt.level ?? ArticulationEnum._1080PLUS; // 有会员获取的视频自动设置为1080p+
  }
  const addr = await getVideoDownLinkByurl(url, level);
  return await dealLink(opt, requestHeader, addr, url);
};
