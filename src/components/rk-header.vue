<!-- Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. -->
<template>
  <header class="rk-header flex-h">
    <div class="flex-h">
      <!-- <svg class="svg-logo icon" style="margin-right:35px;margin-top:-5px">
        <use xlink:href="#logo-sw"></use>
      </svg>
      <span class="grey rocketbot">Rocketbot</span> -->
      <span class="mr-20">{{ appName }}</span>
      <router-link class="nav-link mr-20" to="/" exact>
        <svg class="icon sm vm">
          <use xlink:href="#chart"></use>
        </svg>
        <span class="vm hide-xs ml-5">{{ this.$t('dashboard') }}</span>
      </router-link>
      <router-link class="nav-link mr-20" to="/topology">
        <svg class="icon sm vm">
          <use xlink:href="#issues"></use>
        </svg>
        <span class="vm hide-xs ml-5">{{ this.$t('topology') }}</span>
      </router-link>
      <router-link class="nav-link mr-20" to="/trace">
        <svg class="icon sm vm">
          <use xlink:href="#merge"></use>
        </svg>
        <span class="vm hide-xs ml-5">{{ this.$t('trace') }}</span>
      </router-link>
      <router-link class="nav-link mr-20" to="/profile">
        <svg class="icon sm vm">
          <use xlink:href="#timeline"></use>
        </svg>
        <span class="vm hide-xs ml-5">{{ this.$t('profile') }}</span>
      </router-link>
      <router-link class="nav-link mr-20" to="/alarm">
        <svg class="icon sm vm">
          <use xlink:href="#spam"></use>
        </svg>
        <span class="vm hide-xs ml-5">{{ this.$t('alarm') }}</span>
      </router-link>
    </div>
    <div class="flex-h">
      <a class="rk-btn mr-5 sm" :class="auto ? 'blue' : 'ghost'" @click="handleAuto">
        <span class="vm">{{ this.$t('auto') }}</span>
      </a>
      <div class="auto-time">
        <span class="rk-auto-select">
          <input v-model="autoTime" type="number" @change="changeAutoTime" min="1" />
        </span>
        {{ this.$t('second') }}
      </div>
      <a class="rk-btn sm ghost mr-5" @click="handleReload">
        <svg class="icon mr-5 vm" :class="{ loading: auto }">
          <use xlink:href="#retry"></use>
        </svg>
        <span class="vm">{{ this.$t('reload') }}</span>
      </a>
      <RkDropdown width="90px" :options="options" @click="handleDropdownClick">
        <div class="header-user">
          {{ userInfo.username || 'unknown' }}
        </div>
      </RkDropdown>
    </div>
  </header>
</template>

<script lang="ts">
  import axios from 'axios';
  import { openapi } from '@/graph';
  import Cookies from 'js-cookie';

  import { Vue, Component } from 'vue-property-decorator';
  import { Action, State, Getter } from 'vuex-class';
  import timeFormat from '@/utils/timeFormat';
  import RkDropdown from './rk-dropdown.vue';

  @Component({
    components: { RkDropdown },
  })
  export default class Header extends Vue {
    @Getter('duration') private duration: any;
    @Action('SET_DURATION') private SET_DURATION: any;
    private UID_TT: string = 'uid_tt';
    private show: boolean = false;
    private auto: boolean = false;
    private autoTime: number = 6;
    private timer: any = null;
    private userInfo: any = {};
    private appName: string = window.localStorage.getItem('appName') || '微服务监控系统';
    private options: object = [
      {
        name: '退出登录',
        key: 'sign-out',
        event: async () => {
          const service = window.location.href;
          const { data } = await openapi.get('/api/sso/logout', {
            params: {
              service,
            },
          });
          if (data && data.redirect_url) {
            location.href = data.redirect_url;
          } else {
            location.reload();
          }
        },
      },
    ];
    private async created() {
      if (process.env.NODE_ENV === 'development') {
        return;
      }
      this.verifyUser();
      setInterval(this.verifyUser, 1000 * 10);
      const org_id = await this.getOrgId();
      if (org_id) {
        this.getUserInfo(org_id);
      }
    }
    // 校验登用户录状态
    private verifyUser() {
      if (!Cookies.get(this.UID_TT)) {
        // 登出
        const service = window.location.href;
        window.location.href = `/login?service=${service}`;
      }
    }
    private async getOrgId() {
      const { data } = await openapi.get('/api/org/list');
      if (data) {
        const curr = data.find((item: any) => item.is_current);
        return curr ? curr.org_id : undefined;
      }
    }
    private async getUserInfo(org_id: string) {
      const { data } = await openapi.get(`/api/org/${org_id}/user/get`);
      if (data) {
        this.userInfo = data;
      }
    }
    private handleReload() {
      const gap = this.duration.end.getTime() - this.duration.start.getTime();
      const utcCopy: any = -(new Date().getTimezoneOffset() / 60);
      const time: Date[] = [new Date(new Date().getTime() - gap), new Date()];
      this.SET_DURATION(timeFormat(time));
    }
    private handleAuto() {
      this.auto = !this.auto;
      if (this.auto) {
        this.handleReload();
        this.timer = setInterval(this.handleReload, this.autoTime * 1000);
      } else {
        clearInterval(this.timer);
      }
    }
    private handleHide() {
      this.show = false;
    }
    private handleShow() {
      this.show = !this.show;
    }
    private handleSignout() {
      localStorage.removeItem('skywalking-authority');
      this.$router.push('/login');
    }
    private changeAutoTime() {
      clearInterval(this.timer);
      if (this.auto) {
        this.handleReload();
        this.timer = setInterval(this.handleReload, this.autoTime * 1000);
      }
    }
    private handleDropdownClick(item: any) {
      if (item.event) {
        item.event();
      }
    }
  }
</script>

<style lang="scss" scoped>
  .rk-header {
    flex-shrink: 0;
    justify-content: space-between;
    height: 48px;
    padding-right: 15px;
    padding-left: 15px;
    font-size: 13px;
    color: #efefef;
    z-index: 9;
    background-color: #252a2f;
    box-shadow: 0 1px 2px 0 rgba(26, 24, 29, 0.24);
    .svg-logo {
      width: 90px;
      height: 22px;
    }
    .rocketbot {
      padding-top: 27px;
      position: absolute;
      font-size: 11px;
    }
    .logo {
      font-family: 'Avenir', Helvetica, Arial, sans-serif;
      font-size: 18px;
      padding-top: 2px;
      margin-right: 50px;
    }
    .nav-link {
      padding: 4px 10px;
      border-radius: 4px;
      opacity: 0.8;
      color: #efeff1;
      will-change: opacity, background-color;
      transition: opacity 0.3s, background-color 0.3s;
    }
    .nav-link:hover,
    .nav-link.active {
      opacity: 1;
      background-color: #333844;
    }

    .header-user {
      width: 80px;
      text-align: center;
      cursor: pointer;
    }
  }
  .rk-header-user {
    display: none;
    position: relative;
  }
  .rk-header-user-menu {
    position: absolute;
    top: 35px;
    right: 0;
    background-color: #fff;
    overflow: hidden;
    border-radius: 4px;
    padding: 3px 0;
    color: #333844;
    width: 100px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1), 0 0 1px rgba(0, 0, 0, 0.15);
  }
  .rk-header-user-menu-i {
    padding: 6px 10px;
    will-change: background-color;
    transition: background-color 0.3s;
    &:hover {
      background-color: #dededf;
    }
  }
</style>
