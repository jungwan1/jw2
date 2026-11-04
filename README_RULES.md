# 복습 페이지 생성 규칙 (2026-11-04, 글렙 요청)

review/<date>.html 및 review/index.html을 자동/수동 생성할 때:
1. 글렙이 원래 쓴 문장 줄("글렙: ..." 같은 원문 시도)은 절대 넣지 않는다.
2. 선생님 평가는 만들지 않는다: review/*-eval.html 파일 생성 금지, index.html·페이지 안에 "선생님 평가" 링크/버튼 금지,
   점수(%·"내용 전달력"), "완벽!/정답!" 같은 평가 코멘트 금지.
3. 남기는 것: 고친 러시아어 문장(강세 표시), 한국어 뜻("뜻: ..."), 짧은 문법 메모, 핵심 단어 표.
(제거 전 원본 백업: /tmp/review_bak_20261104/)

# 단어·강의 규칙 (2026-11-05, 글렙 요청)
4. 새 단어는 mywords.html에 넣지 않는다. 해당 날짜 review/<date>.html 안의 `<section class="card" id="words">` '단어' 표(러시아어·뜻·예문)에 넣는다.
5. 강의 mp3(audio/lecture-<date>.mp3)를 만들면 lectures.html의 AUD 배열 맨 앞에 날짜를 추가한다(최신순).
6. mywords.html은 보관만 하고 어디서도 링크하지 않는다. 메인 index.html: '배운 내용 복습' 오른쪽에 '강의 듣기'(lectures.html).
7. 글꼴은 Noto Sans만. 바꾼 링크에는 ?v= 숫자를 올린다.
