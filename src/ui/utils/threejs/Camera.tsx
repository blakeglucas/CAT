import * as THREE from 'three';
import React from 'react';
import { useThree, useFrame, ReactThreeFiber } from '@react-three/fiber';

export type CameraProps = ReactThreeFiber.PerspectiveCameraProps

export function Camera(props: CameraProps) {
  const ref = React.useRef<THREE.PerspectiveCamera>();
  const set = useThree((state) => state.set);
  React.useEffect(() => void set({ camera: ref.current }), []);
  useFrame(() => ref.current.updateMatrixWorld());
  return (
    <perspectiveCamera
      ref={ref}
      {...props}
    />
  );
}
