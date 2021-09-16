import { TestBed, inject } from '@angular/core/testing';

import { ServerUpdateService } from './server-update.service';

describe('ServerUpdateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServerUpdateService]
    });
  });

  it('should be created', inject([ServerUpdateService], (service: ServerUpdateService) => {
    expect(service).toBeTruthy();
  }));
});
