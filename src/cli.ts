import { Command } from 'commander';
import { downBili, ArticulationEnum, AudioFormatEnum } from './index';
import type { Option } from './index';

const LEVEL_MAP: Record<string, ArticulationEnum> = {
  '360': ArticulationEnum._16,
  '480': ArticulationEnum._480,
  '720': ArticulationEnum._720,
  '1080': ArticulationEnum._1080,
  '1080+': ArticulationEnum._1080PLUS,
};

/** 解析 --level 参数为 ArticulationEnum */
function parseLevel(value: string): ArticulationEnum {
  const mapped = LEVEL_MAP[value];
  if (!mapped) {
    throw new Error(`无效的级别: ${value}（可选: ${Object.keys(LEVEL_MAP).join('|')}）`);
  }
  return mapped;
}

/** 解析 --format 参数为 AudioFormatEnum */
function parseFormat(value: string): AudioFormatEnum {
  if (!Object.values(AudioFormatEnum).includes(value as AudioFormatEnum)) {
    throw new Error(`无效的音频格式: ${value}（可选: ${Object.values(AudioFormatEnum).join('|')}）`);
  }
  return value as AudioFormatEnum;
}

async function main(): Promise<void> {
  const program = new Command();
  program
    .name('downbili')
    .description('B 站视频下载工具')
    .argument('<链接>', 'bilibili 视频链接')
    .option('--sessdata <值>', '传入 sessdata，可提升清晰度（>720P 需大会员）')
    .option('--level <值>', `视频清晰度（可选: ${Object.keys(LEVEL_MAP).join('|')}，默认 360P / 有 sessdata 则 1080P+）`, parseLevel)
    .option('--format <类型>', `指定输出格式（可选: ${Object.values(AudioFormatEnum).join('|')}）`, parseFormat)
    .showHelpAfterError()
    .action(async (url: string, options: { sessdata?: string; level?: ArticulationEnum; format?: AudioFormatEnum }) => {
      const opt: Option = { url };
      if (options.sessdata) {
        opt.sessdata = options.sessdata;
      }
      if (options.level) {
        opt.level = options.level;
      }
      if (options.format) {
        opt.format = options.format;
      }
      const res = await downBili(opt);
      console.log('下载完成:', res);
    });

  await program.parseAsync();
}

main().catch((error: Error) => {
  console.error(error.message);
  process.exit(1);
});
