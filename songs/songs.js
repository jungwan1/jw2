(function () {
  "use strict";
  document.querySelectorAll("[data-open-verse]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var verse = btn.closest(".verse");
      if (!verse) return;
      var boxes = verse.querySelectorAll("details.gram");
      if (!boxes.length) return;
      var openAll = !Array.prototype.every.call(boxes, function (d) {
        return d.open;
      });
      Array.prototype.forEach.call(boxes, function (d) {
        d.open = openAll;
      });
      btn.textContent = openAll ? "이 절 문법 닫기" : "이 절 문법 모두 열기";
    });
  });
})();
