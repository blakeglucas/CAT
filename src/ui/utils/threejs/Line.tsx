import * as THREE from 'three';
import React from 'react';
import {
  LineBasicMaterialProps,
  LineDashedMaterialProps,
  useFrame,
} from '@react-three/fiber';

type SolidLineProps = {
  dashed?: false;
  materialProps?: LineBasicMaterialProps;
};

type DashedLineProps = {
  dashed: true;
  materialProps?: LineDashedMaterialProps;
};

type LineProps = {
  start: THREE.Vector3 | number[];
  end: THREE.Vector3 | number[];
  color?: string;
} & (SolidLineProps | DashedLineProps);

export function Line(props: LineProps) {
  const lineRef = React.useRef<THREE.Line>();

  useFrame(() => {
    lineRef.current.geometry.setFromPoints([
      props.start instanceof THREE.Vector3
        ? props.start
        : new THREE.Vector3(...props.start),
      props.end instanceof THREE.Vector3
        ? props.end
        : new THREE.Vector3(...props.end),
    ]);
    if (props.dashed) {
      lineRef.current.computeLineDistances();
    }
  });

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <line ref={lineRef}>
      <bufferGeometry />
      {props.dashed ? (
        <lineDashedMaterial
          dashSize={1}
          gapSize={1}
          color={props.color || 'blue'}
          {...props.materialProps}
        />
      ) : (
        <lineBasicMaterial
          color={props.color || 'blue'}
          {...props.materialProps}
        />
      )}
    </line>
  );
}
