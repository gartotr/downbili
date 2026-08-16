import { downBili, ArticulationEnum, AudioFormatEnum } from './index';
import type { Option } from './index';

const LEVEL_MAP: Record<string, ArticulationEnum> = {
  '360': ArticulationEnum._16,
  '480': ArticulationEnum._480,
  '720': ArticulationEnum._720,
  '1080': ArticulationEnum._1080,
  '1080+': ArticulationEnum._1080PLUS,
};

const HELP = `用法: downbili <bilibili 视频链接> [选项]

选项:
  -h, --help                         显示帮助
  --sessdata <值>                    传入 sessdata，可提升清晰度（>720P 需大会员）
  --level <360|480|720|1080|1080+>   视频清晰度，默认 360P（无 sessdata）/ 1080P+（有 sessdata）
  --format <mp3|aac|wav|flac|...>    同时转为音频

示例:
  downbili https://www.bilibili.com/video/BVxxxxxxxx
  downbili https://www.bilibili.com/video/BVxxxxxxxx --level 1080 --sessdata xxxxxx
  downbili https://www.bilibili.com/video/BVxxxxxxxx --format mp3
`;

interface CliArgs {
  url?: string;
  sessdata?: string;
  level?: ArticulationEnum;
  format?: AudioFormatEnum;
}

/** 解析命令行参数，返回 null 表示需要显示帮助 */
function parseArgs(argv: string[]): CliArgs | null {
  if (argv.length === 0 || argv.includes('-h') || argv.includes('--help')) {
    return null;
  }
  const args: CliArgs = {};
  const positionals: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--sessdata') {
      args.sessdata = argv[++i];
    } else if (arg === '--level') {
      const level = argv[++i];
      const mapped = LEVEL_MAP[level];
      if (!mapped) {
        throw new Error(`无效的 --level: ${level}（可选: ${Object.keys(LEVEL_MAP).join('|')}）`);
      }
      args.level = mapped;
    } else if (arg === '--format') {
      const format = argv[++i];
      if (!Object.values(AudioFormatEnum).includes(format as AudioFormatEnum)) {
        throw new Error(`无效的 --format: ${format}（可选: ${Object.values(AudioFormatEnum).join('|')}）`);
      }
      args.format = format as AudioFormatEnum;
    } else if (arg.startsWith('-')) {
      throw new Error(`未知选项: ${arg}`);
    } else {
      positionals.push(arg);
    }
  }
  if (positionals.length === 0) {
    throw new Error('缺少视频链接');
  }
  args.url = positionals[0];
  return args;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (!args) {
    console.log(HELP);
    return;
  }
  const opt: Option = { url: args.url as string };
  if (args.sessdata) {
    opt.sessdata = args.sessdata;
  }
  if (args.level) {
    opt.level = args.level;
  }
  if (args.format) {
    opt.format = args.format;
  }
  const res = await downBili(opt);
  console.log('下载完成:', res);
}

main().catch((error: Error) => {
  console.error(error.message);
  process.exit(1);
});
