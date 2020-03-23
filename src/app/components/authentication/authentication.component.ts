import {Component, AfterViewInit, OnInit} from '@angular/core';
import {FirebaseUISignInSuccessWithAuthResult, FirebaseUISignInFailure} from 'firebaseui-angular';
import {Router} from '@angular/router';
import {UserService} from '../../services/user.service';

/*
import { AngularFireAuth } from '@angular/fire/auth';
*/
import {AngularFireAuth} from 'angularfire2/auth';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})

export class AuthenticationComponent implements AfterViewInit, OnInit {
  user: any;

  constructor(private angularFireAuth: AngularFireAuth, private router: Router, private userService: UserService) {
    this.getUser();
  }

  ngOnInit() {
    this.isLoading(true);
    this.angularFireAuth.authState.subscribe(this.firebaseAuthChangeListener);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.isLoading(false);
    }, 3000);
  }

  isLoading(bool?) {
    console.log('loading in auth ', bool);
    document.getElementById('app-loader').style.display = bool ? 'block' : 'none';
  }

  getUser() {
    this.user = this.userService.getUser();
    console.log('user ', this.user);
  }

  logout() {
    this.angularFireAuth.auth.signOut();
    this.userService.removeUser();
    this.getUser();
  }

  firebaseAuthChangeListener(response) {
    // if needed, do a redirect in here
    if (response) {
      console.log('Logged in :)');
    } else {
      localStorage.removeItem('firebaseui::rememberedAccounts');
      console.log('Logged out :(');
    }
  }

  successCallback(data: FirebaseUISignInSuccessWithAuthResult) {
    console.log('successCallback', data);
    this.getUser();
    this.router.navigate(['/maps/home']);
  }

  errorCallback(data: FirebaseUISignInFailure) {
    console.warn('errorCallback', data);
  }
}

