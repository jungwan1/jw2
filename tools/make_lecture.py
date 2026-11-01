#!/usr/bin/env python3
"""Usage: python3 tools/make_lecture.py 2026-11-01  -> audio/lecture-2026-11-01.mp3
Reads WORDS from mywords.html; Korean teacher voice (SunHi) + Russian native (Svetlana)."""
import sys,re,json,os,asyncio,subprocess,tempfile,hashlib,edge_tts
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KO,RU="en-US-AvaMultilingualNeural","ru-RU-SvetlanaNeural"
CYR=re.compile(r"[А-Яа-яЁё\u0301][А-Яа-яЁё\u0301\s,.!?()/\-–]*[А-Яа-яЁё\u0301.!?)]?")
def load(date):
    src=open(os.path.join(ROOT,"mywords.html"),encoding="utf-8").read()
    out=[]
    for line in src.splitlines():
        if line.startswith('{d:"'+date):
            j=re.sub(r'^\{d:"',r'{"d":"',line.rstrip(',').rstrip())
            j=re.sub(r'([,{])(ru|ko|ex|exko|det):',r'\1"\2":',j)
            out.append(json.loads(j))
    return out
def clean(t): return t.replace("\u0301","")
def mixed(t):
    """split text into (voice,text) by Cyrillic runs"""
    segs=[];pos=0
    for m in CYR.finditer(t):
        k=t[pos:m.start()].strip(" ,:;")
        if k: segs.append(("ko",k))
        r=m.group().strip(" ,")
        if len(re.sub(r"[^А-Яа-яЁё]","",r))>0: segs.append(("ru",r))
        pos=m.end()
    k=t[pos:].strip(" ,:;")
    if k and re.search(r"[가-힣0-9A-Za-z]",k): segs.append(("ko",k))
    return segs
import random
OPEN=["자, 이번에 배울 단어는요, 이거예요. 같이 들어 볼까요?","다음 단어 갈게요. 잘 들어 보세요.","좋아요, 이번 단어는 이거예요.","자, 계속해 볼게요. 이번엔 이 단어예요."]
EXI=["그럼 예문으로 한번 들어 볼게요. 천천히 읽어 줄 테니까 잘 들어 보세요.","예문 하나 들어 볼까요?","실제로는 이렇게 써요. 들어 보세요."]
REP=["자, 이제 따라 해 볼까요?","소리 내서 한번 따라 해 보세요.","같이 말해 볼까요?"]
def script(words,date):
    random.seed(date)
    m,d=int(date[5:7]),int(date[8:])
    S=[("ko",f"안녕하세요, 글렙! {m}월 {d}일에 배운 단어들, 지금부터 같이 복습해 볼게요. 모두 {len(words)}개예요. 운전하면서 편하게 듣고, 러시아어가 나오면 소리 내서 따라 해 보세요."),("p",1200)]
    for i,w in enumerate(words,1):
        S+=[("ko",random.choice(OPEN) if i>1 else "자, 첫 번째 단어부터 들어 볼까요?"),("p",400),("ruslow",w["ru"]),("p",900),("ruslow",w["ru"]),("p",600)]
        S+=[("ko",f"네, {w['ko']}, 라는 뜻이에요."),("p",400)]
        if w.get("ex"):
            S+=[("ko",random.choice(EXI)),("p",400),("ruslow",w["ex"]),("p",1200),("ruslow",w["ex"]),("p",700)]
            if w.get("exko"): S+=[("ko",f"{w['exko'].rstrip('.')}, 라는 뜻이죠."),("p",500)]
        det=w.get("det") or {}
        for name,rows in (det.get("tb") or [])[:2]:
            forms=list(rows)[:4]
            if not forms or name.startswith("성"): continue
            S+=[("ko",f"형태도 잠깐 볼게요. {name}은 이렇게 돼요.")]
            for a,b in forms:
                if a and re.search("[가-힣]",a): S.append(("ko",a))
                elif a: S.append(("ru",a))
                S+=mixed(b)+[("p",350)]
        if det.get("n"): S+=[("ko","아, 그리고 하나 꼭 기억해 주세요."),("p",300)]+mixed(det["n"])+[("p",500)]
        for a,b in (det.get("alt") or [])[:2]:
            S+=[("ko","비슷한 말로"),("ru",a),("ko",f"도 있어요. {b}, 이런 느낌이에요.")]+[("p",400)]
        S+=[("ko",random.choice(REP)),("p",300),("ruslow",w["ru"]),("p",2000)]
    S+=[("ko","오늘 복습은 여기까지예요. 정말 수고했어요, 글렙. 다음에 또 같이 해요!")]
    return [s for s in S if s[0]=="p" or re.search(r"[가-힣А-Яа-яЁё0-9A-Za-z]",s[1])]
async def tts(v,t,path,sem):
    async with sem:
        voice=KO if v=="ko" else RU
        rate="-25%" if v=="ruslow" else ("-10%" if v=="ru" else "-5%")
        for _ in range(4):
            try: await edge_tts.Communicate(clean(t),voice,rate=rate).save(path);return
            except Exception: await asyncio.sleep(2)
        raise RuntimeError(t)
async def main(date):
    words=load(date); assert words,"no words for "+date
    S=script(words,date); tmp=tempfile.mkdtemp(); sem=asyncio.Semaphore(6); jobs=[];files=[]
    for i,(v,t) in enumerate(S):
        p=f"{tmp}/{i:04d}.wav"
        if v=="p": subprocess.run(["ffmpeg","-v","error","-f","lavfi","-i","anullsrc=r=24000:cl=mono","-t",str(t/1000),p],check=True)
        else:
            mp=p[:-4]+".mp3"; jobs.append((tts(v,t,mp,sem),mp,p))
        files.append(p)
    await asyncio.gather(*[j[0] for j in jobs])
    for _,mp,p in jobs: subprocess.run(["ffmpeg","-v","error","-i",mp,"-ar","24000","-ac","1",p],check=True)
    open(f"{tmp}/l.txt","w").write("".join(f"file '{f}'\n" for f in files))
    out=os.path.join(ROOT,"audio",f"lecture-{date}.mp3")
    subprocess.run(["ffmpeg","-y","-v","error","-f","concat","-safe","0","-i",f"{tmp}/l.txt","-ac","1","-b:a","64k",out],check=True)
    print(out,len(words),"words")
asyncio.run(main(sys.argv[1]))
