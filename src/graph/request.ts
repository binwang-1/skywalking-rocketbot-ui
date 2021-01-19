import axios, * as foo from 'axios';

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
});

export default service;

export import AxiosPromise = foo.AxiosPromise;

export import AxiosResponse = foo.AxiosResponse;
