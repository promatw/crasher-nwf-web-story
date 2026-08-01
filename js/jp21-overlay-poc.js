(() => {
  const reader = document.querySelector("[data-jp21-reader]");
  const dataNode = document.querySelector("#jp21-overlay-data");
  if (!reader || !dataNode) return;

  const parsedData = JSON.parse(dataNode.textContent);
  const pages = typeof parsedData === "string" ? JSON.parse(parsedData) : parsedData;
  const params = new URLSearchParams(window.location.search);
  const targetPage = params.get("page");
  const pageMap = new Map(pages.map((page) => [page.page, page]));
  const languageButtons = [...reader.querySelectorAll("[data-language]")];
  const overlayToggle = reader.querySelector("[data-overlay-toggle]");
  const debugToggle = reader.querySelector("[data-debug-toggle]");
  const status = reader.querySelector("[data-reader-status]");
  let language = params.get("lang") === "ja-JP" ? "ja-JP" : "zh-TW";
  overlayToggle.checked = params.get("overlay") !== "0";
  debugToggle.checked = params.get("debug") === "1";

  const applyAreaStyle = (node, area) => {
    const override = area.layoutOverrides?.[language] || {};
    const style = { ...area.style, ...override };
    const box = area.box;

    node.style.left = `${box.x}%`;
    node.style.top = `${box.y}%`;
    node.style.width = `${box.w}%`;
    node.style.height = `${box.h}%`;
    node.style.color = style.color;
    node.style.background = style.background;
    node.style.writingMode = style.writingMode || "horizontal-tb";
    node.style.fontSize = `clamp(11px, ${style.fontSize / 1024 * 100}vw, ${style.fontSize}px)`;
    node.style.lineHeight = style.lineHeight;
  };

  const render = () => {
    reader.dataset.language = language;
    reader.classList.toggle("is-overlay-hidden", !overlayToggle.checked);
    reader.classList.toggle("is-debug", debugToggle.checked);
    let overflowCount = 0;

    reader.querySelectorAll("[data-page]").forEach((pageNode) => {
      const isTarget = !targetPage || pageNode.dataset.page === targetPage;
      pageNode.hidden = !isTarget;
      if (!isTarget) return;

      const page = pageMap.get(pageNode.dataset.page);
      const overlay = pageNode.querySelector(".jp21-overlay");
      overlay.replaceChildren();

      page.textAreas.forEach((area) => {
        const text = area.text[language] || area.text[page.defaultLanguage] || "";
        const node = document.createElement("div");
        node.className = `jp21-text jp21-text--${area.type}`;
        node.dataset.areaId = area.id;
        node.lang = language;
        node.textContent = text;
        applyAreaStyle(node, area);
        overlay.append(node);
        const overflow = node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1;
        node.dataset.overflow = String(overflow);
        node.dataset.clientSize = `${node.clientWidth}x${node.clientHeight}`;
        node.dataset.scrollSize = `${node.scrollWidth}x${node.scrollHeight}`;
        if (overflow) overflowCount += 1;
      });
    });

    reader.dataset.overflowCount = String(overflowCount);

    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === language));
    });

    const languageLabel = language === "zh-TW" ? "繁中" : "日本語";
    const overlayLabel = overlayToggle.checked ? "文字圖層開啟" : "Clean art";
    status.textContent = `${languageLabel}・${overlayLabel}${debugToggle.checked ? "・Debug" : ""}`;
  };

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      language = button.dataset.language;
      render();
    });
  });
  overlayToggle.addEventListener("change", render);
  debugToggle.addEventListener("change", render);

  render();
})();

