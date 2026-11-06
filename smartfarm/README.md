# 스마트팜 피해 상담 랜딩

법무법인 재유 스마트팜 피해 상담 신청 페이지입니다.  
기존 재유 랜딩과 같은 톤(아이보리·네이비·골드)이며, 계산기 없이 상담 폼만 있습니다.

## GitHub Pages 주소

저장소 `jungwan1/jw2` 아래 `smartfarm/` 폴더에 `index.html`을 올리면:

- https://jungwan1.github.io/jw2/smartfarm/
- 채널별 예시
  - 메타: `https://jungwan1.github.io/jw2/smartfarm/?utm_source=meta`
  - 블로그: `https://jungwan1.github.io/jw2/smartfarm/?utm_source=blog`
  - 유튜브: `https://jungwan1.github.io/jw2/smartfarm/?utm_source=youtube`
  - 네이버 키워드: `https://jungwan1.github.io/jw2/smartfarm/?utm_source=naver_keyword`

유입경로는 `utm_source` / `utm_campaign`을 `sessionStorage` 키 `sf_src`에 저장해 시트「유입경로」열에 기록합니다. 없으면 `직접 방문`입니다.

## 신청 → 구글 시트 연결 (Apps Script)

시트: https://docs.google.com/spreadsheets/d/1PDUwrpqDJS5DJyXw0204_Y6v0zy-EsnCeqwPy01zUc0/edit

1. 시트에서 **확장 프로그램 > Apps Script** 열기  
2. 기본 코드를 지우고 `apps_script.gs` 내용을 붙여넣은 뒤 저장  
3. **배포 > 새 배포 > 웹 앱**
   - 실행 계정: **나**
   - 액세스: **모든 사용자**
4. 배포 후 나오는 `https://script.google.com/macros/s/.../exec` URL을 복사  
5. 배포된 `/exec` URL은 `index.html`의 `FORM_ENDPOINT`에 들어 있습니다. 웹 앱을 다시 배포하면 그 값을 새 URL로 바꿉니다. 주소가 비어 있거나 브라우저가 전송에 실패하면 감사 화면을 띄우지 않습니다.

스크립트를 수정하면 **배포 관리 > 수정 > 버전: 새 버전**으로 다시 배포해야 반영됩니다.

시트 열 순서: 접수일시, 이름, 연락처, 지역, 회사명(상대방), 피해금액(만원), 대략의 내용, 개인정보동의, 유입경로

## 폼 항목

이름 · 연락처 · 지역 · 회사명(상대방) · 피해금액(만원) · 대략의 내용 · 개인정보 동의

광고책임변호사: 유성우 변호사  
문의: 010-9592-1038 · cafe.naver.com/jaeyulaw
