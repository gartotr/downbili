# downbili

B 站视频下载库（npm 包）。TypeScript + Rollup 双格式构建（cjs/esm），ffmpeg 内置。包管理器为 **pnpm**。

## 命令

- 安装依赖：`pnpm install`（勿用 npm/yarn，仓库有 `pnpm-lock.yaml`）
- 完整构建：`pnpm build`（先 `rimraf dist`，再 rollup 打包 `dist/cjs`+`dist/esm`+`dist/cli.js`，再 tsc 出 `dist/types`）

## 没有测试

仓库无任何测试框架或测试脚本。改代码后跑 `pnpm build` 做类型/构建检查；本地自测用 `pnpm tsx`（跑 demo.ts，该文件不入库）。

## 构建注意（易踩坑）

- tsconfig 开了 `strict` + `noUnusedLocals` + `noUnusedParameters`，`pnpm build:types`（tsc）会对未使用变量/参数报错，注意删干净。
- TypeScript 为 **5.9.3**（`package.json` 声明 `^5.9.3`）。
- `rollup.config.js`：`external` 用 `node:module` 的 `builtinModules` 全量覆盖 Node 内置模块，另手写 npm 依赖列表（axios/cheerio/fluent-ffmpeg/single-line-log/@ffmpeg-installer/ffmpeg）；新增运行时依赖若不想打进 bundle 需加进该数组。
- rpt2 插件已设 `declaration: false`：d.ts 只由 `pnpm build:types`（tsc）生成，构建产物以 tsc 输出的模块结构为准。勿重新启用 rpt2 的 declaration 或加回 `rollup-plugin-dts`（会重复生成且被 tsc 覆盖）。
- `global.d.ts` 声明了 `module '*'`，会吞掉"找不到模块"的错误；新增依赖时不要依赖编译器兜底。

## 架构与约定

- 入口 `src/index.ts`：模块加载时即执行 `setFfmpegPath()`（ffmpeg 由 `@ffmpeg-installer/ffmpeg` 提供）。
- 目录按领域划分：`core/`（下载主链路）、`bilibili/`（B 站 API 交互：url 解析/api 请求/番剧解析/链接解析）、`utils/`（纯工具）、`constant/`、`types/`。依赖方向单向：`core → bilibili/utils → constant/types`，禁止反向引用（避免循环依赖）。
- 公开 API 全部经 `src/exports.ts` 桶文件导出；`src/utils/`、`src/core/`、`src/bilibili/` 新增文件需在对应目录的 `index.ts` 桶与 `src/exports.ts` 同时注册。
- 主流程：`downBili`（`core/downBili.ts`）→ `getVideoDownLinkByurl`（`bilibili/resolveLink.ts`，番剧走 cheerio 解析页面 script 中 `arc` 字段，普通视频走 bvid/av 接口）→ `dealLink` → `downloadOne` → `downloadFile`。
- `utils/ffmpeg.ts` 用 `createRequire(import.meta.url || __filename)` 兼容 cjs/esm 双构建，新代码沿用此模式，勿直接 `require`。
- 默认输出到 cwd 下 `./media`；重名文件自动加 `(n)` 后缀（`getUniqueFilePath`）。
- `ArticulationEnum`：112=1080P+、80=1080P、64=720P、32=480P（实为 360P）、16=360P。无 `sessdata` 时默认 16；有则默认 112；>720 需大会员。
- `dealLink` 遇 code `-404` 会抛 "Please pass in sessdata!!"（未登录且无会员）。

## 风格

- 注释、README、commit message 均为中文；注释用 JSDoc 风格。
- Prettier：singleQuote、semi、trailingComma es5、printWidth 150、arrowParens avoid；格式化用 `npx prettier --write`。

## 其他

- `dist/` 已在 `.gitignore` 中；npm 发布排除项在 `.npmignore`（src/、tsconfig.json、rollup.config.js）。
