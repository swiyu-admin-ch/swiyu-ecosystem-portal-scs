import {fakeAsync, TestBed} from '@angular/core/testing';

import {BehaviorSubject, of} from 'rxjs';
import {UserProfileApi} from '../../api/generated';
import {AuthService} from '../security/auth.service';
import {UserProfileService} from './user-profile.service';

describe('UserProfileService', () => {
  let mockAuthService: Partial<AuthService>;
  let mockUserProfileApi: Partial<UserProfileApi>;
  let service: UserProfileService;

  beforeEach(() => {
    mockAuthService = {
      loggedIn$: new BehaviorSubject(false)
    };
    mockUserProfileApi = {
      getUserProfile: jest.fn().mockReturnValue(of({isGovernmental: true}))
    };

    TestBed.configureTestingModule({
      providers: [
        UserProfileService,
        {provide: AuthService, useValue: mockAuthService},
        {provide: UserProfileApi, useValue: mockUserProfileApi}
      ]
    });
    service = TestBed.inject(UserProfileService);
  });

  it('should set userProfile when logged in', fakeAsync(() => {
    // WHEN login
    mockAuthService.loggedIn$!.next(true);
    TestBed.tick();
    // THEN login
    expect(service.userProfile$.getValue()).toEqual({isGovernmental: true});
    // WHEN logout
    mockAuthService.loggedIn$!.next(false);
    TestBed.tick();
    // THEN logout
    expect(service.userProfile$.getValue()).toBeNull();
  }));
});
