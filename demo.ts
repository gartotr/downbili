import { downBili } from "./src";

const url = 'https://www.bilibili.com/video/BV1hj411x7pm/?spm_id_from=333.1073.sub_channel.dynamic_video.click';

const main = async () => {
  await downBili({ url });
};

main();
