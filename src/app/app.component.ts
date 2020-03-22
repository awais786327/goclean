import {Component} from '@angular/core';
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

export class AppComponent {
  user: any;

  constructor(private angularFireAuth: AngularFireAuth, private router: Router, private userService: UserService) {
    this.user = this.userService.getUser();
    this.userService.userStatus.subscribe(user => {
      this.user = user;
    });
  }

  logout() {
    this.angularFireAuth.auth.signOut();
    this.userService.removeUser();
    this.user = null;
    this.router.navigate(['/auth/login']);
  }
}
