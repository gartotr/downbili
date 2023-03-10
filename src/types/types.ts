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
  oncomplete?: () => void;
}

export interface ProgressOptions {
  labelname?: string;
  length?: number;
}

export interface DeallinkOptions {
  type?: 'silent' | 'audio' | 'default';
  level?: number;
  filename?: string;
  download_backup?: boolean;
  default_name: string;
  url: string;
  name: string;
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
   * 默认名称
   */
  default_name?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * type
   */
  type?: keyof typeof VideoTypeEnum;
  /**
   * file名称
   */
  filename?: string;
  /**
   * folder
   */
  folder?: string;
  /**
   * 执行成功的回调
   */
  oncomplete?: () => void;
}
