export class GCodeLine {
    private _cmd = '';
    private _x: number | null = null;
    private _y: number | null = null;
    private _z: number | null = null;
    private _f: number | null = null;
    private _s: number | null = null;
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
            case 'S':
                this._s = Number(part.substring(1));
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
      const xStr = this._x || this._x === 0 ? ` X${this._x.toFixed(8)}` : '';
      const yStr = this._y || this._y === 0 ? ` Y${this._y.toFixed(8)}` : '';
      const zStr = this._z || this._z === 0 ? ` Z${this._z.toFixed(8)}` : '';
      const fStr = this._f || this._f === 0 ? ` F${this._f.toFixed(8)}` : '';
      const sStr = this._s || this._s === 0 ? ` F${this._s.toFixed(8)}` : '';
      return `${this._cmd}${xStr}${yStr}${zStr}${fStr}${sStr}`;
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