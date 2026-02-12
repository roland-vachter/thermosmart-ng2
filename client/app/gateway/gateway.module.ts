import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServerUpdateService } from '../shared/server-update.service';
import { GatewayStatusComponent } from './components/gateway-status/gateway-status.component';
import { ServerApiService } from './services/server-api.service';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    GatewayStatusComponent
  ],
  declarations: [
    GatewayStatusComponent
  ],
  providers: [
    ServerApiService,
    ServerUpdateService
  ]
})
export class GatewayModule { }
