# downBili

B 站 URL 下载视频

严重警告：不可以将获取的资源用于恶意用途

## Installing

包管理

Using pnpm:

```bash
pnpm install downbili
```

Using npm:

```bash
npm install downbili
```

Using yarn:

```bash
yarn add downbili
```

## Get started

### downBili

```ts
import { downBili } from 'downbili';
```

`option`

| **参数**   | **描述**                                                        |
| ---------- | --------------------------------------------------------------- |
| url        | 视频 URL                                                        |
| level      | 112 是 1080P+，80 是 1080P，64 是 720P+，32 是 480P，16 是 360P |
| sessdata   | 你的 sessdata                                                   |
| name       | 文件名称（自己获取）                                            |
| type       | 视频类型                                                        |
| fileName   | 文件名称                                                        |
| folder     | folder                                                          |
| onComplete | 执行成功的回调                                                  |
| format     | 转成音频的格式                                                  |

`result`

| **参数**  | **描述**            |
| --------- | ------------------- |
| fPath     | 视频路径            |
| cwd       | 当前文件的目录      |
| name      | 视频名称            |
| mediaPath | 带 media 文件夹路径 |

### 仅下载视频

默认下载到当前目录`/media`下

```ts
import { downBili, Option, AudioFormatEnum } from 'downbili';

const main = () => {
  const opt: Option = {
    // 下载地址
    url: 'https://www.bilibili.com/video/xxx',
    level: 80,
    // 大会员使用 提高下载视频质量
    sessdata: '',
  };
  downBili(opt);
};

main();
```

### 支持视频转成音频

```ts
import { downBili, Option, AudioFormatEnum } from 'downbili';

const main = () => {
  const opt: Option = {
    // 传入format
    format: AudioFormatEnum.WAV,
    url: 'https://www.bilibili.com/video/xxx',
    sessdata: '',
  };
  downBili(opt);
};

main();
```
