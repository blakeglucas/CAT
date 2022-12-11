import React from 'react';
import { Line } from './Line';
import colornames from 'colornames';

type CoordinateAxesProps = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ?: number;
  maxZ?: number;
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
}: CoordinateAxesProps) {
  function buildAxis(
    start: number[],
    end: number[],
    color: string,
    dashed?: boolean
  ) {
    return (
      <Line
        dashed={dashed}
        start={start}
        end={end}
        color={color}
        materialProps={{ opacity: 0.8, transparent: true, linewidth: 1 }}
      />
    );
  }

  return (
    <group>
      {buildAxis([0, 0, 0], [maxX, 0, 0], red, false)}
      {buildAxis([0, 0, 0], [minX, 0, 0], red, true)}
      {buildAxis([0, 0, 0], [0, maxY, 0], green, false)}
      {buildAxis([0, 0, 0], [0, minY, 0], green, true)}
      {maxZ && buildAxis([0, 0, 0], [0, 0, maxZ], blue, false)}
      {minZ && buildAxis([0, 0, 0], [0, 0, minZ], blue, true)}
    </group>
  );
}
