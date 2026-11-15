/**
 * 형사·민사 상담 신청 수집용 Google Apps Script 웹 앱
 * 배포: 웹 앱, 실행 계정은 본인, 액세스 권한은 모든 사용자
 * 새 스프레드시트를 만든 뒤 그 ID를 SHEET_ID에 넣습니다.
 * 열 순서: 접수일시, 이름, 연락처, 사건분류, 내용, 개인정보동의, utm_source, referrer
 * 연락처는 맨 앞 0이 빠지지 않도록 시트의 텍스트로 기록합니다.
 * 페이지는 text/plain JSON을 POST 합니다. 회생 페이지와 같은 방식입니다.
 */
var SHEET_ID = '1oBKj_H910dfd2uWgVRiJEKCDOxgyA7aSJg3gU_W1vYY';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (!SHEET_ID) {
      return json_({ok: false, error: 'SHEET_ID가 비어 있습니다.'});
    }
    var d = {};
    var raw = e && e.postData ? e.postData.contents : '';
    try { d = JSON.parse(raw); }
    catch (err) { d = (e && e.parameter) || {}; }

    var clean = function(v, max) {
      max = max || 300;
      v = (v === undefined || v === null) ? '' : String(v).slice(0, max);
      return /^[=+\-@]/.test(v) ? "'" + v : v;
    };
    var asText = function(v, max) {
      v = clean(v, max);
      if (!v) return '';
      return v.charAt(0) === "'" ? v : "'" + v;
    };

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    sheet.appendRow([
      Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
      clean(d.name, 80),
      asText(d.phone, 40),
      clean(d.matter, 80),
      clean(d.brief, 2000),
      d.agreed ? '동의' : '미동의',
      clean(d.utm_source, 300),
      clean(d.referrer, 500)
    ]);
    return json_({ok: true});
  } catch (err) {
    return json_({ok: false, error: String(err)});
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('OK');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
