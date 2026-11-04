import json
# Usage: python3 build_daily.py  -> extracts today's daily text from jw1.html into daily.html
import re
src=open('/workspace/watchtower-violetta-gleb-preview/jw1.html',encoding='utf-8').read()
ru=re.search(r'^const DAILY_RU=.*?;$',src,re.M).group(0)
gr=re.search(r'^const DAILY_GRAMMAR=.*?;$',src,re.M).group(0)
date=re.search(r'<div class="dDate">(.*?)</div>',src).group(1)
verse=re.search(r'<div class="dVerse">(.*?)</div></div>',src,re.S).group(1)
ko=re.search(r'margin-top:4px">(.*?)$',verse).group(1)
vru=verse.split('<div')[0]
kom=re.search(r'^const DAILY_KO=(.*?);$',src,re.M)
ko_list=json.loads(kom.group(1)) if kom else []
n=len(json.loads(re.search(r'^const DAILY_RU=(.*?);$',src,re.M).group(1)))
if len(ko_list)!=n: raise SystemExit(f'DAILY_KO in jw1 must have {n} items (one Korean line per Russian sentence, official 일용할 성구 wording)')
srcline=re.search(r'<div class="dSrc">(출처:.*?)</div>',src).group(1)
html=f'''<!DOCTYPE html><html lang="ko"><head><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0"><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700;800&subset=cyrillic,latin&display=swap" rel="stylesheet"><title>일용할 성구</title>
<style>*{{font-family:'Noto Sans','Segoe UI',Roboto,Arial,'Helvetica Neue','Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif !important;letter-spacing:normal}}body{{margin:0;background:linear-gradient(180deg,#fff7ed,#ffedd5);color:#2d2118;min-height:100vh}}.wrap{{max-width:600px;margin:0 auto;padding:24px 16px 60px}}
.home{{display:inline-block;background:#d96f32;color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:12px;box-shadow:0 3px 8px #0002}}
h1{{font-size:26px;margin:18px 0 6px}}.date{{color:#b3541e;font-weight:700;margin-bottom:12px}}
.card{{background:#fff;border-radius:16px;padding:18px;box-shadow:0 4px 12px #0001;margin:14px 0;line-height:1.75}}
.verse{{letter-spacing:normal;font-size:21px;font-weight:700}}.ko{{font-size:15px;color:#6b5646;margin-top:6px}}
.ru{{letter-spacing:normal;font-size:19px;cursor:pointer;border-radius:6px;padding:1px 2px}}.ru:hover{{background:#ffedd5}}.ru.playing{{background:#fed7aa}}
.gbtn{{background:#d96f32;color:#fff;border:0;border-radius:10px;padding:10px 16px;font-size:15px;font-weight:700;margin-top:10px}}
.sent{{margin:10px 0}}.gSec{{margin:6px 0 12px;background:#fff7ed;border-left:4px solid #d96f32;border-radius:8px;padding:8px 10px}}.gT{{font-weight:700;color:#b3541e;}}.gSec ul{{margin:4px 0;padding-left:20px;font-size:15px}}.src{{font-size:12px;color:#7a6656}}
.ctl{{font-size:14px;color:#6b5646}}</style></head>
<body><div class="wrap"><a class="home" href="index.html?v=5">🏠 홈으로</a>
<h1>📖 일용할 성구</h1><div class="date">{date.replace("일용할 성구 · ","")}</div>
<div class="card"><div class="verse">{vru}</div><div class="ko">{ko}</div></div>
<div class="card"><div class="ctl">문장을 누를 때마다 여자 목소리로 읽어주고, 그 문장의 문법해설이 바로 아래 열리고 닫혀요. 속도 <select id="rate"><option>0.7</option><option selected>0.85</option><option>1</option></select> (강세는 러시안그램으로 확인했습니다)</div><div id="body"></div></div>
<div class="src">{srcline}</div></div>
<script>
{ru}
{gr}
const DAILY_KO={json.dumps(ko_list,ensure_ascii=False)};
const DAILY_KO0={json.dumps(ko,ensure_ascii=False)};
const clean=s=>s.normalize('NFD').replace(/\\u0301/g,'').normalize('NFC');
let ruVoices=[];function lv(){{ruVoices=speechSynthesis.getVoices().filter(v=>/^ru/i.test(v.lang));}}
if('speechSynthesis' in window){{lv();speechSynthesis.onvoiceschanged=lv;}}
function sp(i,el){{if(!('speechSynthesis' in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(clean(DAILY_RU[i]));u.lang='ru-RU';u.rate=+document.getElementById('rate').value;
const f=ruVoices.find(v=>/milena|svetlana|dariya|daria|irina|anna|ekaterina|female|google/i.test(v.name)&&!/\bmale|dmitri|yuri|pavel|maxim/i.test(v.name));if(f){{u.voice=f;u.pitch=1;}}else{{if(ruVoices[0])u.voice=ruVoices[0];u.pitch=1.3;}}
document.querySelectorAll('.ru.playing').forEach(e=>e.classList.remove('playing'));el.classList.add('playing');u.onend=u.onerror=()=>el.classList.remove('playing');speechSynthesis.speak(u);
const g=document.getElementById('g'+i);g.style.display=g.style.display==='none'?'block':'none';}}
document.getElementById('body').innerHTML=DAILY_RU.map((s,i)=>`<div class="sent"><span class="ru" onclick="sp(${{i}},this)">${{s}}</span><div class="gSec" id="g${{i}}" style="display:none"><ul><li><b>한국어:</b> ${{DAILY_KO[i]||''}}</li>${{DAILY_GRAMMAR[i].map(b=>`<li>${{b}}</li>`).join('')}}</ul></div></div>`).join('');
</script></body></html>'''
open('/workspace/russian/daily.html','w',encoding='utf-8').write(html)
print('ok',date)
