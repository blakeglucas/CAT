import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private snackbar: MatSnackBar) {}

  showError(msg: string, action?: string, config?: MatSnackBarConfig) {
    const errorConfig: MatSnackBarConfig = {
      panelClass: ['bg-red-800', 'text-white', 'font-sans'],
      duration: 6000,
    };
    return this.snackbar.open(msg, action || 'Dismiss', {
      ...errorConfig,
      ...(config || {}),
    });
  }
}
