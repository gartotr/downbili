import { downBili } from './src';

const url = 'https://www.bilibili.com/video/BV1wg411d7bc/?spm_id_from=333.1073.channel.secondary_floor_video.click';

const main = async () => {
  const result = await downBili({
    url,
  });
  console.log('[ result ] >', result);
};

main();
