import { VideoTypeEnum, AudioFormatEnum, ArticulationEnum } from '../constant';

/**
 * 请求头参数
 */
export interface RequestHeaderType {
  [key: string]: string;
}

/**
 * 字符串类型
 */
export type OrString = string | string[];

/**
 * 视频下载配置
 */
export interface Option {
  /**
   * 视频URL
   */
  url: string;
  /**
   * 112是1080P+，80是1080P，64是720P+，32是480P，16是360P
   */
  level?: ArticulationEnum;
  /**
   * sessdata sessdata后的一大串
   */
  sessdata?: string;
  /**
   * 默认视频标题（自己获取）
   */
  defaultName?: string;
  /**
   * 文件名称（自己获取）
   */
  name?: string;
  /**
   * type
   */
  type?: keyof typeof VideoTypeEnum;
  /**
   * file名称
   */
  fileName?: string;
  /**
   * 导出到当前目录下的文件夹名称
   */
  folder?: string;
  /**
   * 导出的文件夹路径
   */
  output?: string;
  /**
   * 执行成功的回调
   */
  onComplete?: () => void;
  /**
   * 执行失败的回调
   */
  onError?: () => void;
  /**
   * 转音频必传
   */
  format?: AudioFormatEnum;
}

export interface DownLinkResult {
  links: string | string[];
  title: string;
}

/**
 * arc对象，包含aid cid bvid
 */
export interface ArcObject {
  aid: number;
  cid: number;
  bvid: string;
}

/**
 * 文件路径信息
 */
export interface DownFileMessage {
  /**
   * 文件路径
   */
  fPath: string;
  /**
   * 当前目录
   */
  cwd: string;
  /**
   * 文件名称
   */
  name: string;
  /**
   * 带media文件夹路径
   */
  mediaPath: string;
}
