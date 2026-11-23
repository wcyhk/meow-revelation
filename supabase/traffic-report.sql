-- Operator-only report. Hong Kong dates, including today.
select case source
         when 'kchkd' then '驚青網'
         when 'game16' then '無料ゲームnet'
         when 'webgamejp' then 'WebGameJp'
         when 'youtube' then 'YouTube'
         when 'bahamut' then '巴哈姆特'
         when 'bilibili' then 'Bilibili'
         when 'indieradar' then 'IndieRadar'
         when 'reddit' then 'Reddit'
         when 'itchio' then 'itch.io'
         when 'crazygames' then 'CrazyGames'
         when 'threads' then 'Threads'
         when 'direct' then '直接或未辨識'
         else '其他網站'
       end as "來源",
       visits as "到訪",
       visits_that_started as "有開局嘅到訪",
       start_rate_pct as "開局率 %",
       runs_started as "開局總數",
       play_hours as "遊玩時數",
       minutes_per_run as "每局平均分鐘"
from meow_analytics.last_30_days
order by visits desc, visits_that_started desc, source;
