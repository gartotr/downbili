import ffmpeg from 'fluent-ffmpeg';
import { createRequire } from 'module';

const require = createRequire(import.meta.url || __filename);
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

/**
 * ffmpeg路径
 */
export const ffmpegPath = ffmpegInstaller.path;

/**
 * 设置ffmpeg路径
 */
export function setFfmpegPath() {
  ffmpeg.setFfmpegPath(ffmpegPath);
}
