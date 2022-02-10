import { useEffect, useState } from "react";
import { format, isToday, isYesterday } from 'date-fns'

export default function Home({ sites }) {
  const [selectedSite, setSelectedSite] = useState(null);
  const [deploys, setDeploys] = useState(null);

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

  return (
    <div className="p-8">
        <div className="flex flex-col items-center justify-center">
          <label className="font-xl font-semibold">Select a site:</label>
          <select onChange={(e) => setSelectedSite(e.target.value)} className="border border-gray-500 rounded p-2">
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

export async function getServerSideProps(context) {
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
    }
  }
}