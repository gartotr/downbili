import { downBili } from "./src";

const url = 'https://www.bilibili.com/video/BV1zz4y1P78C/?spm_id_from=333.1007.tianma.1-1-1.click';

const main = async () => {
  await downBili({ url });
};

main();
