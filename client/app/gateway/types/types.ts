export enum GATEWAY_STATUS {
	CONNECTED = 'connected',
	DISCONNECTED = 'disconnected'
}

export interface ResetResponse {
  gateway: {
    status: GATEWAY_STATUS;
    resetInProgress: boolean;
    resetInitiated: boolean;
    lastResetAt: number;
  };
}

export interface GatewayInitResponse {
  gateway: {
    status: GATEWAY_STATUS;
    resetInProgress: boolean;
    resetInitiated: boolean;
    lastResetAt: number;
  }
}
