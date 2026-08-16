import fs from 'fs';
import path from 'path';

/**
 * 要创建的文件夹的路径，这里的路径是相对于根目录的路径
 * @param {string} ul
 */
export function createfolder(ul: string) {
  if (!ul) {
    throw new Error('The param is not input!');
  }
  // 判断是否为绝对路径
  let root = path.isAbsolute(ul) ? path.resolve(ul.split('/').join(path.sep)) : process.cwd();
  const folders = path.isAbsolute(ul) ? [] : ul.split('/').filter(el => el);
  for (let i = 0, len = folders.length; i < len; i++) {
    root = path.join(root, folders[i]);
    try {
      fs.statSync(root);
    } catch (err) {
      fs.mkdirSync(root);
    }
  }
  // 如果是绝对路径且不存在，则创建
  if (path.isAbsolute(ul)) {
    try {
      fs.statSync(root);
    } catch (err) {
      fs.mkdirSync(root, { recursive: true });
    }
  }
}

/**
 * 返回目录下不冲突的唯一文件路径。如果存在相同文件，会在文件名后添加 (n) 形式的后缀。
 * 例如: 1.mp4 -> 1(1).mp4 -> 1(2).mp4
 * @param {string} dir - 输出目录
 * @param {string} filename - 原始文件名（含扩展名）
 * @returns {string} 不冲突的完整文件路径
 */
export function getUniqueFilePath(dir: string, filename: string): string {
  if (!filename) return path.join(dir, filename);

  const parsed = path.parse(filename);
  let name = parsed.name;
  const ext = parsed.ext || '';

  let full = path.join(dir, name + ext);
  if (!fs.existsSync(full)) return full;

  const match = name.match(/^(.*)\((\d+)\)$/);
  const root = match ? match[1] : name;

  for (let i = 1; ; i++) {
    const candidate = `${root}(${i})${ext}`;
    const candidateFull = path.join(dir, candidate);
    if (!fs.existsSync(candidateFull)) return candidateFull;
  }
}
