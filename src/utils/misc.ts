/**
 * 打印日志到控制台
 * @param {string} type 文件类型
 * @param {string} name 文件名称
 * @param {string} folder 文件夹
 */
export function printType(type: string, name?: string, folder?: string) {
  console.log(`Downloading: ${type} name: ${name ?? ''} output: ${folder}`);
}
