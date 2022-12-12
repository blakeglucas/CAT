import React from 'react';
import { Line } from './Line';
import colornames from 'colornames';
import { Text } from '@react-three/drei';

type CoordinateAxesProps = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ?: number;
  maxZ?: number;
  showLabels?: boolean;
  labelSpacing?: number;
  fontSize?: number;
};

const red = colornames('red');
const green = colornames('green');
const blue = colornames('blue');

export function CoordinateAxes({
  minX,
  maxX,
  minY,
  maxY,
  minZ,
  maxZ,
  showLabels,
  labelSpacing,
  fontSize,
}: CoordinateAxesProps) {
  const keyCounter = React.useRef(0);

  function buildAxis(
    start: number[],
    end: number[],
    color: string,
    dashed?: boolean
  ) {
    return (
      <Line
        key={keyCounter.current++}
        dashed={dashed}
        start={start}
        end={end}
        color={color}
        materialProps={{ opacity: 0.8, transparent: true, linewidth: 1 }}
      />
    );
  }

  const xAxis = React.useMemo(
    () => (
      <group>
        {buildAxis([0, 0, 0], [maxX, 0, 0], red, false)}
        {buildAxis([0, 0, 0], [minX, 0, 0], red, true)}
      </group>
    ),
    [minX, maxX]
  );

  const yAxis = React.useMemo(
    () => (
      <group>
        {buildAxis([0, 0, 0], [0, maxY, 0], green, false)}
        {buildAxis([0, 0, 0], [0, minY, 0], green, true)}
      </group>
    ),
    [minY, maxY]
  );

  const zAxis = React.useMemo(
    () => (
      <group>
        {maxZ && buildAxis([0, 0, 0], [0, 0, maxZ], blue, false)}
        {minZ && buildAxis([0, 0, 0], [0, 0, minZ], blue, true)}
      </group>
    ),
    [minZ, maxZ]
  );

  const labels = React.useMemo(() => {
    if (!showLabels) {
      return [];
    }
    const font = '/assets/fonts/expressway rg.ttf';
    const labels = [];
    for (let x = minX; x <= maxX; x += labelSpacing || 10) {
      // No idea why the anchors need to be negative
      labels.push(
        <Text
          key={keyCounter.current++}
          anchorX={-(x - 0.5)}
          anchorY={1}
          color={red}
          font={font}
          fontSize={fontSize || 1}>
          {x}
        </Text>
      );
    }
    for (let y = minY; y <= maxY; y += labelSpacing || 10) {
      labels.push(
        <Text
          key={keyCounter.current++}
          anchorX={2}
          anchorY={-(y + 0.625)}
          color={green}
          font={font}
          fontSize={fontSize || 1}>
          {y}
        </Text>
      );
    }
    // for (let z = minZ; z <= maxZ; z += (labelSpacing || 1)) {
    //   labels.push(
    //     <Text anchorX={0} anchorY={0} color={blue} font={font} fontSize={1}>0</Text>
    //   )
    // }
    return labels;
  }, [minX, minY, maxX, maxY, labelSpacing, showLabels, fontSize]);

  return (
    <group>
      {xAxis}
      {yAxis}
      {zAxis}
      {labels}
    </group>
  );
}
