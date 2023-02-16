import { get, RequestOptions, IncomingMessage } from 'http';
import type { OptionsType } from '../types/types';
const parse = require('url').parse
const _get = require('https').get

// 解决重定向的问题
export const _redirect = (res: IncomingMessage, opt: OptionsType) => {
  var reurl = res.headers.location;
  if (reurl) {
    opt.url = reurl;
    return new Promise((resolve, _reject) => {
      httpGet(opt).then((result: any) => {
        resolve(_redirect(result, opt));
      });
    });
  }
  return res;
};

/**
 * 请求下载
 * @param {OptionsType} opt
 * @returns
 */
export const httpGet = (opt: OptionsType) => {
  let options: RequestOptions = {};
  let ul: string = '';
  let protocol: string | null = '';
  if (typeof opt === 'object') {
    options.headers = opt.headers;
    ul = opt.url;
    options.path = parse(ul).path;
    options.host = parse(ul).host;
  }
  if (typeof opt === 'string') {
    ul = opt;
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
