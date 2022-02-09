import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from "@angular/router";
import { JwtHelperService } from "@auth0/angular-jwt";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate{
    
    constructor(private jwtHelper: JwtHelperService){

    }
    canActivate(){
        const token = localStorage.getItem("jwt");

        if (token && !this.jwtHelper.isTokenExpired(token)){
            return true;
        }
        return false;
    }
}