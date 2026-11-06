/**
 * 스마트팜 피해 상담 신청자 수집용 Google Apps Script 웹 앱
 * 시트: 스마트팜 피해 상담 신청
 * https://docs.google.com/spreadsheets/d/1PDUwrpqDJS5DJyXw0204_Y6v0zy-EsnCeqwPy01zUc0/edit
 * 열 순서: 접수일시, 이름, 연락처, 지역, 회사명(상대방), 피해금액(만원), 대략의 내용, 개인정보동의, 유입경로
 */
const SHEET_ID = '1PDUwrpqDJS5DJyXw0204_Y6v0zy-EsnCeqwPy01zUc0';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    let d = {};
    const raw = e && e.postData ? e.postData.contents : '';
    try { d = JSON.parse(raw); }                 // text/plain JSON 문자열
    catch (err) { d = (e && e.parameter) || {}; } // form-encoded 대비

    const clean = (v, max) => {                   // 수식 주입 방지
      max = max || 300;
      v = (v === undefined || v === null) ? '' : String(v).slice(0, max);
      return /^[=+\-@]/.test(v) ? "'" + v : v;
    };

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    sheet.appendRow([
      Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
      clean(d.name),
      clean(d.phone),
      clean(d.region),
      clean(d.company),
      clean(d.damage_man),
      clean(d.detail, 2000),                      // 대략의 내용만 2000자
      d.agreed ? '동의' : '미동의',
      clean(d.source)
    ]);
    return ContentService.createTextOutput(JSON.stringify({ok: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok: false, error: String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('OK');
}
