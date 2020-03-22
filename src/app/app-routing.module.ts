import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LandingComponent} from './components/landing/landing.component';
import {HomeComponent} from './components/home/home.component';
import {AuthGuardService as AuthGuard} from './services/auth-guard.service';
import {AuthenticationComponent} from './components/authentication/authentication.component';

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'maps/home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'auth/login', component: AuthenticationComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
