import { Component, HostBinding, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  myForm!: FormGroup;
  fb : FormBuilder = new FormBuilder;
  constructor(private settings: MatDialog, private themeService: ThemeService) { }
  saveSettings(){
    localStorage.setItem('dificultad', this.myForm.value['dificultad']);
    if (this.myForm.value['modoOscuro']){
      localStorage.setItem('modoOscuro', 'dark-mode');
      this.themeService.update('dark-mode');
    }
    else{
      localStorage.setItem('modoOscuro', 'light-mode');
      this.themeService.update('light-mode');
    }
    localStorage.setItem('language', this.myForm.value['language']);
    this.settings.closeAll()

  }

  ngOnInit() {
    var dificultad = localStorage.getItem('dificultad');
    var modoOscuro : boolean;
    var language = localStorage.getItem('language');
    if (localStorage.getItem('modoOscuro') == "light-mode"){
      modoOscuro = false;
    }
    else{
      modoOscuro = true;
    }
    this.myForm = this.fb.group({
      dificultad: dificultad,
      modoOscuro: modoOscuro,
      language: language
    })
  }

}
