import { OutgoingHttpHeader } from 'http';
import { VideoTypeEnum } from '../constant';

export interface OptionsType {
  url: string;
  headers: NodeJS.Dict<OutgoingHttpHeader>;
}

export interface RequestHeaderType {
  [key: string]: string;
}

export type OrString = string | string[];

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

export type ICommentsFormatOmit = Omit<ICommentsFormat, 'replies'>;

export interface IDownloadOption {
  name: string;
  type?: keyof typeof VideoTypeEnum;
  folder?: string;
  onComplete?: () => void;
}

export interface ProgressOptions {
  labelname?: string;
  length?: number;
}

export interface DanmuResponse {
  order: number;
  date: string;
  time: number;
  text: string;
}

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
   * folder
   */
  folder?: string;
  /**
   * 执行成功的回调
   */
  onComplete?: () => void;
}

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
}
