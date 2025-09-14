import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { createRequire } from 'module';
import type { OrString } from '../types';

const require = createRequire(import.meta.url || __filename);
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

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
    throw new Error('The param is not input!');
  }
  // 判断是否为绝对路径
  let root = path.isAbsolute(ul) ? path.resolve(ul.split('/').join(path.sep)) : process.cwd();
  const folders = path.isAbsolute(ul) ? [] : ul.split('/').filter(el => el);
  for (let i = 0, len = folders.length; i < len; i++) {
    root = path.join(root, folders[i]);
    try {
      fs.statSync(root);
    } catch (err) {
      fs.mkdirSync(root);
    }
  }
  // 如果是绝对路径且不存在，则创建
  if (path.isAbsolute(ul)) {
    try {
      fs.statSync(root);
    } catch (err) {
      fs.mkdirSync(root, { recursive: true });
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

/**
 * 打印日志到控制台
 * @param {string | null} type 文件类型
 * @param {string | null} name 文件名称
 * @param {string | null} folder 文件夹
 */
export function printType(type: string, name?: string, folder?: string) {
  console.log(`Downloading: ${type} name: ${name ?? ''} output: ${folder}`);
}

/**
 * 获取QueryString
 * @param {string} url url地址
 * @param {string} getValue 要获取的参数
 * @returns string | null
 */
export function getQueryString(url: string, getValue: string) {
  const newUrl = new URL(url);
  return new URLSearchParams(newUrl.search).get(getValue);
}

/**
 * 根据信息返回最终下载地址
 * @param {string} url 视频播放地址
 * @param {OrString} addr 视频下载地址
 * @returns {string} 最终下载地址
 */
export function withSelectedAddress(url: string, addr: OrString): string {
  if (Array.isArray(addr)) {
    const indexParam = getQueryString(url, 'p');
    if (indexParam !== null) {
      const index = parseInt(indexParam, 10);
      addr = addr[index - 1];
    } else {
      addr = addr[0];
    }
  }
  return addr;
}

/**
 * ffmpeg路径
 */
export const ffmpegPath = ffmpegInstaller.path;

/**
 * 设置ffmpeg路径
 */
export function setFfmpegPath() {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

/**
 * 返回目录下不冲突的唯一文件路径。如果存在相同文件，会在文件名后添加 (n) 形式的后缀。
 * 例如: 1.mp4 -> 1(1).mp4 -> 1(2).mp4
 * @param {string} dir - 输出目录
 * @param {string} filename - 原始文件名（含扩展名）
 * @returns {string} 不冲突的完整文件路径
 */
export function getUniqueFilePath(dir: string, filename: string): string {
  if (!filename) return path.join(dir, filename);

  const parsed = path.parse(filename);
  let name = parsed.name;
  const ext = parsed.ext || '';

  let full = path.join(dir, name + ext);
  if (!fs.existsSync(full)) return full;

  const match = name.match(/^(.*)\((\d+)\)$/);
  const root = match ? match[1] : name;

  for (let i = 1; ; i++) {
    const candidate = `${root}(${i})${ext}`;
    const candidateFull = path.join(dir, candidate);
    if (!fs.existsSync(candidateFull)) return candidateFull;
  }
}