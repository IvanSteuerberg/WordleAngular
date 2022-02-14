import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  invalidLogin! :boolean;
  loginForm!: FormGroup;
  fb : FormBuilder = new FormBuilder;
  constructor(private settings: MatDialog, private http : HttpClient) { }
  iniciarSesion(){
    this.http.post("https://api.juegawordle.com/api/users/login", { 
      username: this.loginForm.value.username, 
      password: this.loginForm.value.password
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
    this.loginForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(4)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ])
    });
  
  }

}
