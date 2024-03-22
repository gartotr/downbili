import axios from "axios";
import path from "path";

import * as deal from "./deal";
import type {
  Option,
  OrString,
  RequestHeaderType,
  DownloadObject,
  Durl,
  DownLoadRequestResult,
  DownFileMessage
} from "../types";
import { VideoTypeEnum } from "../constant";
import { getQueryString } from "./index";


/**
 * 输入链接下载视频
 * @param {Option} opt 视频下载配置
 * @param {RequestHeaderType} options http请求头
 * @param {OrString} addr B站视频下载地址
 * @param {OrString} videoUrl 视频url
 * @returns {Promise<DownFileMessage>} 下载完成后返回信息
 */
export async function dealLink(opt: Option, options: RequestHeaderType, addr: OrString, videoUrl: OrString): Promise<DownFileMessage> {
  return new Promise(async resolve => {
    if (Array.isArray(addr)) {
      const qs = getQueryString(opt.url, "p");
      addr = qs ? qs : addr[0]
    }

    const res: DownloadObject = await axios.get(addr, {headers: options});

    if (res.code === -404 && res.message !== "success") {
      if (opt.type && opt.type !== VideoTypeEnum.default) {
        throw new Error(`请对应url视频类型`);
      } else {
        throw new Error("请传入sessdata!！");
      }
    }

    const data: DownLoadRequestResult = res.data;

    let durl: Durl[] = [];
    if (!opt.type || opt.type === VideoTypeEnum.default) {
      durl = data.data.durl;
    }

    if (durl.length > 1) {
      for (let i = 0; i < durl.length; i++) {
        const ul = durl[i].url;
        const match = ul.match(/\/([^\/]+?)\?/) || [];
        opt.defaultName = match[1].trim();
        const fileName = opt.fileName;
        let ext: string = path.parse(opt.defaultName).ext;
        if (ext === ".m4s" && opt.type === VideoTypeEnum.silent) {
          ext = ".mp4";
          opt.defaultName = path.parse(opt.defaultName).name + ext;
        }
        if (ext === ".m4s" && opt.type === VideoTypeEnum.audio) {
          ext = ".mp3";
          opt.defaultName = path.parse(opt.defaultName).name + ext;
        }
        opt.name = (fileName && fileName + ext) || opt.defaultName;
        await deal.downloadOne(opt, ul, videoUrl);
      }
    } else {
      const ul = durl[0].url;
      const match = ul.match(/\/([^\/]+?)\?/) || [];
      opt.defaultName = match[1].trim();
      const fileName = opt.fileName;
      // 解析文件后缀名称
      let ext = path.parse(opt.defaultName).ext;

      if (ext === ".m4s" && opt.type === VideoTypeEnum.silent) {
        ext = ".mp4";
        opt.defaultName = path.parse(opt.defaultName).name + ext;
      }

      if (ext === ".m4s" && opt.type === VideoTypeEnum.audio) {
        ext = ".mp3";
        opt.defaultName = path.parse(opt.defaultName).name + ext;
      }

      opt.name = (fileName && fileName + ext) || opt.defaultName;

      const result = await deal.downloadOne(opt, ul, videoUrl);
      resolve(result);
    }
  });
}
