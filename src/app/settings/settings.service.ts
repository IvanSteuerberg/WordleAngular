import { Injectable, EventEmitter, Output } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class SettingsGuard{
    @Output() saveSettings = new EventEmitter<string>();

    clicked() {
        this.saveSettings.emit();
      }
}
