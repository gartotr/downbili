import { OutgoingHttpHeader } from 'http';

export interface OptionsType {
  url: string;
  headers: NodeJS.Dict<OutgoingHttpHeader>;
}

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
  type?: 'default' | 'silent' | 'audio';
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

export interface Option {
  url: string | any;
  level?: number;
  sessdata?: any;
}
