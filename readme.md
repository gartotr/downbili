# downBili

B 站 URL 下载视频

严重警告：不可以将获取的资源用于恶意用途

## Get started

`option`

| **参数**   | **描述**                                                        |
| ---------- | --------------------------------------------------------------- |
| url        | 视频 URL                                                        |
| level      | 112 是 1080P+，80 是 1080P，64 是 720P+，32 是 480P，16 是 360P |
| sessdata   | 你的 sessdata                                                   |
| name       | 名称                                                            |
| type       | 视频类型                                                        |
| fileName   | 文件名称                                                        |
| folder     | folder                                                          |
| onComplete | 执行成功的回调                                                  |

`result`

| **参数** | **描述**       |
| -------- | -------------- |
| fPath    | 视频路径       |
| cwd      | 当前文件的目录 |
| name     | 视频名称       |

## 使用案例

### 仅下载视频

默认下载到当前目录`/media`下

```ts
import { downBili } from 'downBili';

// 输入对应URL
const option = {
  url: 'xxx',
  fileName: '指定文件名',
  onComplete: () => {
    console.log('下载成功！');
  },
};

const main = async () => {
  await downBili(option);
};

main();
```

### 有大会员 请传入 session 默认下载 1080P 视频

```ts
import { downBili } from 'downBili';

// 输入对应URL
const option = {
  url: 'xxx',
  sessdata: 'xxx',
};

const main = async () => {
  await downBili(option);
};

main();
```

### 使用 ffmpeg 转换成音频

基于 ffmepg 实现，请先下载[ffmpeg](https://ffmpeg.org/download.html)

#### 下载单个转音频

```ts
// downloadSingleToAudio下载
import { downloadSingleToAudio } from 'downBili';

// 要转换的B站视频url
const option = {
  url: 'xxx',
};

const main = async () => {
  await downloadSingleToAudio(option);
};

main();
```

#### 下载多个转音频

```ts
// videoToAudioConverter下载
import { videoToAudioConverter } from 'downBili';

// 要转换的B站视频url
const option = [
  {
    url: 'xxx',
    fileName: '指定文件名',
  },
  {
    url: 'xxx',
    fileName: '指定文件名2',
  }
]

const main = async () => {
  await videoToAudioConverter(option);
};

main();
```

**可选传入配置**

```ts
const downloadiSngleToAudio: (FormatDefaultType) => Promise<void>;

interface FormatDefaultType {
  /**
   * 格式 默认wav
   */
  format?: string;
  /**
   * 报错后回调
   */
  errorCallback?: () => void;
  /**
   * 成功回调
   */
  successCallback?: () => void;
  /**
   * 导出文件名
   */
  fileName?: string;
  /**
   * 文件路径
   */
  filePath?: string;
  /**
   * 是否删除原视频 默认true
   */
  deleteSourceMedia?: boolean;
  /**
   * 视频url
   */
  url: string
}
```

