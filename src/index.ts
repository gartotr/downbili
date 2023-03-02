import { deallink } from './utils/addr';
import { getVideoDownLinkByurl } from './utils/download';
import { UserAgent } from './constant';
import type { Option } from './types/types';

/**
 * 下载哔哩哔哩的视频
 * @param {Option} opt
 */
const downBili = async (opt: Option) => {
  return new Promise(async resolve => {
    const { url } = opt;
    if (url) {
      // 如果不存在就直接报错
      throw new Error('opt.url is not defined!');
    }

    const options = {
      Referer: url,
      'User-Agent': UserAgent,
      Cookie: '',
    };

    let { level = 16 } = opt;
    if (opt.sessdata) {
      options['Cookie'] = 'SESSDATA=' + opt.sessdata;
      level = 112;
      opt.level = opt.level ?? 112; // 有会员获取的视频自动设置为1080p+
    }
    const addr = await getVideoDownLinkByurl(url, level);
    resolve(await deallink(opt, options, addr, url));
  });
};

export { downBili };
