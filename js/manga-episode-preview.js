(() => {
  "use strict";

  const app = document.querySelector("[data-preview-app]");
  if (!app) return;

  const pagesRoot = app.querySelector("[data-pages]");
  const summary = app.querySelector("[data-summary]");
  const jsonBase = app.dataset.jsonBase;
  const artBase = app.dataset.artBase;
  const pages = Array.from(
    { length: 10 },
    (_, index) => `p${String(index + 1).padStart(2, "0")}`,
  );

  function filenameFor(page) {
    return `c_nwf_ch02_ep21_${page}_text_zh-tw_v01.json`;
  }

  function scaledFontSize(stage, data, box) {
    return Math.max(
      6,
      Number(box.style.fontSize) * (stage.clientWidth / Number(data.source.width)),
    );
  }

  function createBox(stage, data, box) {
    const node = document.createElement("div");
    node.className = "preview-box";
    node.dataset.boxId = box.id;
    node.dataset.shape = box.shape;
    node.style.left = `${box.box.x}%`;
    node.style.top = `${box.box.y}%`;
    node.style.width = `${box.box.width}%`;
    node.style.height = `${box.box.height}%`;
    node.style.fontSize = `${scaledFontSize(stage, data, box)}px`;
    node.style.lineHeight = String(box.style.lineHeight);
    node.style.writingMode = box.style.writingMode;
    node.style.color = box.style.color;
    const text = document.createElement("span");
    text.textContent = box.text;
    node.append(text);
    return node;
  }

  function checkPage(section) {
    const stage = section.querySelector(".preview-stage");
    const data = section.previewDocument;
    const overflowIds = [];
    data.boxes.forEach((box) => {
      const node = section.querySelector(
        `[data-box-id="${CSS.escape(box.id)}"]`,
      );
      if (!node) return;
      node.style.fontSize = `${scaledFontSize(stage, data, box)}px`;
      const text = node.querySelector("span");
      const overflow = text.scrollWidth > text.clientWidth ||
        text.scrollHeight > text.clientHeight;
      node.classList.toggle("is-overflowing", overflow);
      if (overflow) overflowIds.push(box.id);
    });
    const status = section.querySelector("[data-page-status]");
    status.textContent = overflowIds.length
      ? `overflow: ${overflowIds.join(", ")}`
      : `${data.boxes.length} boxes · no overflow`;
    status.className = overflowIds.length ? "is-error" : "is-ok";
  }

  async function createPage(page) {
    const response = await fetch(`${jsonBase}${filenameFor(page)}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`${page} JSON ${response.status}`);
    const data = await response.json();
    const section = document.createElement("section");
    section.className = "preview-page";
    section.dataset.page = page;
    section.previewDocument = data;

    const heading = document.createElement("div");
    heading.className = "page-heading";
    const title = document.createElement("h2");
    title.textContent = page.toUpperCase();
    const status = document.createElement("span");
    status.dataset.pageStatus = "";
    status.textContent = "rendering";
    heading.append(title, status);

    const stage = document.createElement("div");
    stage.className = "preview-stage";
    stage.style.aspectRatio = `${data.source.width} / ${data.source.height}`;
    const image = document.createElement("img");
    image.src = `${artBase}${data.source.artAsset}`;
    image.width = data.source.width;
    image.height = data.source.height;
    image.alt = `JP21 ${page.toUpperCase()} clean art`;
    const layer = document.createElement("div");
    layer.className = "preview-layer";
    stage.append(image, layer);
    section.append(heading, stage);
    pagesRoot.append(section);

    await image.decode();
    layer.replaceChildren(...data.boxes.map((box) => createBox(stage, data, box)));
    checkPage(section);
    new ResizeObserver(() => checkPage(section)).observe(stage);
    return section;
  }

  async function initialize() {
    const results = await Promise.allSettled(pages.map(createPage));
    const loaded = results.filter((result) => result.status === "fulfilled").length;
    const boxes = [...pagesRoot.querySelectorAll(".preview-page")]
      .reduce((total, section) => total + section.previewDocument.boxes.length, 0);
    summary.textContent = `${loaded}/10 pages · ${boxes} boxes · zh-tw v01 candidate`;
    if (loaded !== 10) summary.textContent += " · load error";
  }

  app.querySelector("[data-text-toggle]").addEventListener("change", (event) => {
    app.querySelectorAll(".preview-layer").forEach((layer) => {
      layer.classList.toggle("is-hidden", !event.target.checked);
    });
  });
  app.querySelector("[data-debug-toggle]").addEventListener("change", (event) => {
    app.classList.toggle("is-debug", event.target.checked);
  });
  initialize().catch((error) => {
    summary.textContent = `載入失敗：${error.message}`;
  });
})();
