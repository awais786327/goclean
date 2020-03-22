import {Injectable} from '@angular/core';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private userService: UserService) {
  }

  public isAuthenticated(): boolean {
    const isUser = this.userService.getUser();
    // return true or false depending on condition
    // same as i.e: if user return true otherwise false
    return isUser;
  }

}
