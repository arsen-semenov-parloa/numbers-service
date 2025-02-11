import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import RequestClient from 'twilio/lib/base/RequestClient';
import Request, { Headers } from 'twilio/lib/http/request';
import Response from 'twilio/lib/http/response';

@Injectable()
export class CustomClientService implements RequestClient {
  //private readonly logger = new Logger(CustomClientService.name);
  private auth: { username: string; password: string };

  constructor(
    private readonly timeout: number,
    private readonly mockUri: string,
    private readonly username: string,
    private readonly password: string,
  ) {
    this.axios = axios.create();
  }

  defaultTimeout: number;
  axios: AxiosInstance;
  lastResponse?: Response<any>;
  lastRequest?: Request<any>;
  autoRetry: boolean;
  maxRetryDelay: number;
  maxRetries: number;
  keepAlive: boolean;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filterLoggingHeaders(_headers: Headers): string[] {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //private logRequest;

  async request(opts: {
    method: string;
    uri: string;
    headers?: Record<string, string>;
    username?: string;
    password?: string;
    data?: any;
  }): Promise<any> {
    if (!opts.method) {
      throw new HttpException(
        'HTTP method is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!opts.uri) {
      throw new HttpException('URI is required', HttpStatus.BAD_REQUEST);
    }

    // Axios auth option will use HTTP Basic auth by default
    if (opts.username && opts.password) {
      this.auth = {
        username: this.username, //opts.username,
        password: this.password, //opts.password,
      };
    }

    // Options for axios config
    const options: AxiosRequestConfig = {
      url: opts.uri.replace(/^https\:\/\/.*?\.twilio\.com/, this.mockUri),
      method: opts.method as any,
      headers: opts.headers,
      auth: this.auth,
      timeout: this.timeout,
      data: opts.data,
    };

    try {
      //this.logger.log('Making HTTP request', options);
      const response = await axios.request(options);
      //this.logger.log('HTTP request response', response.data);
      return {
        statusCode: response.status,
        body: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          `Error making HTTP request: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException(
          'Error making HTTP request',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
