import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './shared/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // this.authService.loggedIn().subscribe((res) => {
    //   if(!res) {
    //     this.router.navigate(['/']);
    //   }
    // });

    if(!this.authService.loggedIn()) {
      this.router.navigate(['/']);
    }

    return this.authService.loggedIn();

    
  }
  
}
