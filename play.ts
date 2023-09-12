import { downBili } from "./src/main";
const url =
  "https://www.bilibili.com/video/BV17u411w7cF/?spm_id_from=333.1073.high_energy.content.click";
const main = async () => {
  const res = await downBili({
    url,
  });
  console.log("[ res ] >", res);
};
main();
