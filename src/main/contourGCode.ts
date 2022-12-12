import path from 'path';
import { spawnSync } from 'child_process';
import { ipcMain } from 'electron';

export async function contourGCode(
  gCode: string,
  targetZdepth: number,
  heightMap: number[][]
) {
  try {
    return await new Promise<string>((resolve, reject) => {
      const contourPayload = {
        gCode,
        heightMap,
        targetZdepth,
      };
      const child = spawnSync(
        `${path.join('venv', 'Scripts', 'python')} contourGCode.py`,
        {
          cwd: path.join(__dirname, 'py'),
          shell: true,
          input: JSON.stringify(contourPayload),
        }
      );
      if (child.stderr.length > 0) {
        console.log(child.stderr.toString());
      }
      if (child.stdout.length > 0) {
        console.log(child.stdout.toString());
      }
      resolve(child.stdout.toString());
    });
  } catch (e) {
    console.log(e);
  }
}
