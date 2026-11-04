# jw2 일용할 성구 (daily.html) 갱신
1. 먼저 jw1(/workspace/watchtower-violetta-gleb-preview/jw1.html)의 일용할 성구를 새 날짜로 갱신 (DAILY_HOWTO.md, daily_rg.py 참고: 러시안그램 강세).
2. `python3 /workspace/russian/build_daily.py` 실행 → jw1에서 DAILY_RU, DAILY_GRAMMAR, dDate, dVerse(러/한), 출처줄을 뽑아 daily.html 재생성.
3. 검증: script 부분 추출 후 `node --check`.
4. jw2(jungwan1/jw2) 루트에 daily.html 업로드. index.html의 링크 `daily.html?v=N`의 N을 올리면 캐시 회피(선택).
5. 성구(첫 문장) 문법해설 박스 맨 위에 "한국어: …" 줄이 자동으로 들어감 (build_daily.py가 dVerse 한국어를 DAILY_KO0로 넣음). 손으로 만들 때도 이 줄을 맨 위에 넣을 것.
