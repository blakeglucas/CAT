import colornames from 'colornames';
import * as THREE from 'three';

const buildAxis = (src, dst, color, dashed) => {
  const geometry = new THREE.BufferGeometry();
  let material;

  if (dashed) {
    material = new THREE.LineDashedMaterial({
      linewidth: 1,
      color,
      dashSize: 1,
      gapSize: 1,
      opacity: 0.8,
      transparent: true,
    });
  } else {
    material = new THREE.LineBasicMaterial({
      linewidth: 1,
      color,
      opacity: 0.8,
      transparent: true,
    });
  }

  geometry.setFromPoints([src.clone(), dst.clone()]);

  const axisLine = new THREE.Line(geometry, material);

  if (dashed) {
    // three.js r91 abandon API of 'geometry.computeLineDistances()', replaced by 'line.computeLineDistances()'
    // Computes an array of distance values which are necessary for LineDashedMaterial.
    axisLine.computeLineDistances();
  }

  return axisLine;
};

// CoordinateAxes
// An axis object to visualize the the 3 axes in a simple way.
// The X axis is red. The Y axis is green. The Z axis is blue.
export class CoordinateAxes {
  group = new THREE.Object3D();

  // Creates an axisHelper with lines of length size.
  // @param {number} size Define the size of the line representing the axes.
  // @see [Drawing the Coordinate Control]{@http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/}
  constructor(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    minZ?: number,
    maxZ?: number
  ) {
    const red = colornames('red');
    const green = colornames('green');
    const blue = colornames('blue');

    this.group.add(
      buildAxis(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(maxX, 0, 0),
        red,
        false
      ), // +X
      buildAxis(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(minX, 0, 0),
        red,
        true
      ), // -X
      buildAxis(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, maxY, 0),
        green,
        false
      ), // +Y
      buildAxis(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, minY, 0),
        green,
        true
      ) // -Y
    );

    if (minZ) {
      this.group.add(
        buildAxis(
          new THREE.Vector3(0, 0, minZ),
          new THREE.Vector3(0, 0, 0),
          blue,
          false
        )
      );
    }
    if (maxZ) {
      this.group.add(
        buildAxis(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, maxZ),
          blue,
          false
        )
      );
    }
  }
}
