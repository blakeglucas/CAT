import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';

import { CoordinateAxes } from '../../utils/threejs/CoordinateAxes';

import * as THREE from 'three';
import { GCodeLoader } from '../../utils/threejs/GCodeLoader';

import { Controls } from '../../utils/threejs/Controls';
import { GridLines } from '../../utils/threejs/GridLines';
import colornames from 'colornames';
import { TextSprite } from '../../utils/threejs/TextSprite';
import { HeightMapService } from '../../services/height-map.service';
import { ElectronService } from '../../services/electron.service';
import { GcodeService } from '../../services/gcode.service';
import { contourGCode, GCodeObject } from '../../utils/contourGCode';

@Component({
  selector: 'app-gcode-renderer',
  templateUrl: './gcode-renderer.component.html',
  styleUrls: ['./gcode-renderer.component.scss'],
})
export class GcodeRendererComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() gCode = '';
  @Input() width = 600;
  @Input() height = 480;
  @Input() gCodeType: 'raw' | 'contoured' = 'raw';
  @Output() contoured = new EventEmitter();
  @ViewChild('renderContainer', { read: ElementRef })
  renderContainer: ElementRef<HTMLDivElement>;

  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private controls: Controls;
  private readonly gCodeLoader: GCodeLoader;

  private gCodeGroup: THREE.Group;

  constructor(
    public heightMapService: HeightMapService,
    private gCodeService: GcodeService,
    private electronService: ElectronService,
    private cdr: ChangeDetectorRef
  ) {
    this.animate = this.animate.bind(this);
    this.gCodeLoader = new GCodeLoader();
    this.initRender();
  }

  get dirty() {
    return this.controls.touched;
  }

  ngOnInit(): void {}

  initRender() {
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.width / this.height,
      0.01,
      10000
    );
    this.camera.position.z = 200;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(colornames('gray 22'));

    const axes = new CoordinateAxes(-120, 120, -120, 120);
    this.scene.add(axes.group);
    const lines = new GridLines(
      -120,
      120,
      10,
      -120,
      120,
      10,
      colornames('blue'),
      colornames('gray 70')
    );
    this.scene.add(lines.group);

    const textSize = 10 / 3;
    const minX = -120;
    const minY = -120;
    const maxX = 120;
    const maxY = 120;

    for (let x = minX; x <= maxX; x += 10) {
      if (x !== 0) {
        const textLabel = new TextSprite({
          x: x,
          y: -4,
          z: 0,
          size: textSize,
          text: x,
          textAlign: 'center',
          textBaseline: 'bottom',
          color: colornames('red'),
          opacity: 0.5,
        });
        // @ts-ignore
        this.scene.add(textLabel);
      }
    }
    for (let y = minY; y <= maxY; y += 10) {
      if (y !== 0) {
        const textLabel = new TextSprite({
          x: -4,
          y: y,
          z: 0,
          size: textSize,
          text: y,
          textAlign: 'center',
          textBaseline: 'bottom',
          color: colornames('green'),
          opacity: 0.5,
        });
        // @ts-ignore
        this.scene.add(textLabel);
      }
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new Controls(
      this.camera,
      this.scene,
      this.renderer.domElement
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.render(this.scene, this.camera);
    this.animate();
    this.loadGCode();
  }

  resetView() {
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.width / this.height,
      0.01,
      10000
    );
    this.camera.position.z = 200;
    this.controls = new Controls(
      this.camera,
      this.scene,
      this.renderer.domElement
    );
    this.renderer.render(this.scene, this.camera);
  }

  ngAfterViewInit(): void {
    this.renderContainer.nativeElement.appendChild(this.renderer.domElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateRendererWidth();
    if (changes.gCode) {
      this.loadGCode();
    }
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  updateRendererWidth() {
    if (!this.renderer) {
      return;
    }
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }

  loadGCode() {
    if (this.gCodeGroup) {
      this.scene.remove(this.gCodeGroup);
    }
    if (!this.gCode) {
      return;
    }
    this.gCodeGroup = this.gCodeLoader.parse(this.gCode);
    this.gCodeGroup.rotateX(Math.PI / 2);
    this.gCodeGroup.position.set(0, 0, 0);
    this.scene.add(this.gCodeGroup);
  }

  triggerFileOpen() {
    this.electronService.ipcRenderer.send(`file:open_${this.gCodeType}_gcode`);
  }

  clearGCode() {
    if (this.gCodeType === 'raw') {
      this.gCodeService.clearRawGCode();
    } else if (this.gCodeType == 'contoured') {
      this.gCodeService.clearCGCode();
    }
    this.cdr.detectChanges();
  }

  performContour() {
    if (this.gCodeType === 'contoured') {
      return;
    }
    const gCodeLines = contourGCode(
      new GCodeObject(this.gCode),
      this.heightMapService.currentHeightMap,
      -1
    ).filter((a) => !!a);
    const cGCode = gCodeLines.map((line) => line.repr()).join('\n');
    this.gCodeService.setCGCode(cGCode, undefined);
    this.contoured.emit();
  }
}
