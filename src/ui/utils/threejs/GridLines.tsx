import React from 'react';
import { Line } from './Line';
import colornames from 'colornames';

type GridLinesProps = {
  minX: number;
  maxX: number;
  stepX: number;
  minY: number;
  maxY: number;
  stepY: number;
  color?: string;
  xColor?: string;
  yColor?: string;
};

export function GridLines({
  minX,
  maxX,
  stepX,
  minY,
  maxY,
  stepY,
  color,
  xColor,
  yColor,
}: GridLinesProps) {
  const [lines, setLines] = React.useState([]);

  React.useEffect(() => {
    const lines = [];

    for (
      let x = Math.ceil(minX / stepX) * stepX;
      x <= Math.floor(maxX / stepX) * stepX;
      x += stepX
    ) {
      if (x === 0) {
        continue;
      }

      lines.push(
        <Line
          key={lines.length}
          start={[x, minY, 0]}
          end={[x, maxY, 0]}
          color={xColor || color || colornames('gray 70')}
        />
      );
    }

    for (
      let y = Math.ceil(minY / stepY) * stepY;
      y <= Math.floor(maxY / stepY) * stepY;
      y += stepY
    ) {
      if (y === 0) {
        continue;
      }

      lines.push(
        <Line
          key={lines.length}
          start={[minX, y, 0]}
          end={[maxX, y, 0]}
          color={yColor || color || colornames('gray 70')}
        />
      );
    }

    setLines(lines);
  }, [minX, maxX, stepX, minY, maxY, stepY, color, xColor, yColor]);

  return <group>{lines}</group>;
}
