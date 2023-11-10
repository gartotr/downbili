/**
 * 公公接口返回
 */
export interface Response<T> {
  code: number;
  message: string;
  ttl: number;
  data: T;
}

/**
 * x/player/pagelist result
 */
export interface PlayerResponse {
  text: string;
}

export interface TextData {
  cid: number;
  page: number;
  from: string;
  part: string;
  duration: number;
  vid: string;
  weblink: string;
  dimension: {
    width: number;
    height: number;
    rotate: number;
  };
  first_frame: string;
}

export type PlayerTextObject = Response<TextData[]>;

/**
 * web-interface/view result
 */
export interface WebResponse {
  text: string;
}

export interface IOwner {
  mid: number;
  name: string;
  face: string;
}

export interface IStat {
  like: number;
  dislike: number;
}

export interface IPage {
  cid: number;
  page: number;
  from: string;
  part: string;
  duration: number;
  vid: string;
  weblink: string;
  first_frame: string;
}

export interface WebData {
  bvid: string;
  aid: number;
  videos: number;
  tid: number;
  tname: string;
  copyright: number;
  pic: string;
  title: string;
  pubdate: number;
  ctime: number;
  desc: string;
  desc_v2?: any;
  state: number;
  duration: number;
  mission_id: number;
  dynamic: string;
  cid: number;
  premiere?: any;
  teenage_mode: number;
  is_chargeable_season: boolean;
  is_story: boolean;
  no_cache: boolean;
  is_season_display: boolean;
  like_icon: string;
  need_jump_bv: boolean;
  redirect_url: string;
  owner: IOwner;
  stat: IStat;
  pages: IPage[];
}

export type WebTextObject = Response<WebData>;

export interface IWebInfo {
  aid: number;
  tname: string;
  tid: number;
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
  pages: IPage[];
  redirect_url: string;
}

export interface Durl {
  /**
   * 不知道
   */
  order: number;
  /**
   * 视频时长（毫秒）
   */
  length: number;
  /**
   * 视频大小
   */
  size: number;
  /**
   * 不知道
   */
  ahead: string;
  /**
   * 不知道
   */
  vhead: string;
  url: string;
  backup_url: string[];
}

export interface SupportFormat {
  quality: number;
  format: string;
  new_description: string;
  display_desc: string;
  superscript: string;
  codecs?: any;
}

export interface DownloadInfo {
  from: string;
  result: string;
  message: string;
  quality: number;
  format: string;
  timelength: number;
  accept_format: string;
  accept_description: string[];
  accept_quality: number[];
  video_codecid: number;
  seek_param: string;
  seek_type: string;
  durl: Durl[];
  support_formats: SupportFormat[];
  high_format?: any;
  last_play_time: number;
  last_play_cid: number;
}

/**
 * 下载对象
 */
export type DownloadObject = Response<DownloadInfo> & { result: { dash: any } };

/**
 * httpGet返回
 */
export interface httpGetResponseType {
  headers: Object;
  pipe: Function;
  on: Function;
}

/**
 * websect.get返回
 */
export interface DownLoadRequestResult {
  text: string;
}

/**
 * 下载完成后返回信息
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
}
