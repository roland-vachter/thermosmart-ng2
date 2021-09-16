import { TestBed, inject } from '@angular/core/testing';

import { ThermoServerApiService } from './thermo-server-api.service';

describe('ServerApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThermoServerApiService]
    });
  });

  it('should be created', inject([ThermoServerApiService], (service: ThermoServerApiService) => {
    expect(service).toBeTruthy();
  }));
});
