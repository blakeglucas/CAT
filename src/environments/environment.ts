import { MockSerialService } from '../app/services/mock-serial.service';
import { SerialService } from '../app/services/serial.service';

export const APP_CONFIG = {
  production: false,
  environment: 'LOCAL',
  // providers: [
  //   {
  //     provide: SerialService,
  //     useClass: MockSerialService,
  //   },
  // ],
};
