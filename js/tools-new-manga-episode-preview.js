(() => {
  "use strict";
  const app = document.querySelector("[data-preview-app]");
  if (!app) return;
  const renderer = window.CrasherTextLayerRenderer;
  const episodes = window.CRASHER_MANGA_EPISODES || {};
  const pagesRoot = app.querySelector("[data-pages]");
  const summary = app.querySelector("[data-summary]");
  const title = app.querySelector("[data-title]");
  const episodeSelect = app.querySelector("[data-episode-select]");
  const textToggle = app.querySelector("[data-text-toggle]");
  const debugToggle = app.querySelector("[data-debug-toggle]");
  const artBase = app.dataset.artBase;
  const jsonRoot = app.dataset.jsonRoot;
  function jsonUrl(episode, page) { return `${jsonRoot}${episode}/zh-tw/v01/c_nwf_ch02_${episode}_${page}_text_zh-tw_v01.json`; }
  function checkPage(section) {
    const stage = section.querySelector(".preview-stage");
    const data = section.previewDocument;
    if (!data || !renderer) return;
    const overflowIds = [];
    data.boxes.forEach((box) => {
      const node = section.querySelector(`[data-box-id="${CSS.escape(box.id)}"]`);
      if (!node) return;
      node.style.fontSize = `${renderer.scaledFontSize(stage, data, box)}px`;
      const overflow = !renderer.fits(node);
      node.classList.toggle("is-overflowing", overflow);
      if (overflow) overflowIds.push(box.id);
    });
    const status = section.querySelector("[data-page-status]");
    status.textContent = overflowIds.length ? `overflow: ${overflowIds.join(", ")}` : `${data.boxes.length} boxes · no overflow`;
    status.className = overflowIds.length ? "is-error" : "is-ok";
  }
  async function loadText(episode, page) {
    const response = await fetch(jsonUrl(episode, page), { cache: "no-store" });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`${page} JSON ${response.status}`);
    const data = await response.json();
    if (data.episode !== episode || data.page !== page || data.locale !== "zh-tw") throw new Error(`${page} JSON metadata mismatch`);
    return data;
  }
  async function createPage(episode, page, config) {
    const section = document.createElement("section");
    section.className = "preview-page";
    section.dataset.page = page;
    const heading = document.createElement("div");
    heading.className = "page-heading";
    const pageTitle = document.createElement("h2");
    pageTitle.textContent = `${config.label}${config.assetType === "cover" ? " · COVER" : ""}`;
    const status = document.createElement("span");
    status.dataset.pageStatus = "";
    status.textContent = "rendering";
    heading.append(pageTitle, status);
    const stage = document.createElement("div");
    stage.className = "preview-stage";
    stage.style.aspectRatio = `${config.width} / ${config.height}`;
    const image = document.createElement("img");
    image.src = `${artBase}${config.artAsset}`;
    image.width = config.width;
    image.height = config.height;
    image.alt = `${episode.toUpperCase()} ${config.label} clean art`;
    const layer = document.createElement("div");
    layer.className = "preview-layer";
    stage.append(image, layer);
    section.append(heading, stage);
    pagesRoot.append(section);
    image.addEventListener("error", () => { status.textContent = "image load error"; status.className = "is-error"; }, { once: true });
    const data = await loadText(episode, page);
    section.previewDocument = data;
    if (data) {
      renderer.render(stage, layer, data, "preview-box", false);
      checkPage(section);
      new ResizeObserver(() => checkPage(section)).observe(stage);
    } else {
      status.textContent = `${config.status || "yes"} · clean art only`;
      status.className = config.status === "conditional" ? "is-warning" : "is-ok";
    }
    return section;
  }
  async function initialize(episode) {
    const config = episodes[episode] || episodes.ep21;
    pagesRoot.replaceChildren();
    title.textContent = `${episode.toUpperCase()} · Internal Preview · tools_new`;
    summary.textContent = "Loading...";
    const entries = Object.entries(config.pages);
    const results = await Promise.allSettled(entries.map(([page, pageConfig]) => createPage(episode, page, pageConfig)));
    const sections = [...pagesRoot.querySelectorAll(".preview-page")];
    const loaded = results.filter((result) => result.status === "fulfilled").length;
    const textPages = sections.filter((section) => section.previewDocument).length;
    const boxes = sections.reduce((total, section) => total + (section.previewDocument?.boxes.length || 0), 0);
    summary.textContent = `${loaded}/${entries.length} pages · ${textPages} text pages · ${boxes} boxes`;
    if (loaded !== entries.length) summary.textContent += " · load error";
    const url = new URL(window.location.href);
    url.searchParams.set("episode", episode);
    history.replaceState(null, "", url);
  }
  episodeSelect.replaceChildren(...Object.keys(episodes).map((episode) => { const option=document.createElement("option"); option.value=episode; option.textContent=episode.toUpperCase(); return option; }));
  episodeSelect.addEventListener("change", () => initialize(episodeSelect.value));
  textToggle.addEventListener("change", (event) => app.querySelectorAll(".preview-layer").forEach((layer) => layer.classList.toggle("is-hidden", !event.target.checked)));
  debugToggle.addEventListener("change", (event) => app.classList.toggle("is-debug", event.target.checked));
  const requested = new URL(window.location.href).searchParams.get("episode");
  episodeSelect.value = episodes[requested] ? requested : "ep21";
  initialize(episodeSelect.value).catch((error) => { summary.textContent = `Load error: ${error.message}`; });
})();
