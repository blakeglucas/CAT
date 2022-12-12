import * as THREE from 'three';
import React from 'react';

export type GCodeProps = {
  gcode: string;
  materialColor?: string;
  scaleZ?: number;
};

export type GCodePoint = {
  x: number;
  y: number;
  z: number;
  f: number;
};

export function GCode(props: GCodeProps) {
  const object = React.useMemo(() => {
    const { gcode } = props;
    const scaleZ = props.scaleZ || 1;
    const materialColor = props.materialColor || 'blue';
    const drawing: {
      pathVertex: number[];
      z: number;
    } = {
      pathVertex: [],
      z: 0,
    };

    let state = {
      x: 0,
      y: 0,
      z: 0,
      f: 0,
      relative: false,
    };

    function absolute(v1: number, v2: number) {
      return state.relative ? v1 + v2 : v2;
    }

    function addSegment(p1: GCodePoint, p2: GCodePoint) {
      // if (Math.abs(p1.z) >= scaleZ) {
      //   p1.z /= scaleZ;
      // }
      // if (Math.abs(p2.z) >= scaleZ) {
      //   p2.z /= scaleZ;
      // }
      drawing.pathVertex.push(p1.x, p1.y, p1.z);
      drawing.pathVertex.push(p2.x, p2.y, p2.z);
    }

    if (gcode) {
      const lines = gcode.replace(/;.+/g, '').split('\n');

      for (let i = 0; i < lines.length; i++) {
        const tokens = lines[i].split(' ');
        const cmd = tokens[0].toUpperCase(); //Argumments

        const args: Record<'x' | 'y' | 'z' | 'e' | 'f', number | undefined> = {
          x: undefined,
          y: undefined,
          z: undefined,
          e: undefined,
          f: undefined,
        };
        tokens.splice(1).forEach(function (token) {
          if (token[0] !== undefined) {
            const key = token[0].toLowerCase();
            const value = parseFloat(token.substring(1));
            args[key as keyof typeof args] = value;
          }
        });

        if (cmd === 'G0' || cmd === 'G00' || cmd === 'G1' || cmd === 'G01') {
          const line = {
            x: args.x !== undefined ? absolute(state.x, args.x) : state.x,
            y: args.y !== undefined ? absolute(state.y, args.y) : state.y,
            z:
              (args.z !== undefined ? absolute(state.z, args.z) : state.z) *
              ((cmd === 'G1' || cmd === 'G01') &&
              args.x !== undefined &&
              args.y !== undefined
                ? scaleZ
                : 1),
            f: args.f !== undefined ? absolute(state.f, args.f) : state.f,
          };

          addSegment(state, line);
          state = { ...state, ...line };
        }
        if (cmd === 'G90') {
          //G90: Set to Absolute Positioning
          state.relative = false;
        } else if (cmd === 'G91') {
          //G91: Set to state.relative Positioning
          state.relative = true;
        } else if (cmd === 'G92') {
          // Necessary??
          //G92: Set Position
          const line = state;
          line.x = args.x !== undefined ? args.x : line.x;
          line.y = args.y !== undefined ? args.y : line.y;
          line.z = args.z !== undefined ? args.z : line.z;
        }
      }

      return (
        <lineSegments>
          <bufferGeometry
            attributes={{
              position: new THREE.Float32BufferAttribute(drawing.pathVertex, 3),
            }}
          />
          <lineBasicMaterial color={materialColor} />
        </lineSegments>
      );
    } else {
      return null;
    }
  }, [props.gcode, props.materialColor, props.scaleZ]);

  return object;
}
