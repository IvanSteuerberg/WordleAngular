import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JwtHelperService } from '@auth0/angular-jwt';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { SettingsComponent } from '../settings/settings.component';
import { StatsComponent } from '../stats/stats.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  username! : string;
  constructor(private dialog: MatDialog, private jwtHelper: JwtHelperService) { }
  openSettings(){
    this.dialog.open(SettingsComponent);
  }
  openLogin(){
    this.dialog.open(LoginComponent);
  }
  openRegister(){
    this.dialog.open(RegisterComponent);
  }
  openStats(){
    this.dialog.open(StatsComponent, {data: {username : this.username}});
  }


  ngOnInit(): void {
  }

  logout(){
    localStorage.removeItem("jwt");
    this.username = "";
  }

  isUserAuthenticated(){
    var token = localStorage.getItem("jwt");
    if (token && !this.jwtHelper.isTokenExpired(token)){
      let decodedJWT = JSON.parse(window.atob(token.split('.')[1]));
      this.username = decodedJWT["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      return true;
    }
    else{
      return false;
    }
  }

}
