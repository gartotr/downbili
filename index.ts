import downBili from './src';

const url = 'https://www.bilibili.com/video/BV1SY411q7hr?spm_id_from=333.1073.high_energy.content.click';

const main = async () => {
  const result = await downBili.downloadVideo({
    url,
  });
  console.log('[ result ] >', result);
};

main();
