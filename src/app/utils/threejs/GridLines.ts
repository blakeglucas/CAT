import * as THREE from 'three';

export class GridLines {
  group = new THREE.Object3D();

  colorCenterLine = new THREE.Color(0x444444);

  colorGrid = new THREE.Color(0x888888);

  constructor(
    minX,
    maxX,
    stepX,
    minY,
    maxY,
    stepY,
    colorCenterLine,
    colorGrid
  ) {
    colorCenterLine = new THREE.Color(colorCenterLine) || this.colorCenterLine;
    colorGrid = new THREE.Color(colorGrid) || this.colorGrid;

    minY = minY ?? minX;
    maxY = maxY ?? maxX;
    stepY = stepY ?? stepX;

    for (
      let x = Math.ceil(minX / stepX) * stepX;
      x <= Math.floor(maxX / stepX) * stepX;
      x += stepX
    ) {
      if (x === 0) {
        continue;
      }
      const geometry = new THREE.BufferGeometry();
      const material = new THREE.LineBasicMaterial({ color: colorGrid });

      geometry.setFromPoints([
        new THREE.Vector3(x, minY, 0),
        new THREE.Vector3(x, maxY, 0),
      ]);

      this.group.add(new THREE.Line(geometry, material));
    }

    for (
      let y = Math.ceil(minY / stepY) * stepY;
      y <= Math.floor(maxY / stepY) * stepY;
      y += stepY
    ) {
      if (y === 0) {
        continue;
      }
      const geometry = new THREE.BufferGeometry();
      const material = new THREE.LineBasicMaterial({ color: colorGrid });

      geometry.setFromPoints([
        new THREE.Vector3(minX, y, 0),
        new THREE.Vector3(maxX, y, 0),
      ]);

      this.group.add(new THREE.Line(geometry, material));
    }
  }
}
