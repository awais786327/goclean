import {Injectable, Output, EventEmitter} from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  @Output() userStatus: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  getUser() {
    const userData = JSON.parse(localStorage.getItem('firebaseui::rememberedAccounts'));
    const user = userData && userData[0];
    this.userStatus.emit(user);
    return user;
  }

  removeUser() {
    localStorage.removeItem('firebaseui::rememberedAccounts');
  }
}
