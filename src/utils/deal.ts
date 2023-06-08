import { httpGet } from './httpio';
import * as assist from './assist';
import type { Option } from '../types/types';
import type { hettpGetResponseType } from '../types/responseType';

interface Headers {
  [key: string]: string | string[];
}

/**
 * 下载单个视频链接
 * @param options 下载选项
 * @param url 视频链接
 * @param referer 请求头中的 Referer
 */
export async function downloadOne(options: Option, url: string, referer: string | string[]): Promise<hettpGetResponseType> {
  const headers: Headers = {
    Referer: referer,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15',
  };
  const response: hettpGetResponseType = await httpGet({ url, headers });
  console.log('response', response);

  if (response.headers['content-type'] === 'video/x-flv') {
    return assist.progressWithCookie(response, options);
  } else {
    return assist.progressWithoutCookie(response, options);
  }
}
