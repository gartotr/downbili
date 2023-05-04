import { downBili } from './dist';

const url = 'https://www.bilibili.com/video/BV1Wk4y1v7Sd/?spm_id_from=333.1007.tianma.1-1-1.click&vd_source=b913fad6df7625454c51e2a2e9e72333';

const main = async () => {
  await downBili({
    url,
  });
};

main();
