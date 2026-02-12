import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiResult, RESPONSE_STATUS } from '../../types/types';
import { LocationService } from '../../services/location.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { GatewayInitResponse, ResetResponse } from '../types/types';

@Injectable()
export class ServerApiService {

  constructor(
    private http: HttpClient,
    private locationService: LocationService
  ) { }

  init(): Observable<GatewayInitResponse> {
    if (this.locationService.getSelectedLocationId()) {
      return this.http.get('/api/gateway/init?location=' + this.locationService.getSelectedLocationId())
        .pipe(
          map((res: ApiResult<GatewayInitResponse>) => {
            if (res.status === RESPONSE_STATUS.OK) {
              return res.data;
            } else {
              return {} as GatewayInitResponse;
            }
          })
        );
    } else {
      return of();
    }
  }

  initiateReset () {
    return this.http.post<ApiResult<ResetResponse>>('/api/gateway/reset', {
      location: this.locationService.getSelectedLocationId()
    });
  }
}
