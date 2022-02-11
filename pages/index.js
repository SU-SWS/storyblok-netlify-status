import React, { useState , useEffect } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { useSession, getSession } from "next-auth/react"

export default function Home({ sites, session, isAuthorized }) {
  const [selectedSite, setSelectedSite] = useState(null);
  const [deploys, setDeploys] = useState(null); 
  
  useEffect(() => {
    if (window.top === window.self) {
      window.location.replace('https://app.storyblok.com/oauth/app_redirect');
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ siteId: selectedSite });
    if (selectedSite) {
      fetch('/api/deploys?' + params.toString())
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 404) return;
        setDeploys(data);
      })
    }
    else {
      setDeploys(null);
    }
    
  }, [selectedSite]);

  const stateClasses = (state) => {
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
  }

  const day = (date) => {
    if (isToday(new Date(date))) {
      return 'Today';
    } else if (isYesterday(new Date(date))) {
      return 'Yesterday';
    }
    return format(new Date(date), 'MMM d')
  }

  const toHHMMSS = (val) => {
    const sec_num = parseInt(val, 10); // don't forget the second param
    const hours   = Math.floor(sec_num / 3600);
    const minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    const seconds = sec_num - (hours * 3600) - (minutes * 60);
    return (hours ? hours + 'h ' : '') + (minutes ? minutes + 'm ' : '') + seconds + 's';
  }

  if (isAuthorized) {
    return (
      <div className="p-8">
          <div>
            <label>Select a site:</label>
            <select onChange={(e) => setSelectedSite(e.target.value)}>
              <option value="">-- Select Site --</option>
              { sites.map(site => <option key={site.id} value={site.id}>{ site.name }</option> )}
            </select>
          </div>
        {
          deploys && deploys.map((item) => (
            <div className="flex pb-4 mb-4 border-b border-gray-500 flex justify-between" key={item.id}>
              <div className="">
                <div>
                  <strong className="capitalize">{item.context}</strong>: {item.branch}
                  <span className={`align-baseline capitalize duration-200 ml-2 ease-out flex-0-auto inline-block leading-2 px-[4px] py-[2px] relative rounded-sm self-center text-sm transition -top-px whitespace-nowrap font-bold ${stateClasses(item.state)}`}>{item.state}</span>
                </div>
                {item.committer && <span>by {item.committer}</span>}
              </div>
  
              <div className="text-right">
                <strong> {day(item.created_at)} at {format(new Date(item.created_at), 'K:mm aa')}</strong>
                {
                  item.deploy_time && <div>Deployed in: {toHHMMSS(item.deploy_time)}</div>
                }
              </div>
            </div>
          ))
        }
      </div>
    )
  }
  return (
    <div>Wait...</div>
  )
}

export async function getServerSideProps(context) {
  const referer = context.req.headers.referer || null;
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin/storyblok',
        permanent: false,
      }
    }
  }
  
  const sitesRes = await fetch('https://api.netlify.com/api/v1/sites?filter=all', {
    headers: {
      authorization: `Bearer ${process.env.NETLIFY_TOKEN}`
    }
  }).then((res) => res.json());

  const sites = sitesRes.map((site) => {
    return {
      id: site.id,
      name: site.name
    }
  });

  return {
    props: {
      sites,
      session,
      isAuthorized: session ? true : false
    }
  }
}