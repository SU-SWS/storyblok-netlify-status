<template>
  <div class="p-8">
    <h1 class="text-center text-2xl font-bold">
      <span v-if="siteInfo"> Recent Netlify Builds for "{{ siteInfo.name }}"</span>
      <span v-else>Netlify Configuration not found for this Storyblok space.</span>
    </h1>
    <div v-if="deploys.length" class="p-8">
      <div v-for="item in deploys" :key="item.id" class="flex pb-4 mb-4 border-b border-gray-500 flex justify-between">
        <div class="">
          <div>
            <strong class="capitalize">{{ item.context }}</strong>: {{ item.branch }}
            <span :class="`align-baseline capitalize duration-200 ml-2 ease-out flex-0-auto inline-block leading-2 px-[4px] py-[2px] relative rounded-sm self-center text-sm transition -top-px whitespace-nowrap font-bold ${stateClasses(item.state)}`">{{ item.state }}</span>
          </div>
          <span>{{ item.committer }}</span>
        </div>

        <div class="text-right">
          <strong>{{ day(item.created_at) }} at {{ format(new Date(item.created_at), 'K:mm aa') }}</strong>
          <div v-if="item.deploy_time">Deployed in: {{ toHHMMSS(item.deploy_time) }}</div>
        </div>
      </div>
    </div>
    <div v-else-if="siteInfo" class="text-center text-lg p-8">
      There are no recent builds for this site.
    </div>
  </div>
</template>

<script>
import fetch from 'node-fetch';
import { format, isToday, isYesterday } from 'date-fns'
import { netlifySiteMapping } from '../config/netlify_sites';

export default {
  name: 'IndexPage',
  data: () => ({
    siteInfo: '',
    deploys: [],
  }),
  async fetch() {
    const storyblokId = this.$route.query.space_id || null;
    const siteInfo = netlifySiteMapping[storyblokId] || null;
    this.siteInfo = siteInfo;
    
    if (!storyblokId || !siteInfo) return;

    const deploys = await fetch(`https://api.netlify.com/api/v1/sites/${siteInfo.netlifyId}/deploys`, {
      headers: {
        authorization: `Bearer ${process.env.NETLIFY_TOKEN}`
      }
    }).then((res) => res.json());

    const filteredDeploys = deploys.filter((item) => item.branch === siteInfo.branch);

    this.deploys = filteredDeploys;
  },
  mounted() {
    if (window.top === window.self) {
      window.location.assign('https://app.storyblok.com/oauth/app_redirect')
    }
  },
  fetchOnServer: true,
  methods: {
    day: (date) => {
      if (isToday(new Date(date))) {
        return 'Today';
      } else if (isYesterday(new Date(date))) {
        return 'Yesterday';
      }
      return format(new Date(date), 'MMM d')
    },
    toHHMMSS: (val) => {
      const secNum = parseInt(val, 10); // don't forget the second param
      const hours   = Math.floor(secNum / 3600);
      const minutes = Math.floor((secNum - (hours * 3600)) / 60);
      const seconds = secNum - (hours * 3600) - (minutes * 60);
      return (hours ? hours + 'h ' : '') + (minutes ? minutes + 'm ' : '') + seconds + 's';
    },
    stateClasses: (state) => {
      switch (state) {
        case 'error':
          return 'bg-[#FED7E2] text-[#900B31]';
        case 'building':
          return 'bg-[#FFE4C2] text-[#6C4718]';
        case 'canceled':
          return 'bg-[#E9EAEB] text-[#15252C]';
        case 'ready':
        default:
          return 'bg-[#C9EEEA] text-[#0D544E]';
      }
    },
    format,
  }
}
</script>
