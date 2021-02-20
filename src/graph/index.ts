/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import axios, * as foo from 'axios';
import { cancelToken } from '@/utils/cancelToken';
import * as option from './query/option';
import * as trace from './query/trace';
import * as topology from './query/topology';
import * as alarm from './query/alarm';
import * as profile from './query/profile';
import * as dashboard from './query/dashboard';

const query: any = {
  ...option,
  ...trace,
  ...topology,
  ...alarm,
  ...profile,
  ...dashboard,
};

export const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
});

export const openapi = axios.create({
  baseURL: '/datarangers',
});

//  接口校验,登出
const logout = (response: AxiosResponse) => {
  if (response && response.data && response.data.code === 1403) {
    console.log('API logout');
    const service = window.location.href;
    window.location.href = `/login?service=${service}`;
    return false;
  }
};

service.interceptors.response.use(
  function(response) {
    logout(response);
    return response;
  },
  function(error) {
    throw error;
  },
);

openapi.interceptors.response.use(
  function(response) {
    logout(response);
    return response ? response.data : response;
  },
  function(error) {
    throw error;
  },
);

export import AxiosPromise = foo.AxiosPromise;

export import AxiosResponse = foo.AxiosResponse;

class Graph {
  private queryData: string = '';
  public query(queryData: string) {
    this.queryData = queryData;
    return this;
  }
  public params(variablesData: any): AxiosPromise<void> {
    return service.post(
      '/graphql',
      {
        query: query[this.queryData],
        variables: variablesData,
      },
      { cancelToken: cancelToken() },
    );
  }
}

export default new Graph();
