# downbili

一个 TypeScript / Node.js 编写的 B 站视频下载库，可以下载视频，可以把视频转换成音频。

有时候你想下载的不是视频，只是视频里的那首歌，重新定义一下 B 站：

> 视频网站 ❌
> 音乐网站 ✅

理论上只要 B 站上有视频，你就可以把它变成 MP3、AAC、WAV、FLAC……

> **仅供交流学习使用。** 请勿将下载的资源用于任何恶意用途或商业目的。

## 特性

- 链接下载视频
- 清晰度可选：360P ~ 1080P+（>720P 需登录）
- 内置 ffmpeg，可直接转音频（MP3 / AAC / WAV / FLAC 等）
- 提供命令行工具 `downbili`

## 安装

```bash
# pnpm
pnpm install downbili

# npm
npm install downbili

# yarn
yarn add downbili
```

## 快速开始

### cli使用

```bash
# 视频
npx downbili 'https://www.bilibili.com/video/BVxxxxxxx'
# 音频
npx downbili 'https://www.bilibili.com/video/BVxxxxxxx' --format mp3
```

### 库使用

```ts
import { downBili } from 'downbili';

const result = await downBili('https://www.bilibili.com/video/BVxxxxxxx');
console.log(result);
// { fPath, cwd, name, mediaPath }
```

默认下载到当前目录下的 `media/` 文件夹。

## API

### downBili

```ts
async function downBili(option: Option): Promise<DownFileMessage>;
async function downBili(url: string, format?: AudioFormatEnum): Promise<DownFileMessage>;
```

`downBili` 支持两种调用方式：

1. 传入 `Option` 配置对象，完整控制下载行为；
2. 传入视频 URL 字符串，可附带 `format` 直接转音频。

> 注意：多分片视频的返回结果实际为 `DownFileMessage[]`（数组），请以运行时结果为准。

### Option 参数

| 参数         | 类型               | 说明                                     |
| ------------ | ------------------ | ---------------------------------------- |
| `url`        | `string`           | 视频链接（必填）                         |
| `level`      | `ArticulationEnum` | 视频清晰度，默认无 `sessdata` 为 360P    |
| `sessdata`   | `string`           | B 站登录 Cookie，可提升清晰度上限        |
| `type`       | `VideoTypeEnum`    | 视频类型：`silent` / `audio` / `default` |
| `fileName`   | `string`           | 输出文件名（不含扩展名）                 |
| `folder`     | `string`           | 输出目录，默认 `media`                   |
| `output`     | `string`           | 输出绝对路径（优先级高于 `folder`）      |
| `format`     | `AudioFormatEnum`  | 设置后下载并转为音频                     |
| `onComplete` | `() => void`       | 下载完成回调                             |
| `onError`    | `() => void`       | 下载失败回调                             |

### 返回值 DownFileMessage

| 参数        | 说明                     |
| ----------- | ------------------------ |
| `fPath`     | 下载完成后的文件路径     |
| `cwd`       | 运行时的 `process.cwd()` |
| `name`      | 文件名                   |
| `mediaPath` | 输出目录                 |

### 枚举

```ts
enum ArticulationEnum {
  _1080PLUS = 112, // 1080P+
  _1080 = 80, // 1080P
  _720 = 64, // 720P
  _480 = 32, // 360P
  _16 = 16, // 360P
}

enum AudioFormatEnum {
  MP3 = 'mp3',
  AAC = 'aac',
  WAV = 'wav',
  FLAC = 'flac',
  ALAC = 'alac',
  OGG = 'ogg',
  APE = 'ape',
  WMA = 'wma',
  M4A = 'm4a',
}

enum VideoTypeEnum {
  silent = 'silent', // 无声视频
  audio = 'audio', // 纯音频
  default = 'default',
}
```

## 使用示例

### 指定清晰度下载

```ts
import { downBili, ArticulationEnum, type Option } from 'downbili';

const opt: Option = {
  url: 'https://www.bilibili.com/video/BVxxxxxxx',
  level: ArticulationEnum._1080,
  sessdata: 'xxxxxxxx', // 大会员可下载更高清晰度
};

const result = await downBili(opt);
```

### 下载并转音频

```ts
import { downBili, AudioFormatEnum } from 'downbili';

// 方式一：配置对象
const result = await downBili({
  url: 'https://www.bilibili.com/video/BVxxxxxxx',
  format: AudioFormatEnum.MP3,
});

// 方式二：直接传 URL + 格式
await downBili('https://www.bilibili.com/video/BVxxxxxxx', AudioFormatEnum.WAV);
```

### 自定义输出目录

```ts
import path from 'path';
import { downBili, type Option } from 'downbili';

const opt: Option = {
  url: 'https://www.bilibili.com/video/BVxxxxxxx',
  output: path.join(process.cwd(), 'downloads'),
};
```

## 命令行

```bash
downbili <视频链接> [选项]
```

| 选项               | 说明                                     |
| ------------------ | ---------------------------------------- |
| `-h, --help`       | 显示帮助                                 |
| `--sessdata <值>`  | 传入 sessdata，提升清晰度上限            |
| `--level <清晰度>` | `360` / `480` / `720` / `1080` / `1080+` |
| `--format <格式>`  | 下载后转为音频，如 `mp3`、`aac`、`wav`   |

```bash
downbili 'https://www.bilibili.com/video/BVxxxxxxx' --level 1080 --sessdata xxxxxx
downbili 'https://www.bilibili.com/video/BVxxxxxxx' --format mp3
```

## 注意事项

- ffmpeg 已通过 `@ffmpeg-installer/ffmpeg` 内置，无需额外安装
- 未登录时最高下载 360P；无 `sessdata` 时默认 360P，有则默认 1080P+
- 高清资源（>720P）需要大会员账号
- 视频仅供学习交流使用，请遵守相关法律法规
