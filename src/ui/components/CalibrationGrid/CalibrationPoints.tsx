import * as THREE from 'three';
import React from 'react';
import { RootState } from '../../store';
import { useSelector } from '../../store/hooks';
import colornames from 'colornames';
// import { ThreeElements } from '@react-three/fiber';

const fragmentShader = `
uniform vec3 goodColor;
uniform vec3 badColor;
uniform float worstZ;
uniform float pointZ;

void main() {
  float z_score = abs(pointZ) / worstZ;
  gl_FragColor = vec4(mix(goodColor, badColor, z_score), 1.0);
}
`;

export function CalibrationPoints() {
  const [xDim, yDim, xPoints, yPoints, rawHeightMap, currentRowMap] = useSelector(
    (state: RootState) => [
      state.calibration.xDim,
      state.calibration.yDim,
      state.calibration.xPoints,
      state.calibration.yPoints,
      state.calibration.heightMap,
      state.calibration.rowMap,
    ]
  );

  const heightMap = React.useMemo(() => [...rawHeightMap.flat(), ...currentRowMap], [rawHeightMap, currentRowMap]);

  const [points, setPoints] = React.useState<JSX.Element[]>([]);

  function drawPoints() {
    // Clam to 2 decimal places to avoid weird JS decimal error propagation
    const xDelta = Number((xDim / (xPoints - 1)).toFixed(2));
    const yDelta = Number((yDim / (yPoints - 1)).toFixed(2));

    let maxZ = 0.1;
    heightMap.forEach((p) => {
      const z = Math.abs(p[2]);
      if (z > maxZ) {
        maxZ = z;
      }
    });

    const _points: JSX.Element[] = [];

    for (let y = 0; y <= yDim; y += yDelta) {
      for (let x = 0; x <= xDim; x += xDelta) {
        const calPoint = heightMap.find((p) => p[0] === x && p[1] === y);
        _points.push(
          <mesh
            key={_points.length}
            position={new THREE.Vector3(x, y, calPoint ? calPoint[2] * 10 : 0)}>
            <sphereGeometry args={[0.5, 64]} />
            {calPoint ? (
              <shaderMaterial
                uniforms={{
                  goodColor: {
                    value: new THREE.Color(colornames('green 1')),
                  },
                  badColor: {
                    value: new THREE.Color(colornames('red 3')),
                  },
                  worstZ: {
                    value: maxZ,
                  },
                  pointZ: {
                    value: calPoint ? calPoint[2] : 0,
                  },
                }}
                fragmentShader={fragmentShader}
              />
            ) : (
              <meshBasicMaterial color={colornames('gold 3')} />
            )}
          </mesh>
        );
      }
    }

    setPoints(_points)
  }

  React.useEffect(drawPoints, [xDim, yDim, xPoints, yPoints, heightMap])

  return (<group>{points}</group>);
}
