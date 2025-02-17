import { get, RequestOptions, IncomingMessage } from 'http';
import { get as _get } from 'https'
import { parse } from 'url'
import type { OptionsType, httpGetResponseType } from '../types';

/**
 * 解决重定向的问题
 * @param {IncomingMessage} res
 * @param {OptionsType} opt
 * @returns
 */
export const _redirect = (res: IncomingMessage, opt: OptionsType): Promise<httpGetResponseType | IncomingMessage> => {
  let reurl = res.headers.location;
  if (reurl) {
    opt.url = reurl;
    return new Promise((resolve, _reject) => {
      httpGet(opt).then((result: any) => {
        resolve(_redirect(result, opt));
      });
    });
  }
  return Promise.resolve(res);
};

/**
 * 请求下载
 * @param {OptionsType} opt
 * @returns
 */
export const httpGet = (opt: OptionsType): Promise<httpGetResponseType> => {
  let options: RequestOptions = {};
  let ul: string = '';
  let protocol: string | null = '';
  if (typeof opt === 'object') {
    options.headers = opt.headers;
    ul = opt.url;
    options.path = parse(ul).path;
    options.host = parse(ul).host;
  }

  protocol = parse(ul).protocol;
  return new Promise((resolve, _reject) => {
    if (protocol === 'http:') {
      get(ul, options, res => {
        resolve(_redirect(res, opt));
      });
    }
    if (protocol === 'https:') {
      _get(ul, options, res => {
        resolve(_redirect(res, opt));
      });
    }
  });
};
