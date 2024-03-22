import slog from "single-line-log";

interface ProgressBarOptions {
  completed: number;
  total: number;
}

class ProgressBar {
  description: string;
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

    const cmdText = `${this.description}: ${(100 * percent).toFixed(2)}% ⸨${cell}${empty}⸩ ${opts.completed}/${opts.total}`;
    slog.stdout(cmdText);
  }
}

export default ProgressBar;
