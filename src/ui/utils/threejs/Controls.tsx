import React, { useImperativeHandle } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export type ControlsHandler = {
  reset: OrbitControls['reset']
}

export type ControlsProps = {
  minDistance?: number
  maxDistance?: number
}

function Controls(props: ControlsProps, ref: React.Ref<unknown>): null {
  const { camera, gl } = useThree();

  const controls = React.useMemo(() => new OrbitControls(camera, gl.domElement), [camera, gl.domElement]);

  useImperativeHandle(ref, () => ({
    reset: () => {console.log('reset'), controls.reset()},
    // init: () => {controls.dispatchEvent(I)}
  }))

  React.useEffect(() => {
    controls.minDistance = props.minDistance || 1
    controls.maxDistance = props.maxDistance || 1000

    controls.saveState()
    
    return () => {
      controls.dispose();
    };
  }, [camera, gl]);
  return null;
}

export default React.forwardRef(Controls)