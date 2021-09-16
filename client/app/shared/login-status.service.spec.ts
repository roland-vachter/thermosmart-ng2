import { TestBed, inject } from '@angular/core/testing';

import { LoginStatusService } from './login-status.service';

describe('LoginStatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginStatusService]
    });
  });

  it('should be created', inject([LoginStatusService], (service: LoginStatusService) => {
    expect(service).toBeTruthy();
  }));
});
