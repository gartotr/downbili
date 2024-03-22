import { httpGet } from './httpio';
import * as assist from './assist';
import type { Option, DownFileMessage, httpGetResponseType } from '../types';
import { UserAgent } from '../constant'

interface Headers {
  [key: string]: string | string[];
}

/**
 * 下载单个视频链接
 * @param options 下载选项
 * @param url 视频链接
 * @param referer 请求头中的 Referer
 */
export async function downloadOne(options: Option, url: string, referer: string | string[]): Promise<DownFileMessage> {
  const headers: Headers = {
    Referer: referer,
    'User-Agent': UserAgent,
  };
  const response: httpGetResponseType = await httpGet({url, headers});

  if (response.headers['content-type'] === 'video/x-flv') {
    return assist.progressWithCookie(response, options);
  } else {
    return assist.progressWithoutCookie(response, options);
  }
}
