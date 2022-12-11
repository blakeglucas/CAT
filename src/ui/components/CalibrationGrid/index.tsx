import React from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { CoordinateAxes } from '../../utils/threejs/CoordinateAxes';
import { GridLines } from '../../utils/threejs/GridLines';
import { Camera, CameraProps } from '../../utils/threejs/Camera';
import { useSelector } from '../../store/hooks';
import { RootState } from '../../store';
import Controls from '../../utils/threejs/Controls';
import { CalibrationPoints } from './CalibrationPoints';

// const gradientVertexShader = `
// uniform mat4 model_view_projection_matrix;

// varying float vZ;

// void main() {
//   vZ = position.z;
//   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
// }
// `;

export type CalibrationGridHandler = {
  resetView: () => void;
};

const defaultCameraProps = {
  fov: 50,
  aspect: 16 / 9,
  // near: 0.1,
  position: new THREE.Vector3(0, 0, 0),
};

const CalibrationGrid: React.ForwardRefRenderFunction<
  CalibrationGridHandler,
  never
> = (_, ref) => {
  const [resetView, setResetView] = React.useState(false);

  React.useImperativeHandle(ref, () => ({
    resetView: () => {
      // It's hacky, but it works
      setResetView(true);
    },
  }));

  const [xDim, yDim] = useSelector((state: RootState) => [
    state.calibration.xDim,
    state.calibration.yDim,
  ]);

  const [cameraProps, setCameraProps] =
    React.useState<CameraProps>(defaultCameraProps);

  const canvasRef = React.useRef<HTMLCanvasElement>();

  function zoomToFit() {
    setTimeout(() => {
      const theta = cameraProps.fov / 2;
      // FOV only y related, which causes problems
      let rel = 0;
      if (xDim / canvasRef.current.width >= yDim / canvasRef.current.height) {
        // Where does 1.9 come from? I don't know, but it works.
        rel =
          (xDim * canvasRef.current.width) /
          ((1.9 * canvasRef.current.width) / canvasRef.current.height);
      } else {
        rel = yDim * canvasRef.current.height;
      }
      // Roughly equating m to threejs units, factoring in 10% buffer, px->m ~= 0.9, hence px->mm ~= 0.0009, plus /2 (idk, I'm lowkey making this up like it's a senior design project)
      const cHeight = (0.00045 * rel) / Math.tan(theta * ((2 * Math.PI) / 360));
      setCameraProps({
        ...cameraProps,
        position: new THREE.Vector3(0, 0, cHeight),
      });
    }, 250);
  }

  React.useEffect(() => {
    if (resetView) {
      setResetView(false);
    }
    zoomToFit();
  }, [xDim, yDim, resetView]);

  return resetView ? null : (
    <Canvas ref={canvasRef}>
      <Camera {...cameraProps} />
      <Controls />
      <color
        attach='background'
        args={['rgb(82,82,82)']}
      />
      <group position={new THREE.Vector3(-xDim / 2, -yDim / 2, 0)}>
        <CoordinateAxes
          minX={0}
          maxX={xDim}
          minY={0}
          maxY={yDim}
        />
        <GridLines
          minX={0}
          maxX={xDim}
          stepX={1}
          minY={0}
          maxY={yDim}
          stepY={1}
        />
        <CalibrationPoints />
      </group>
    </Canvas>
  );
};

export default React.forwardRef(CalibrationGrid);
