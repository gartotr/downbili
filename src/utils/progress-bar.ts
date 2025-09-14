import slog from 'single-line-log';

interface ProgressBarOptions {
  completed: number;
  total: number;
}

/** 进度条类
 * @description 在控制台显示下载进度
 * @param {string} description - 进度条描述
 * @param {number} bar_length - 进度条长度
 * @example
 * const progressBar = new ProgressBar('Downloading', 30);
 * progressBar.render({ completed: 50, total: 100 });
 * 输出: Downloading: 50.00% ⸨█████████████░░░░░░░░░░░░░░░░░⸩ 50/100
 */
export class ProgressBar {
  // 进度条描述
  description: string;
  // 进度条长度
  length: number;

  constructor(description: string = 'Progress', bar_length: number = 25) {
    this.description = description;
    this.length = bar_length;
  }

  render(opts: ProgressBarOptions) {
    const percent = Number((opts.completed / opts.total).toFixed(4));
    const cell_num = Math.floor(percent * this.length);

    const cell = '█'.repeat(cell_num);
    const empty = '░'.repeat(this.length - cell_num);

    // 将字节转换为MB格式
    const completedMB = (opts.completed / 1024 / 1024).toFixed(2);
    const totalMB = (opts.total / 1024 / 1024).toFixed(2);

    const cmdText = `${this.description}: ${(100 * percent).toFixed(2)}% ⸨${cell}${empty}⸩ ${completedMB}MB/${totalMB}MB`;
    slog.stdout(cmdText);
  }
}

export default ProgressBar;
