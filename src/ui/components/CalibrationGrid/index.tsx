import React from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { CoordinateAxes } from '../../utils/threejs/CoordinateAxes';
import { GridLines } from '../../utils/threejs/GridLines';
import { Camera, CameraProps } from '../../utils/threejs/Camera';
import { useSelector } from '../../store/hooks';
import { RootState } from '../../store';
// import Controls from '../../utils/threejs/Controls';
import { CalibrationPoints } from './CalibrationPoints';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

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
  aspect: 1,
  // near: 0.1,
  position: new THREE.Vector3(0, 0, 0),
};

const CalibrationGrid: React.ForwardRefRenderFunction<
  CalibrationGridHandler,
  never
> = (_, ref) => {
  React.useImperativeHandle(ref, () => ({
    resetView: () => {
      controlsRef.current?.reset();
      zoomToFit();
    },
  }));

  const [xDim, yDim] = useSelector((state: RootState) => [
    state.calibration.xDim,
    state.calibration.yDim,
  ]);

  const [cameraProps, setCameraProps] =
    React.useState<CameraProps>(defaultCameraProps);

  const canvasRef = React.useRef<HTMLCanvasElement>();
  const controlsRef = React.useRef<OrbitControlsImpl>();

  function zoomToFit() {
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
  }

  React.useEffect(() => {
    controlsRef.current?.reset();
    setTimeout(() => {
      zoomToFit();
    }, 100)
  }, [xDim, yDim, controlsRef.current]);

  return (
    <Canvas ref={canvasRef}>
      <Camera {...cameraProps} />
      <OrbitControls
        minDistance={1}
        maxDistance={10000}
        ref={controlsRef}
      />
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
          showLabels
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
