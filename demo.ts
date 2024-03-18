import { formatDownFile } from './src';

const url = 'https://www.bilibili.com/video/BV1kz421Q7kp/?spm_id_from=333.1073.high_energy.content.click';

const main = async () => {
  await formatDownFile(url,{deleteSourceMedia:false});
};

main();
