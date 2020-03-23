import {Component, AfterViewInit} from '@angular/core';
import {Router, NavigationStart, NavigationEnd} from '@angular/router';
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

export class AppComponent implements AfterViewInit {
  user: any;

  constructor(private angularFireAuth: AngularFireAuth, private router: Router, private userService: UserService) {
    this.user = this.userService.getUser();
    this.userService.userStatus.subscribe(user => {
      this.user = user;
    });

    let asyncLoadCount = 0;
    router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          asyncLoadCount++;
        } else if (event instanceof NavigationEnd) {
          asyncLoadCount--;
        }
        !!asyncLoadCount ? this.isLoading(true) : this.isLoading(false);
      }
    );
  }

  ngAfterViewInit() {
    // stop loading for first time as it is shown by default
    this.isLoading(false);
  }

  isLoading(bool?) {
    document.getElementById('app-loader').style.display = bool ? 'block' : 'none';
  }

  logout() {
    this.angularFireAuth.auth.signOut();
    this.userService.removeUser();
    this.user = null;
    this.router.navigate(['/auth/login']);
  }
}
