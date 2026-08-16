import axios from 'axios';
import * as cheerio from 'cheerio';
import { getVideoMessageByAid, initialUrl } from './api';
import { ArticulationEnum } from '../constant';
import type { ArcObject, DownLinkResult } from '../types';

/**
 * 解析script内容获取arc字段
 * @param {url} url 视频的播放地址
 * @returns
 */
export async function parseScript(url: string): Promise<ArcObject> {
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);

  let scriptContent = '';

  // 查找包含 playurlSSRData 的 script 标签
  $('script').each((_, el) => {
    const text = $(el).text();
    if (text.includes('playurlSSRData')) {
      scriptContent = text;
      return;
    }
  });
  const scriptMatch = extractArcFields(scriptContent);
  if (!scriptMatch) {
    throw new Error('Failed to extract arc.');
  }
  return JSON.parse(scriptMatch);
}

/**
 * 正则匹配 arc:{...}
 * @param {string} scriptContent script内容
 * @returns
 */
export function extractArcFields(scriptContent: string): string | null {
  const arcRegex = /"arc"\s*:\s*(\{[^}]+\})/;
  const match = scriptContent.match(arcRegex);
  return match ? match[1] : null;
}

/**
 * 获取番剧下载地址
 * @param {string} url 视频的播放地址
 * @param {ArticulationEnum} level
 * @returns {DownLinkResult} 包含链接、标题信息
 */
export const getBangumiLink = async (url: string, level: ArticulationEnum): Promise<DownLinkResult> => {
  const { aid, cid } = await parseScript(url);
  const videoMessage = await getVideoMessageByAid(aid);
  const ul = initialUrl(aid, cid, level);
  return {
    title: videoMessage.data.title,
    links: ul,
  };
};
