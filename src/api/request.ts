import axios from 'axios';
import { apiToken } from 'lib/config';
/** Overwriting axios to allow any type of response */
declare module 'axios' {
  export interface AxiosResponse<T = any> extends Promise<T> {}
}

export const request = axios.create({
  baseURL: process.env.REACT_APP_API_SERVER,
  timeout: 30000,
});

request.defaults.headers.get['Content-Type'] = 'application/json;charset=UTF-8';

request.interceptors.request.use(
  (config) => {
    config.headers['Authorization'] = `Bearer ${apiToken}`;
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  },
);
