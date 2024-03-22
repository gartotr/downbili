import fs from "fs";
import path from "path";

/**
 * 判断是不是 Object
 * @param {unknown} o
 * @returns boolean
 */
export function isObject(o: unknown) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

/**
 * 判断是不是 Array
 * @param {unknown} o
 * @returns boolean
 */
export function isArray(o: unknown) {
  return Array.isArray(o);
}

/**
 * 判断是不是 string
 * @param {unknown} o
 * @returns boolean
 */
export function isString(o: unknown) {
  return typeof o === 'string';
}

/**
 * 要创建的文件夹的路径，这里的路径是相对于根目录的路径
 * @param {string} ul
 */
export function createfolder(ul: string) {
  if (!ul) {
    throw new Error('the param is not input!');
  }
  const folders = ul.split('/').filter(el => el);
  let root = process.cwd();
  for (let i = 0, len = folders.length; i < len; i++) {
    root = path.join(root, folders[i]);
    try {
      fs.statSync(root);
    } catch (err) {
      fs.mkdirSync(root);
    }
  }
}

/**
 * 判断是不是番剧的播放地址
 * @param {string} url
 * @returns {boolean}
 */
export function isEpurl(url: string): boolean {
  return /ep\d+/g.test(url);
}

/**
 * 判断是不是av的播放地址
 * @param {string} url
 * @returns {boolean}
 */
export function isAvurl(url: string): boolean {
  return /av\d+/g.test(url);
}

/**
 * 判断是不是md的播放地址
 * @param {string} url
 * @returns {boolean}
 */
export function isMdurl(url: string): boolean {
  return /md\d+/g.test(url);
}

export function printType(type: string, name?: string, folder?: string) {
  const dirName = folder ?? 'media';
  const dir = path.join(process.cwd(), dirName);
  console.log(`正在下载类型：${type} 名称：${name ?? ''}，位于${dir}`);
}

/**
 * 获取QueryString
 * @param {string} url url地址
 * @param {string} getValue 要获取的参数
 */
export function getQueryString( url: string, getValue: string) {
  const newUrl = new URL(url);
  return new URLSearchParams(newUrl.search).get(getValue)
}