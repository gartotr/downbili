import { OutgoingHttpHeader } from 'http';
import { VideoTypeEnum, AudioFormatEnum } from '../constant';

/**
 * 请求配置
 */
export interface OptionsType {
  url: string;
  headers: NodeJS.Dict<OutgoingHttpHeader>;
}

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
 * 视频评论
 */
export interface IVideoComments {
  member: {
    mid: string;
    uname: string;
    sex: string;
    avatar: string;
  };
  content: {
    message: string;
  };
  ctime: string;
  like: number;
  replies: IVideoComments[];
}

/**
 * 视频评论格式化
 */
export interface ICommentsFormat {
  mid: string;
  uname: string;
  sex: string;
  avatar: string;
  message: string;
  ctime: string;
  like: number;
  replies: any;
}

/**
 * 视频评论格式化剔除replies
 */
export type ICommentsFormatOmit = Omit<ICommentsFormat, 'replies'>;

/**
 * 下载视频配置
 */
export interface IDownloadOption {
  name: string;
  type?: keyof typeof VideoTypeEnum;
  folder?: string;
  onComplete?: () => void;
}

/**
 * 进度条配置
 */
export interface ProgressOptions {
  labelname?: string;
  length?: number;
}

/**
 * 视频信息
 */
export interface VideoInfo {
  aid: number;
  tid: number;
  tname: string;
  pic: string;
  title: string;
  desc: string;
  url: string;
  name: string;
  mid: number;
  face: string;
  cid: number;
  like: number;
  dislike: number;
  pages: {
    cid: number;
    page: number;
  }[];
  redirect_url: string;
}

/**
 * 视频信息消息
 */
export interface VideoMessage {
  aid: number;
  tid: number;
  tname: string;
  pic: string;
  title: string;
  desc: string;
  redirect_url: string;
  owner: {
    name: string;
    mid: number;
    face: string;
  };
  cid: number;
  stat: {
    like: number;
    dislike: number;
  };
  pages: {
    cid: number;
    page: number;
  }[];
}

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
  level?: number;
  /**
   * sessdata sessdata后的一大串
   */
  sessdata?: string;
  /**
   * 默认名称（自己获取）
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
   * 转音频必传
   */
  format?: AudioFormatEnum;
}

export type OmitUrlOption = Omit<Option, 'url'>;

/**
 * 格式转换设置
 */
export interface FormatDefaultType {
  /**
   * 格式 默认wav
   */
  format?: string;
  /**
   * 报错后回调
   */
  errorCallback?: () => void;
  /**
   * 成功回调
   */
  successCallback?: () => void;
  /**
   * 导出文件名
   */
  fileName?: string;
  /**
   * 文件路径
   */
  filePath?: string;
  /**
   * 是否删除原视频 默认true
   */
  deleteSourceMedia?: boolean;
  /**
   * 视频url
   */
  url: string;
}
