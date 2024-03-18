# downBili

B站URL下载视频

严重警告：不可以将获取的资源用于恶意用途

## Get started

`option`

| **参数**       | **描述**                                       |
|--------------|----------------------------------------------|
| url          | 视频URL                                        |
| level        | 112是1080P+，80是1080P，64是720P+，32是480P，16是360P |
| sessdata     | 你的sessdata                                   |
| name         | 名称                                           |
| type         | 视频类型                                         |
| fileName     | 文件名称                                         |
| folder       | folder                                       |
| onComplete   | 执行成功的回调                                      |

`result`

| **参数** | **描述**  |
|--------|---------|
| fPath  | 视频路径    |
| cwd    | 当前文件的目录 |
| name   | 视频名称    |

## 使用案例

### 仅下载视频

默认下载到当前目录`/media`下

```ts
import { downBili } from 'downBili';

// 输入对应URL
const option = {
  url: "xxx",
  fileName: "指定文件名",
  onComplete: () => {
    console.log("下载成功！")
  }
};

const main = async () => {
  await downBili(option);
};

main();
```

### 有大会员 请传入session 默认下载1080P视频

```ts
import { downBili } from 'downBili';

// 输入对应URL
const option = {
  url: "xxx",
  sessdata: "xxx"
};

const main = async () => {
  await downBili(option);
};

main();
```


### 使用ffmpeg转换成音频

先下载[ffmpeg](https://ffmpeg.org/download.html)

```ts
import { formatDownFile } from 'downBili';

const url = 'xxx';

const main = async () => {
  await formatDownFile(url);
};

main();
```