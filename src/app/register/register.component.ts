import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { matchValidator } from './form-validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  fb : FormBuilder = new FormBuilder;
  invalidLogin!: boolean;
  constructor(private settings: MatDialog, private http : HttpClient) { }
  registrarse(){
    this.http.post("https://localhost:5001/api/users/register", { 
      username: this.registerForm.value.usuario, 
      password: this.registerForm.value.password
    })
    .subscribe(response => {
      const token = (<any>response).token;
      localStorage.setItem("jwt", token);
      this.invalidLogin = false;
      this.settings.closeAll();
    }, err =>{
      this.invalidLogin = true;
    })
  }

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      usuario: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.pattern("[A-Za-z0-9_]+")
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        matchValidator('password2', true)
      ]),
      password2: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        matchValidator('password')
      ])
    });
  
  }

}

