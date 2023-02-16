import { httpGet } from './httpio';
import * as assist from './assist';
import type { IDownloadOption } from '../types';

interface Headers {
  [key: string]: string | string[];
}

/**
 * 下载单个视频链接
 * @param options 下载选项
 * @param url 视频链接
 * @param referer 请求头中的 Referer
 */
export async function downloadOne(options: IDownloadOption, url: string, referer: string | string[]): Promise<unknown> {
  const headers: Headers = {
    Referer: referer,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15',
  };
  const response: any = await httpGet({ url, headers });
  if (response.headers['content-type'] === 'video/x-flv') {
    return assist.progressWithCookie(response, options);
  } else {
    return assist.progressWithoutCookie(response, options);
  }
}
