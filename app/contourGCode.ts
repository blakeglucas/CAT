import path from 'path';
import { spawnSync } from 'child_process';

export async function contourGCode(
  gCode: string,
  heightMap: number[][],
  targetZdepth: number
) {
  console.log('cgc fn')
  try {
    return await new Promise<string>((resolve, reject) => {
      const contourPayload = {
        gCode,
        heightMap,
        targetZdepth,
      };
      const child = spawnSync(
        `${path.join('venv', 'Scripts', 'python')} contourGCode.py`,
        { cwd: path.join(__dirname, 'py'), shell: true, input: JSON.stringify(contourPayload) }
      );
      if (child.stderr.length > 0) {
        console.log(child.stderr.toString())
      }
      resolve(child.stdout.toString())
    })
  } catch (e) {
    console.log(e);
  }
}
