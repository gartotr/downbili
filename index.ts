import { downBili } from './src';

const url = 'https://www.bilibili.com/video/BV1Yb4y1W7xa/?spm_id_from=333.337.search-card.all.click';

const main = async () => {
  const result = await downBili({
    url,
  });
  console.log('[ result ] >', result);
};

main();
