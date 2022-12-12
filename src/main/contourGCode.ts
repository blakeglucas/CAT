import path from 'path';
import { spawnSync } from 'child_process';

export async function contourGCode(
  gCode: string,
  targetZdepth: number,
  heightMap: number[][]
) {
  try {
    return await new Promise<[string, string]>((resolve) => {
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
      resolve([child.stdout.toString(), child.stderr.toString()]);
    });
  } catch (e) {
    console.log(e);
  }
}
