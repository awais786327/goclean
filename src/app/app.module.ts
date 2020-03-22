import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './components/landing/landing.component';
import { HomeComponent } from './components/home/home.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';

import {ToastrModule} from 'ngx-toastr';
import {AngularFirestore} from 'angularfire2/firestore';

import {FirebaseService} from './services/firebase.service';
import {UserService} from './services/user.service';
import {AuthService} from './services/auth.service';
import {AuthGuardService} from './services/auth-guard.service';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    HomeComponent,
    AuthenticationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      progressBar: true,
      iconClasses: {
        error: 'bg-red animated shake',
        info: 'bg-black animated bounce',
        success: 'bg-olive animated bounceIn',
        warning: ''
      }
    }),
  ],
  providers: [
    AngularFirestore,
    FirebaseService,
    UserService,
    AuthService,
    AuthGuardService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
