import { Component, HostBinding, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  myForm!: FormGroup;
  fb : FormBuilder = new FormBuilder;
  constructor(private settings: MatDialog) { }
  saveSettings(){
    console.log(this.myForm.value)
    localStorage.setItem('dificultad', this.myForm.value['dificultad']);
    localStorage.setItem('modoOscuro', this.myForm.value['modoOscuro']);
    localStorage.setItem('language', this.myForm.value['language']);
    this.settings.closeAll()

  }

  ngOnInit() {
    var dificultad = localStorage.getItem('dificultad');
    var modoOscuro : Boolean;
    var language = localStorage.getItem('language');
    if (localStorage.getItem('modoOscuro') == "false"){
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
