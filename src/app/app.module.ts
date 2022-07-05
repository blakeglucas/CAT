import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA, forwardRef, NgModule } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ResizableModule } from 'angular-resizable-element';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
} from '@angular/material/snack-bar';

import { AppRoutingModule } from './app-routing.module';

import { APP_CONFIG } from '../environments/environment';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { ButtonComponent } from './components/button/button.component';
import { InputComponent } from './components/input/input.component';
import { MenuBarComponent } from './components/menu-bar/menu-bar.component';
import { DividerComponent } from './components/divider/divider.component';
import { MachineControlButtonComponent } from './components/machine-control-button/machine-control-button.component';
import { TabsViewComponent } from './components/tabs-view/tabs-view.component';
import { GcodeRendererComponent } from './components/gcode-renderer/gcode-renderer.component';
import { CurrentHeightMapComponent } from './views/current-height-map/current-height-map.component';
import { MachineControlComponent } from './components/machine-control/machine-control.component';
import { CalibrationComponent } from './views/calibration/calibration.component';
import { CalibrationGridComponent } from './components/calibration-grid/calibration-grid.component';
import { LicensesComponent } from './components/licenses/licenses.component';

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>
  new TranslateHttpLoader(http, './assets/i18n/', '.json');

@NgModule({
  declarations: [
    AppComponent,
    ControlPanelComponent,
    DropdownComponent,
    ButtonComponent,
    InputComponent,
    MenuBarComponent,
    DividerComponent,
    MachineControlButtonComponent,
    TabsViewComponent,
    GcodeRendererComponent,
    CurrentHeightMapComponent,
    MachineControlComponent,
    CalibrationComponent,
    CalibrationGridComponent,
    LicensesComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    ResizableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [
    ...((APP_CONFIG as any).providers || []),
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: -1 } },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
