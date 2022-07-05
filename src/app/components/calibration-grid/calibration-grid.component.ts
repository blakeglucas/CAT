import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import colornames from 'colornames';

import { TextSprite } from '../../utils/threejs/TextSprite';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CoordinateAxes } from '../../utils/threejs/CoordinateAxes';
import { GridLines } from '../../utils/threejs/GridLines';
import { HeightMapMetadata } from '../../services/height-map.service';

const gradientVertexShader = `
uniform mat4 model_view_projection_matrix;

varying float vZ;

void main() {
  vZ = position.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const gradientFragmentShader = `
uniform vec3 goodColor;
uniform vec3 badColor;
uniform float worstZ;

varying float vZ;

void main() {
  float z_score = abs(vZ) / worstZ;
  gl_FragColor = vec4(mix(goodColor, badColor, z_score), 1.0);
}
`;

@Component({
  selector: 'app-calibration-grid',
  templateUrl: './calibration-grid.component.html',
  styleUrls: ['./calibration-grid.component.scss'],
})
export class CalibrationGridComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() width = -1;
  @Input() height = -1;
  @Input() xDim: number | undefined;
  @Input() yDim: number | undefined;
  @Input() xDiv: number | undefined;
  @Input() yDiv: number | undefined;
  @Input() resultPoints: number[][] = [];
  @Input() resultMetadata: HeightMapMetadata | undefined;
  @Input() controlHeader: HTMLDivElement | undefined;
  @Input() additionalControls: TemplateRef<any>;
  @Input() viewType: 'points' | 'surface' = 'points';

  @ViewChild('threeRenderer', { read: ElementRef })
  threeRenderer: ElementRef<HTMLDivElement>;

  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private gridRef: THREE.Group;
  private calPointsRef: THREE.Group;
  private planesRef: THREE.Group;

  constructor(private cdr: ChangeDetectorRef) {
    this.initRender = this.initRender.bind(this);
    this.animate = this.animate.bind(this);
  }

  ngOnInit(): void {
    this.initRender();
  }

  ngAfterViewInit(): void {
    this.threeRenderer.nativeElement.appendChild(this.renderer.domElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.viewType) {
      this.drawData();
    }
    if (
      (changes.xDim && changes.xDim.currentValue !== 0) ||
      (changes.yDim && changes.yDim.currentValue !== 0) ||
      (changes.xDiv && changes.xDiv.currentValue !== 0) ||
      (changes.yDiv && changes.yDiv.currentValue !== 0)
    ) {
      this.drawGrid();
      this.drawData();
      this.zoomToFit();
    }
    if (changes.resultPoints) {
      const resultPoints: number[][] = changes.resultPoints.currentValue;
      const lastPoint = resultPoints[resultPoints.length - 1];
      this.xDim = this.xDim || lastPoint[0];
      this.yDim = this.yDim || lastPoint[1];

      // Have to do some gymnastics for these since HeightMapService returns flat array
      this.xDiv = this.xDiv || this.resultMetadata.xpoints;
      this.yDiv = this.yDiv || this.resultMetadata.ypoints;

      this.drawData();
    }
    this.updateRendererWidth();
    this.cdr.detectChanges();
  }

  private initRender() {
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.width / this.height,
      0.01,
      10000
    );

    this.zoomToFit();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(colornames('gray 22'));

    this.drawGrid();
    this.drawData();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.getRenderHeight());
    this.renderer.render(this.scene, this.camera);
    this.animate();
  }

  private drawGrid() {
    if (!this.scene) {
      return;
    }
    const xOffset = this.xDim / -2;
    const yOffset = this.yDim / -2;
    if (this.gridRef) {
      this.scene.remove(this.gridRef);
    }

    this.gridRef = new THREE.Group();

    const axes = new CoordinateAxes(0, this.xDim, 0, this.yDim);
    axes.group.position.setX(xOffset);
    axes.group.position.setY(yOffset);
    this.gridRef.add(axes.group);

    const lines = new GridLines(
      0,
      this.xDim,
      1,
      0,
      this.yDim,
      1,
      colornames('blue'),
      colornames('gray 70')
    );
    this.gridRef.add(lines.group);
    lines.group.position.setX(xOffset);
    lines.group.position.setY(yOffset);

    const textSize = 0.5;
    const minX = 0;
    const minY = 0;
    const maxX = this.xDim;
    const maxY = this.yDim;

    for (let x = minX; x <= maxX; x++) {
      if (x !== 0) {
        const textLabel = new TextSprite({
          x: x + xOffset,
          y: -0.5 + yOffset,
          z: 0,
          size: textSize,
          text: x,
          textAlign: 'center',
          textBaseline: 'bottom',
          color: colornames('red'),
          opacity: 0.5,
        });
        // @ts-ignore
        this.gridRef.add(textLabel);
      }
    }
    for (let y = minY; y <= maxY; y += 1) {
      if (y !== 0) {
        const textLabel = new TextSprite({
          x: -0.5 + xOffset,
          y: y + yOffset,
          z: 0,
          size: textSize,
          text: y,
          textAlign: 'center',
          textBaseline: 'bottom',
          color: colornames('green'),
          opacity: 0.5,
        });
        // @ts-ignore
        this.gridRef.add(textLabel);
      }
    }
    this.scene.add(this.gridRef);
  }

  private zoomToFit() {
    if (!this.camera) {
      return;
    }
    const theta = this.camera.fov / 2;
    const cHeight =
      (this.yDim >= this.xDim ? this.yDim + 3 : this.xDim - 6) /
      2 /
      Math.tan(theta * ((2 * Math.PI) / 360));
    this.camera.position.z = cHeight;
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  updateRendererWidth() {
    if (!this.renderer) {
      return;
    }
    setTimeout(() => {
      const renderHeight = this.getRenderHeight();
      this.renderer.setSize(this.width, renderHeight);
      this.camera.aspect = this.width / renderHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
    }, 500);
  }

  getRenderHeight(): number {
    if (!this.controlHeader) {
      return this.height;
    }
    const { height } = this.controlHeader.getBoundingClientRect();
    return this.height - height;
  }

  private drawData() {
    if (this.viewType === 'points') {
      if (this.planesRef) {
        this.scene.remove(this.planesRef);
        this.planesRef = undefined;
      }
      this.drawCalibrationPoints();
    } else if (this.viewType === 'surface') {
      if (this.calPointsRef) {
        this.scene.remove(this.calPointsRef);
        this.calPointsRef = undefined;
      }
      this.drawSurface();
    }
  }

  private drawCalibrationPoints() {
    if (!this.scene) {
      return;
    }
    if (this.calPointsRef) {
      this.scene.remove(this.calPointsRef);
    }

    this.calPointsRef = new THREE.Group();

    const resultPoints = this.resultPoints || [];

    const xOffset = this.xDim / -2;
    const yOffset = this.yDim / -2;

    const xDelta = this.xDim / (this.xDiv - 1);
    const yDelta = this.yDim / (this.yDiv - 1);

    const targetMaterial = new THREE.MeshBasicMaterial({
      color: colornames('gold 3'),
    });

    let maxZ = 0.1;
    resultPoints.forEach((p) => {
      const z = Math.abs(p[2]);
      if (z > maxZ) {
        maxZ = z;
      }
    });

    for (let y = 0; y <= this.yDim; y += yDelta) {
      for (let x = 0; x <= this.xDim; x += xDelta) {
        const geometry = new THREE.SphereGeometry(0.5, 64);
        const calPoint = resultPoints.find((p) => p[0] === x && p[1] === y);
        const resultMaterial = new THREE.ShaderMaterial({
          uniforms: {
            goodColor: {
              value: new THREE.Color(colornames('green 1')),
            },
            badColor: {
              value: new THREE.Color(colornames('red 3')),
            },
            worstZ: {
              value: maxZ,
            },
            pointZ: {
              value: calPoint ? calPoint[2] : 0,
            },
          },
          fragmentShader: `
          uniform vec3 goodColor;
          uniform vec3 badColor;
          uniform float worstZ;
          uniform float pointZ;
          
          void main() {
            float z_score = abs(pointZ) / worstZ;
            gl_FragColor = vec4(mix(goodColor, badColor, z_score), 1.0);
          }
          `,
        });
        const circle = new THREE.Mesh(
          geometry,
          calPoint ? resultMaterial : targetMaterial
        );
        circle.position.set(
          x + xOffset,
          y + yOffset,
          calPoint ? calPoint[2] * 10 : 0
        );
        this.calPointsRef.add(circle);
      }
    }
    this.scene.add(this.calPointsRef);
  }

  private drawSurface() {
    if (!this.scene) {
      return;
    }
    if (this.calPointsRef) {
      this.scene.remove(this.calPointsRef);
      this.calPointsRef = undefined;
    }
    if (this.planesRef) {
      this.scene.remove(this.planesRef);
    }
    const xOffset = this.xDim / -2;
    const yOffset = this.yDim / -2;
    this.planesRef = new THREE.Group();

    const resultPoints = this.resultPoints || [];

    let maxZ = 0.1;
    resultPoints.forEach((p) => {
      const z = Math.abs(p[2]);
      if (z > maxZ) {
        maxZ = z;
      }
    });

    for (let y = 0; y < this.yDiv - 1; y++) {
      for (let x = 0; x < this.xDiv - 1; x++) {
        const geometry = new THREE.PlaneBufferGeometry();
        const bl = resultPoints[x + y * this.xDiv];
        const br = resultPoints[x + y * this.xDiv + 1];
        const tl = resultPoints[x + y * this.xDiv + this.xDiv];
        const tr = resultPoints[x + y * this.xDiv + this.xDiv + 1];
        geometry.setFromPoints([
          new THREE.Vector3(bl[0], bl[1], bl[2] * 10),
          new THREE.Vector3(br[0], br[1], br[2] * 10),
          new THREE.Vector3(tl[0], tl[1], tl[2] * 10),
          new THREE.Vector3(tr[0], tr[1], tr[2] * 10),
        ]);
        const material = new THREE.ShaderMaterial({
          uniforms: {
            goodColor: {
              value: new THREE.Color(colornames('green 1')),
            },
            badColor: {
              value: new THREE.Color(colornames('red 3')),
            },
            worstZ: {
              value: maxZ * 10,
            },
          },
          side: THREE.DoubleSide,
          vertexShader: gradientVertexShader,
          fragmentShader: gradientFragmentShader,
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.position.set(xOffset, yOffset, 0);
        this.planesRef.add(plane);
      }
    }
    this.scene.add(this.planesRef);
  }

  resetView() {
    if (!this.renderer) {
      return;
    }
    const height = this.getRenderHeight();
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.width / height,
      0.01,
      10000
    );
    this.zoomToFit();
    this.renderer.render(this.scene, this.camera);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.updateRendererWidth();
  }
}
