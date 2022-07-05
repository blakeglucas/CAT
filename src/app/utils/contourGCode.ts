import { cloneDeep, mean } from 'lodash';
import { kdTree } from 'kd-tree-javascript';

export class GCodeLine {
  private _cmd = '';
  private _x: number | null = null;
  private _y: number | null = null;
  private _z: number | null = null;
  private _f: number | null = null;
  private readonly raw: string;

  constructor(raw: string) {
    this.raw = raw;
    const parts = raw.split(' ');
    this._cmd = parts[0];
    parts.slice(1).forEach((_part) => {
      // Ignore anything after a comment
      const part = _part.split(';')[0];
      switch (part[0].toUpperCase()) {
        case 'X':
          this._x = Number(part.substring(1));
          break;
        case 'Y':
          this._y = Number(part.substring(1));
          break;
        case 'Z':
          this._z = Number(part.substring(1));
          break;
        case 'F':
          this._f = Number(part.substring(1));
          break;
      }
    });
  }

  get cmd() {
    return this._cmd;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get z() {
    return this._z;
  }

  set z(val: number) {
    this._z = val;
  }

  get f() {
    return this._f;
  }

  repr() {
    const xStr = this._x ? ` X${this._x.toFixed(8)}` : '';
    const yStr = this._y ? ` Y${this._y.toFixed(8)}` : '';
    const zStr = this._z ? ` Z${this._z.toFixed(8)}` : '';
    const fStr = this._f ? ` F${this._f.toFixed(8)}` : '';
    return `${this._cmd}${xStr}${yStr}${zStr}${fStr}`;
  }
}

export class GCodeObject {
  rawGcodeOps: string[] = [];
  gcodeLines: GCodeLine[] = [];

  constructor(gcode: string) {
    this.rawGcodeOps = gcode
      .split('\n')
      .map((x) => x.trim())
      .filter((x) => {
        return x.length > 0 && !x.startsWith('(') && !x.startsWith(';');
      });
    this.gcodeLines = this.rawGcodeOps.map((x) => new GCodeLine(x));
  }
}

export function contourGCode(
  gCode: GCodeObject,
  heightMap: number[][],
  targetZDepth: number
) {
  function kdDistance(a: any, b: any) {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
  }
  const heightObjMap = heightMap.map((row) => ({
    x: row[0],
    y: row[1],
    z: row[2],
  }));
  const zdepth = targetZDepth < 0 ? targetZDepth : -1 * targetZDepth;
  const pointTree = new kdTree(heightObjMap, kdDistance, ['x', 'y']);
  const modifiedLines = gCode.gcodeLines.map((line) => {
    if (
      (line.cmd === 'G0' || line.cmd === 'G00') &&
      line.x === null &&
      line.y === null &&
      line.z >= 0
    ) {
      // Travel z setting, ignore
      return line;
    }
    // else if (
    //   (line.cmd === 'G1' || line.cmd === 'G01') &&
    //   line.x === null &&
    //   line.y === null &&
    //   line.z &&
    //   line.z < 0
    // ) {
    //   line.z = zdepth;
    //   return line;
    // }
    else if (
      ((line.cmd === 'G1' || line.cmd === 'G01') && line.x && line.y) ||
      ((line.cmd === 'G0' || line.cmd === 'G00') && line.x && line.y && !line.z)
    ) {
      const nearestNeighbors = pointTree.nearest([line.x, line.y, 0], 2);
      const [nn1, nn2] = nearestNeighbors.map((a) => a[0]);
      const [x1, y1, z1] = [nn1.x, nn1.y, nn1.z];
      const [x2, y2, z2] = [nn2.x, nn2.y, nn2.z];
      let z_x_interp = null;
      let z_y_interp = null;
      let target_z = zdepth;
      if (x2 !== x1) {
        z_x_interp = z1 + (line.x - x1) * ((z2 - z1) / (x2 - x1));
      }
      if (y2 != y1) {
        z_y_interp = z1 + (line.y - y1) * ((z2 - z1) / (y2 - y1));
      }
      if (!z_x_interp && !z_y_interp) {
        target_z += mean([z1, z2]);
      } else if (!z_x_interp) {
        target_z += z_y_interp;
      } else {
        target_z += z_x_interp;
      }
      line.z = target_z;
      if (line.cmd === 'G0' || line.cmd === 'G00') {
        const prevLine = new GCodeLine(line.repr());
        prevLine.z = undefined;
        return [prevLine, line];
      }
      return line;
    }
    return null;
  });
  return modifiedLines.filter((a) => !!a).flat();
}
