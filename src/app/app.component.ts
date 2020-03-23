import {Component, AfterViewInit, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {UserService} from './services/user.service';

/*
import {AngularFireAuth} from '@angular/fire/auth';
*/
import {AngularFireAuth} from 'angularfire2/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements AfterViewInit, OnInit {
  user: any;

  constructor(private angularFireAuth: AngularFireAuth, private router: Router, private userService: UserService) {
    this.user = this.userService.getUser();
    this.userService.userStatus.subscribe(user => {
      this.user = user;
    });
  }

  ngOnInit() {
    this.isLoading(true);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.isLoading(false);
    }, 3000);
  }

  isLoading(bool?) {
    console.log('loading in root ', bool);
    document.getElementById('app-loader').style.display = bool ? 'block' : 'none';
  }

  logout() {
    this.angularFireAuth.auth.signOut();
    this.userService.removeUser();
    this.user = null;
    this.router.navigate(['/auth/login']);
  }
}
