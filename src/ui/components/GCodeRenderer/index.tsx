import React from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Camera } from '../../utils/threejs/Camera';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CoordinateAxes } from '../../utils/threejs/CoordinateAxes';
import { GridLines } from '../../utils/threejs/GridLines';
import { GCode } from './GCode';

const xDim = 120,
  yDim = 120;

const defaultCameraProps = {
  fov: 50,
  aspect: 1,
  // near: 0.1,
  position: new THREE.Vector3(0, 0, 0),
};

export type GCodeRendererHandler = {
  resetView: () => void;
};

export type GCodeRendererProps = {
  gcode: string;
};

export const GCodeRenderer = React.forwardRef(
  (props: GCodeRendererProps, ref) => {
    React.useImperativeHandle(ref, () => ({
      resetView: () => {
        controlsRef.current?.reset();
        zoomToFit();
      },
    }));

    const canvasRef = React.useRef<HTMLCanvasElement>();
    const controlsRef = React.useRef<OrbitControlsImpl>();

    const [cameraProps, setCameraProps] = React.useState(defaultCameraProps);

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
        rel = 1.8 * yDim * canvasRef.current.height;
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
      }, 100);
    }, [controlsRef.current]);

    return (
      <Canvas ref={canvasRef}>
        <Camera {...cameraProps} />
        <OrbitControls
          minDistance={1}
          maxDistance={10000}
          ref={controlsRef}
        />
        <CoordinateAxes
          minX={-xDim}
          maxX={xDim}
          minY={-yDim}
          maxY={yDim}
          showLabels
          fontSize={3}
        />
        <GridLines
          minX={-xDim}
          maxX={xDim}
          stepX={10}
          minY={-yDim}
          maxY={yDim}
          stepY={10}
        />
        <GCode gcode={props.gcode} />
      </Canvas>
    );
  }
);
