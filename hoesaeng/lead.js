/* Shared consultation submit for the zh/en pages.
   The zh/en pages now post to a separate foreign-lead Google Sheet endpoint
   (not the Korean page's), same keys.
   lang is sent as its own field and also prefixed onto source, so the
   existing source column still shows the language if unknown keys are dropped.
   utm_source / utm_campaign stay inside source, unchanged. */
(function(){
  var COPY = window.LEAD_COPY || {};
  var FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbya_WQJEgzqtYR3kv0ZFeefFNeSIBuK4-Un7j2NTug5Ji68AFhaqZP_WIY5Ft0tbZnTjw/exec";
  var TALKTALK_URL = "";
  var NAVER_WCS_KEY = "";

  document.querySelectorAll('nav.langs a').forEach(function(a){
    if (!location.search) return;
    var href = a.getAttribute('href');
    if (!href || href.indexOf('?') !== -1) return;
    a.setAttribute('href', href + location.search);
  });

  function trackNaver(action){
    if (!NAVER_WCS_KEY || !window.wcs || typeof wcs.cnv !== 'function' || typeof wcs_do !== 'function') return;
    var _nasa = {};
    _nasa.cnv = wcs.cnv(action === 'submit' ? '4' : '5', '0');
    wcs_do(_nasa);
  }

  function getSource(){
    try{
      var q = new URLSearchParams(location.search);
      var src = q.get('utm_source'), cmp = q.get('utm_campaign');
      if (src || cmp) sessionStorage.setItem('hs_src', [src || '-', cmp || '-'].join(' / '));
      return sessionStorage.getItem('hs_src') || (document.referrer ? 'referrer: ' + document.referrer : (COPY.directVisit || 'direct'));
    }catch(e){ return ''; }
  }
  getSource();

  function pageLang(form){
    var input = form && form.querySelector('input[name="lang"]');
    var value = input && input.value ? String(input.value).trim() : '';
    return value || COPY.lang || '';
  }

  function taggedSource(form, place){
    var parts = [];
    var lang = pageLang(form);
    if (lang) parts.push('lang=' + lang);
    if (place) parts.push(place);
    var src = getSource();
    if (src) parts.push(src);
    return parts.join(' / ');
  }

  function phoneString(raw){
    var d = String(raw == null ? '' : raw).replace(/\D/g, '');
    if (d.length === 11) return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
    if (d.length === 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    return String(raw == null ? '' : raw).trim();
  }

  function quickPayload(form, name, phone, place){
    return {
      name: name,
      phone: phone,
      debt_man: '',
      income_man: '',
      household: '',
      extra_man: '',
      result_monthly: '',
      result_pct: '',
      asset_realestate: '',
      asset_mortgage: '',
      asset_deposit: '',
      asset_car: '',
      asset_savings: '',
      asset_retire: '',
      asset_other: '',
      liquidation_value: '',
      agreed: true,
      lang: pageLang(form),
      source: taggedSource(form, place),
      ts: new Date().toISOString()
    };
  }

  function postLead(body, done){
    var queued = false;
    try {
      queued = !!(navigator.sendBeacon && navigator.sendBeacon(FORM_ENDPOINT, new Blob([body], {type:'text/plain;charset=utf-8'})));
    } catch (e) { queued = false; }
    if (queued){ done(true); return; }
    fetch(FORM_ENDPOINT, {method:'POST', mode:'no-cors', keepalive:true, headers:{'Content-Type':'text/plain;charset=utf-8'}, body:body}).then(function(){ done(true); }).catch(function(){ done(false); });
  }

  document.querySelectorAll('.js-phone').forEach(function(el){
    el.addEventListener('click', function(){ trackNaver('phone'); });
  });
  document.querySelectorAll('.js-talktalk').forEach(function(el){
    if (!TALKTALK_URL) { el.hidden = true; return; }
    el.hidden = false;
    el.href = TALKTALK_URL;
  });

  var sending = false;
  var modal = document.getElementById('consultModal');
  var dialog = modal.querySelector('.dialog');
  var form = document.getElementById('consultForm');
  var err = document.getElementById('consultErr');
  var ok = document.getElementById('consultOk');
  var sendBtn = document.getElementById('consultSend');
  var lastFocus = null;

  function focusables(){
    return Array.prototype.slice.call(dialog.querySelectorAll('a,button,input,summary,[tabindex]')).filter(function(el){
      return !el.disabled && !el.hidden && el.offsetParent !== null;
    });
  }
  function openConsult(){
    lastFocus = document.activeElement;
    err.textContent = '';
    ok.hidden = true;
    form.hidden = false;
    document.getElementById('consultIntro').hidden = false;
    document.getElementById('consultTitle').textContent = COPY.modalTitle || '';
    sending = false;
    sendBtn.disabled = false;
    sendBtn.textContent = COPY.send || '';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('qName').focus();
  }
  function closeConsult(){
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('.js-consult').forEach(function(b){ b.addEventListener('click', openConsult); });
  document.getElementById('consultClose').addEventListener('click', closeConsult);
  modal.addEventListener('click', function(e){ if (e.target === modal) closeConsult(); });
  document.addEventListener('keydown', function(e){
    if (modal.hidden) return;
    if (e.key === 'Escape'){ closeConsult(); return; }
    if (e.key !== 'Tab') return;
    var nodes = focusables();
    if (!nodes.length) return;
    var first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

  form.addEventListener('submit', function(ev){
    ev.preventDefault();
    if (sending) return;
    var name = document.getElementById('qName').value.trim();
    var phone = phoneString(document.getElementById('qPhone').value);
    err.textContent = '';
    if (!name){ err.textContent = COPY.errName; document.getElementById('qName').focus(); return; }
    if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g,''))){ err.textContent = COPY.errPhone; document.getElementById('qPhone').focus(); return; }
    if (!document.getElementById('qAgree').checked){ err.textContent = COPY.errAgree; document.getElementById('qAgree').focus(); return; }
    trackNaver('submit');
    if (!FORM_ENDPOINT){ err.textContent = COPY.errFail; return; }
    sending = true;
    sendBtn.disabled = true;
    sendBtn.textContent = COPY.sending;
    var body = JSON.stringify(quickPayload(form, name, phone, COPY.modalPlace || 'modal'));
    postLead(body, function(okSend){
      if (!okSend){
        sending = false;
        sendBtn.disabled = false;
        sendBtn.textContent = COPY.retry;
        err.textContent = COPY.errFail;
        return;
      }
      document.getElementById('consultTitle').textContent = COPY.sentTitle;
      document.getElementById('consultIntro').hidden = true;
      form.hidden = true;
      ok.hidden = false;
      ok.focus();
    });
  });

  document.querySelectorAll('.quick-form').forEach(function(qform){
    qform.addEventListener('submit', function(ev){
      ev.preventDefault();
      var nameEl = qform.querySelector('input[name="name"]');
      var phoneEl = qform.querySelector('input[name="phone"]');
      var agreeEl = qform.querySelector('input[type="checkbox"]');
      var qerr = qform.querySelector('.err');
      var ready = qform.querySelector('.ready');
      var name = nameEl.value.trim();
      var phone = phoneString(phoneEl.value);
      qerr.textContent = '';
      ready.textContent = '';
      if (!name){ qerr.textContent = COPY.errName; nameEl.focus(); return; }
      if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(String(phoneEl.value).replace(/\s/g,''))){ qerr.textContent = COPY.errPhone; phoneEl.focus(); return; }
      if (!agreeEl.checked){ qerr.textContent = COPY.errAgree; agreeEl.focus(); return; }
      trackNaver('submit');
      var place = qform.getAttribute('data-place') || 'form';
      var qbtn = qform.querySelector('button[type="submit"]');
      if (!FORM_ENDPOINT){ qerr.textContent = COPY.errFail; return; }
      qbtn.disabled = true;
      qbtn.textContent = COPY.sending;
      var body = JSON.stringify(quickPayload(qform, name, phone, place));
      postLead(body, function(okSend){
        qbtn.disabled = false;
        qbtn.textContent = COPY.send;
        if (!okSend){ qerr.textContent = COPY.errFail; return; }
        ready.textContent = COPY.sentForm;
      });
    });
  });

  (function(){
    var source = document.getElementById('storySource');
    var stage = document.getElementById('flowStage');
    var flow = document.getElementById('flow');
    if (!source || !stage) return;
    var items = Array.prototype.slice.call(source.querySelectorAll('article')).map(function(el){
      return {
        img: el.getAttribute('data-img'),
        title: el.getAttribute('data-title'),
        summary: el.getAttribute('data-summary'),
        issue: el.querySelector('[data-part="issue"]').textContent,
        act: el.querySelector('[data-part="act"]').textContent,
        result: el.querySelector('[data-part="result"]').textContent
      };
    });
    var index = 0, paused = false, timer = null, reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var storyModal = document.getElementById('storyModal');
    var cards = items.map(function(item){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'flow-card';
      btn.style.backgroundImage = 'url("' + item.img + '")';
      btn.setAttribute('aria-label', item.title);
      var shade = document.createElement('span');
      shade.className = 'shade';
      var name = document.createElement('strong');
      name.textContent = item.title;
      shade.appendChild(name);
      var sum = document.createElement('span');
      sum.className = 'ex';
      sum.textContent = item.summary;
      shade.appendChild(sum);
      btn.appendChild(shade);
      btn.addEventListener('click', function(){
        var d = Number(btn.getAttribute('data-d'));
        if (d !== 0) { go(d); return; }
        openStory(item);
      });
      stage.appendChild(btn);
      return btn;
    });
    function mod(n){ return (n + items.length) % items.length; }
    function render(){
      var step = window.innerWidth < 800 ? 128 : 176;
      items.forEach(function(item, i){
        var btn = cards[i];
        var d = i - index;
        if (d > items.length/2) d -= items.length;
        if (d < -items.length/2) d += items.length;
        btn.setAttribute('data-d', String(d));
        if (Math.abs(d) > 2){ btn.hidden = true; return; }
        btn.hidden = false;
        var scale = d === 0 ? 1 : Math.abs(d) === 1 ? 0.78 : 0.64;
        btn.style.transform = 'translateX(' + (d * step) + 'px) scale(' + scale + ')';
        btn.style.zIndex = String(5 - Math.abs(d));
        btn.style.filter = d === 0 ? 'none' : 'brightness(' + (Math.abs(d)===1 ? 0.62 : 0.42) + ')';
      });
    }
    function go(step){ index = mod(index + step); render(); }
    function start(){
      stop();
      if (reduced || paused) return;
      timer = setInterval(function(){ go(1); }, 4200);
    }
    function stop(){ if (timer) clearInterval(timer); timer = null; }
    function openStory(item){
      document.getElementById('storyTitle').textContent = item.title;
      document.getElementById('storyIssue').textContent = item.issue;
      document.getElementById('storyAct').textContent = item.act;
      document.getElementById('storyResult').textContent = item.result;
      storyModal.hidden = false;
      document.getElementById('storyClose').focus();
      paused = true;
      stop();
    }
    function closeStory(){
      storyModal.hidden = true;
      paused = false;
      flow.focus();
      start();
    }
    document.getElementById('flowPrev').addEventListener('click', function(){ go(-1); });
    document.getElementById('flowNext').addEventListener('click', function(){ go(1); });
    flow.addEventListener('keydown', function(e){
      if (e.key === 'ArrowLeft'){ e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight'){ e.preventDefault(); go(1); }
    });
    flow.addEventListener('mouseenter', stop);
    flow.addEventListener('mouseleave', start);
    var touchX = null;
    stage.addEventListener('touchstart', function(e){ touchX = e.changedTouches[0].clientX; }, {passive:true});
    stage.addEventListener('touchend', function(e){
      if (touchX == null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (dx > 40) go(-1);
      else if (dx < -40) go(1);
      touchX = null;
    });
    document.getElementById('storyClose').addEventListener('click', closeStory);
    storyModal.addEventListener('click', function(e){ if (e.target === storyModal) closeStory(); });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && storyModal && !storyModal.hidden) closeStory();
    });
    window.addEventListener('resize', render);
    render();
    start();
  })();

  (function(){
    var btn = document.getElementById('thanksMore');
    var section = document.getElementById('thanks');
    var more = document.querySelectorAll('#thanksBoard .more');
    if (!btn || !section || !more.length) return;
    var narrow = window.matchMedia('(max-width: 768px)');
    function label(open){
      if (open) return COPY.fold;
      return narrow.matches ? COPY.moreShort : COPY.moreLong;
    }
    function paint(){
      var open = btn.getAttribute('aria-expanded') === 'true';
      section.classList.toggle('show-all', open && narrow.matches);
      btn.textContent = label(open);
    }
    btn.addEventListener('click', function(){
      var open = btn.getAttribute('aria-expanded') === 'true';
      more.forEach(function(el){ el.hidden = open; });
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      paint();
      if (open) btn.focus();
    });
    if (narrow.addEventListener) narrow.addEventListener('change', paint);
    else if (narrow.addListener) narrow.addListener(paint);
    paint();
  })();

  document.querySelectorAll('.tabs button').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.tabs button').forEach(function(b){ b.setAttribute('aria-pressed','false'); });
      btn.setAttribute('aria-pressed','true');
      var f = btn.getAttribute('data-filter');
      document.querySelectorAll('#faqList details').forEach(function(d){
        d.hidden = f !== 'all' && d.getAttribute('data-cat') !== f;
      });
    });
  });
})();
