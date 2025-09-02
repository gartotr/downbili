import axios, { AxiosRequestConfig } from 'axios';
import * as assist from './assist';
import type { Option, DownFileMessage } from '../types';
import { UserAgent, AudioFormatEnum } from '../constant';

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

  const transform = Object.values(AudioFormatEnum).includes(options.format as AudioFormatEnum);

  const config: AxiosRequestConfig = {
    headers,
    maxRedirects: 5,
    validateStatus: (status: number) => status >= 200 && status < 300,
    responseType: 'stream',
  };

  const response = await axios.get(url, config);
  return assist.progressWithoutCookie(response.data, options, transform);
}
