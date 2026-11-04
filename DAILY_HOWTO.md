# jw2 일용할 성구 (daily.html) 갱신
1. 먼저 jw1(/workspace/watchtower-violetta-gleb-preview/jw1.html)의 일용할 성구를 새 날짜로 갱신 (DAILY_HOWTO.md, daily_rg.py 참고: 러시안그램 강세).
2. `python3 /workspace/russian/build_daily.py` 실행 → jw1에서 DAILY_RU, DAILY_GRAMMAR, dDate, dVerse(러/한), 출처줄을 뽑아 daily.html 재생성.
3. 검증: script 부분 추출 후 `node --check`.
4. jw2(jungwan1/jw2) 루트에 daily.html 업로드. index.html의 링크 `daily.html?v=N`의 N을 올리면 캐시 회피(선택).
5. 모든 문장의 문법해설 박스 맨 위에 굵은 "한국어: …" 줄이 들어감. jw1에 `const DAILY_KO=[...]`(DAILY_RU 바로 아래, 문장 수와 같게, wol.jw.org 한국어 일용할 성구 공식 표현을 러시아어 문장에 맞춰 나눔, '하느님')를 반드시 갱신할 것. 개수가 다르면 build_daily.py가 멈춤.
6. 글꼴: 페이지 전체 한 가지(*{font-family:'Noto Sans',...,'Noto Sans KR',sans-serif !important}) + Google Fonts Noto Sans(키릴). 다른 font-family 넣지 말 것(강세 표시가 밀림).
7. jw1 갱신 스크립트(/workspace/upd_dailyMMDD.py)는 DAILY_RU/DAILY_GRAMMAR와 함께 반드시 DAILY_KO도 써야 함: `import sys; sys.path.insert(0,'/workspace'); from set_daily_ko import set_ko; h=set_ko(h,KO)` (KO = wol.jw.org 한국어 일용할 성구를 러시아어 문장 수에 맞춰 나눈 목록, '하느님'). jw1 문법해설의 모든 문장 박스와 jw2 daily.html 모두 DAILY_KO[i]를 "한국어:" 줄로 맨 위에 보여 줌.
