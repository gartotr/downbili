/**
 * 代理
 */
export const UserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.1 Safari/605.1.15';

/**
 * api域名
 */
export const PREFIX = 'https://api.bilibili.com';

/**
 * 视频下载链接信息接口
 */
export const PLAYURL_API = `${PREFIX}/x/player/playurl`;

/**
 * 视频信息对象接口
 */
export const WEB_INTERFACE_API = `${PREFIX}/x/web-interface/view`;

/**
 * 页面列表接口
 */
export const PAGE_LIST_API = `${PREFIX}/x/player/pagelist`;

/**
 * 默认转换格式
 */
export const DEFAULT_CONVERTER = "wav"

/**
 * 视频清晰度
 */
export enum ArticulationEnum {
  /**
   * 1080P+
   */
  _1080PLUS = 112,
  /**
   * 1080P
   */
  _1080 = 80,
  /**
   * 720P
   */
  _720 = 64,
  /**
   * 480P
   */
  _480 = 32,
  /**
   * 360P
   */
  _16 = 360,
}

/**
 * 视频类型
 */
export enum VideoTypeEnum {
  /**
   * 无声视频
   */
  silent = 'silent',
  /**
   * 音频
   */
  audio = 'audio',
  /**
   * 默认
   */
  default = 'default',
}
