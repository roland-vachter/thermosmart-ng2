/* eslint-disable max-classes-per-file */
import { Request } from "express";
import { Response } from 'node-fetch';

export class ErrorWithStatus extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export class ErrorWithResponse extends Error {
  response?: any;

  constructor(message: string, response?: Response) {
    super(message);
    this.response = response;
  }
}

export interface LoginError extends Error {
  invalidSession?: boolean;
  type?: string;
}

export interface RequestWithFlags extends Request {
  apiCall?: boolean;
}

export enum RESPONSE_STATUS {
	OK = 'ok',
	ERROR = 'error'
};

export interface LocationBasedEvent {
  location: number;
}
