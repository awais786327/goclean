import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingComponent } from './components/landing/landing.component';
import { HomeComponent } from './components/home/home.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';

import {environment} from '../environments/environment';

import {ToastrModule} from 'ngx-toastr';
import {AngularFirestore} from 'angularfire2/firestore';

import {FirebaseUIModule, firebase, firebaseui} from 'firebaseui-angular';
/*
import {AngularFireModule} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
*/
import {AngularFireModule} from 'angularfire2';
import {AngularFireAuthModule} from 'angularfire2/auth';

import {FirebaseService} from './services/firebase.service';
import {UserService} from './services/user.service';
import {AuthService} from './services/auth.service';
import {AuthGuardService} from './services/auth-guard.service';

const authProviders = [
  {enabled: true, name: 'Google', provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID},
  {
    enabled: false, name: 'Facebook', provider: {
      scopes: [
        'public_profile',
        'email',
        'user_likes',
        'user_friends'
      ],
      customParameters: {
        'auth_type': 'reauthenticate'
      },
      provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID
    }
  },
  {enabled: false, name: 'Twitter', provider: firebase.auth.TwitterAuthProvider.PROVIDER_ID},
  {enabled: false, name: 'Github', provider: firebase.auth.GithubAuthProvider.PROVIDER_ID},
  {
    enabled: false, name: 'Email', provider: {
      requireDisplayName: false,
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID
    }
  },
  {enabled: false, name: 'Phone', provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID},
  {enabled: false, name: 'Anonymous', provider: firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID}
];
const firebaseUiAuthConfig: firebaseui.auth.Config = {
  signInFlow: 'popup',
  signInOptions: authProviders.filter(obj => obj.enabled).map(obj => obj.provider),
  tosUrl: '<your-tos-link>',
  privacyPolicyUrl: '<your-privacyPolicyUrl-link>',
  credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM
};

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
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig)
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
