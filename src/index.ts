import { deallink } from './utils/addr';
import { getVideoDownLinkByurl } from './utils/download';
import { UserAgent, ArticulationEnum } from './constant';
import type { Option, RequestHeaderType } from './types/types';

/**
 * 下载哔哩哔哩的视频
 * @param {Option} opt
 */
const downBili = async (opt: Option) => {
  let { url, level = ArticulationEnum._16 } = opt;
  if (!url) {
    // 如果不存在就直接报错
    throw new Error('必须传入url!!');
  }

  const requeseHeader: RequestHeaderType = {
    Referer: url,
    Cookie: '',
    'User-Agent': UserAgent,
  };

  if (opt.sessdata) {
    requeseHeader['Cookie'] = 'SESSDATA=' + opt.sessdata;
    level = ArticulationEnum._1080PLUS;
    opt.level = opt.level ?? ArticulationEnum._1080PLUS; // 有会员获取的视频自动设置为1080p+
  }
  const addr = await getVideoDownLinkByurl(url, level);
  const dealResult = await deallink(opt, requeseHeader, addr, url);
  return dealResult;
};

export { downBili };
