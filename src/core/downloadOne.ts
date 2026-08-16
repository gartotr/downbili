import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Readable } from 'stream';
import { downloadFile } from './downloadFile';
import { AudioFormatEnum } from '../constant';
import type { Option, DownFileMessage, RequestHeaderType } from '../types';

/**
 * 下载单个视频链接
 * @param {Option} options 下载选项
 * @param {string} url 视频链接
 * @param {RequestHeaderType} headers 请求头
 * @returns {Promise<DownFileMessage>} 返回文件路径信息
 */
export async function downloadOne(options: Option, url: string, headers: RequestHeaderType): Promise<DownFileMessage> {
  const transform = Object.values(AudioFormatEnum).includes(options.format as AudioFormatEnum);

  const config: AxiosRequestConfig<Readable> = {
    headers,
    maxRedirects: 5,
    validateStatus: (status: number) => status >= 200 && status < 300,
    responseType: 'stream',
  };

  const response: AxiosResponse<Readable> = await axios.get<Readable>(url, config);
  return downloadFile(response, options, transform);
}
