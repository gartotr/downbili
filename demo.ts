import { downBili } from './src';

const url = 'https://www.bilibili.com/video/BV1pa4y1A7sv/?spm_id_from=333.1073.channel.secondary_floor_video.click';

const main = async () => {
  console.log('[ 123 ] >', 123)
  await downBili({
    url,
  });
};

main();
