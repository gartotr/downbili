# downbili

B 站视频下载库（npm 包）。TypeScript + Rollup 双格式构建（cjs/esm），ffmpeg 内置。包管理器为 **pnpm**。

## 命令

- 安装依赖：`pnpm install`（勿用 npm/yarn，仓库有 `pnpm-lock.yaml`）
- 完整构建：`pnpm build`（先 `rimraf dist`，再 rollup 打包 `dist/cjs`+`dist/esm`，再 tsc 出 `dist/types`）

## 没有测试

仓库无任何测试框架或测试脚本。改代码后跑 `pnpm build` 做类型/构建检查（demo.ts 为本地自测用，不入库）。

## 构建注意（易踩坑）

- tsconfig 开了 `strict` + `noUnusedLocals` + `noUnusedParameters`，`pnpm build:types`（tsc）会对未使用变量/参数报错，注意删干净。
- TypeScript 为 **4.9.5**（旧版），勿用新版本语法。
- `global.d.ts` 声明了 `module '*'`，会吞掉"找不到模块"的错误；新增依赖时不要依赖编译器兜底。

## 架构与约定

- 入口 `src/index.ts`：模块加载时即执行 `setFfmpegPath()`（ffmpeg 由 `@ffmpeg-installer/ffmpeg` 提供）。
- 公开 API 全部经 `src/exports.ts` 桶文件导出；`src/utils/` 新增文件需在 `src/utils/index.ts` 与 `src/exports.ts` 同时注册。
- 主流程：`downBili` → `getVideoDownLinkByurl`（番剧走 cheerio 解析页面 script 中 `arc` 字段，普通视频走 bvid/av 接口）→ `dealLink` → `downloadOne` → `downloadFile`。
- `helper.ts` 用 `createRequire(import.meta.url || __filename)` 兼容 cjs/esm 双构建，新代码沿用此模式，勿直接 `require`。
- 默认输出到 cwd 下 `./media`；重名文件自动加 `(n)` 后缀（`getUniqueFilePath`）。
- `ArticulationEnum`：112=1080P+、80=1080P、64=720P、32=480P（实为 360P）、16=360P。无 `sessdata` 时默认 16；有则默认 112；>720 需大会员。
- `dealLink` 遇 code `-404` 会抛 "Please pass in sessdata!!"（未登录且无会员）。

## 风格

- 注释、README、commit message 均为中文；注释用 JSDoc 风格。
- Prettier：singleQuote、semi、trailingComma es5、printWidth 150、arrowParens avoid；格式化用 `npx prettier --write`。

## 其他

- `dist/` 已在 `.gitignore` 中；npm 发布排除项在 `.npmignore`（src/、tsconfig.json、rollup.config.js）。
