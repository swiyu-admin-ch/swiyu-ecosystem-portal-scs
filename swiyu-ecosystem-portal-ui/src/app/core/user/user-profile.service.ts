import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, mergeMap, of, tap} from 'rxjs';
import {UserProfile, UserProfileApi} from '../../api/generated';
import {AuthService} from '../security/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly authService = inject(AuthService);
  private readonly userProfileApi = inject(UserProfileApi);
  public readonly userProfile$ = new BehaviorSubject<UserProfile | null>(null);

  constructor() {
    this.authService.loggedIn$
      .pipe(
        mergeMap(loggedIn => (loggedIn ? this.loadUserProfile() : this.clearUserProfil())),
        tap(userProfile => this.userProfile$.next(userProfile))
      )
      .subscribe();
  }

  private loadUserProfile() {
    return this.userProfileApi.getUserProfile();
  }

  private clearUserProfil() {
    return of(null);
  }
}
