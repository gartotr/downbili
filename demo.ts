import {FormatDefaultType} from './src/types/types';
import {videoToAudioConverterParallel} from "./src";

// const url = 'https://www.bilibili.com/video/BV1kz421Q7kp/?spm_id_from=333.1073.high_energy.content.click';
//
// const main = async () => {
//   await formatDownFile(url,{deleteSourceMedia:false});
// };
//
// main();

const opt: FormatDefaultType[] =
[
  {
    url: "https://www.bilibili.com/video/BV18J4m1874y/?spm_id_from=333.1073.high_energy.content.click",
    fileName: "治疗犬",
  },
  {
    url: "https://www.bilibili.com/video/BV1zS421K7FF/?spm_id_from=333.1073.channel.secondary_floor_video.click",
    fileName: "123的",
  },
]


const main = async () => {
  await videoToAudioConverterParallel(opt)
};

main()