import { TestBed, inject } from '@angular/core/testing';

import { ServerApiService } from './server-api.service';

describe('ServerApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServerApiService]
    });
  });

  it('should be created', inject([ServerApiService], (service: ServerApiService) => {
    expect(service).toBeTruthy();
  }));
});
