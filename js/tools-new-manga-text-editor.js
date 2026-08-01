(() => {
  "use strict";

  const app = document.querySelector("[data-editor-app]");
  if (!app) return;

  const episodes = window.CRASHER_MANGA_EPISODES || window.CRASHER_MANGA_NEW_EPISODES || {};
  const imageBase = "/crasher-nwf-web-story/images/manga_new/editor/";

    const seedBase = "/crasher-nwf-web-story/data/manga_new/editor/seeds/";
  const seedCache = new Map();
const els = {
    subtitle: app.querySelector(".subtitle"),
    saveState: app.querySelector("[data-save-state]"),
    episodeSwitch: app.querySelector("[data-episode-switch]"),
    pageSwitch: app.querySelector("[data-page-switch]"),
    stage: app.querySelector("[data-stage]"),
    art: app.querySelector("[data-art]"),
    layer: app.querySelector("[data-text-layer]"),
    frame: app.querySelector("[data-preview-frame]"),
    filename: app.querySelector("[data-filename]"),
    metadataSummary: app.querySelector("[data-metadata-summary]"),
    boxList: app.querySelector("[data-box-list]"),
    empty: app.querySelector("[data-empty-state]"),
    selectedId: app.querySelector("[data-selected-id]"),
    text: app.querySelector("[data-box-text]"),
    type: app.querySelector("[data-box-type]"),
    speaker: app.querySelector("[data-box-speaker]"),
    readingOrder: app.querySelector("[data-reading-order]"),
    fontSize: app.querySelector("[data-font-size]"),
    shape: app.querySelector("[data-box-shape]"),
    textAlign: app.querySelector("[data-text-align]"),
    note: app.querySelector("[data-box-note]"),
    readingOrderStatus: app.querySelector("[data-reading-order-status]"),
    overflow: app.querySelector("[data-overflow-status]"),
    status: app.querySelector("[data-app-status]"),
    utfInput: app.querySelector("[data-utf-input]"),
    utfStatus: app.querySelector("[data-utf-status]"),
    importInput: app.querySelector("[data-import]"),
    seedList: app.querySelector("[data-seed-list]"),
    seedStatus: app.querySelector("[data-seed-status]")
  };

  let state = null;
  let selectedBoxId = null;
  let interaction = null;
  let isDirty = false;

  function firstEpisode() {
    return episodes.ep21 ? "ep21" : Object.keys(episodes)[0];
  }

  function firstPage(ep) {
    return Object.keys(episodes[ep]?.pages || {})[0];
  }

  function pageConfig(ep = state.episode, page = state.page) {
    return episodes[ep]?.pages?.[page];
  }

  function pageBase(page = state.page, ep = state.episode) {
    return `c_nwf_ch02_${ep}_${page}`;
  }

  function filename() {
    return `${pageBase()}_text_${state.locale}_${state.version}.json`;
  }

  function storageKey(doc = state) {
    return `tools_new_${doc.project}_${doc.chapter}_${doc.episode}_${doc.page}_${doc.locale}_editorState_${doc.version}`;
  }

  function createDefaultState(ep = firstEpisode(), page = firstPage(ep)) {
    const ec = episodes[ep];
    const pc = ec.pages[page];
    return {
      schemaVersion: "0.1",
      project: "crasher-nwf",
      chapter: ec.chapter || "ch02",
      episode: ep,
      page,
      version: ec.version || "v01",
      locale: ec.locale || "zh-tw",
      source: {
        sourceName: pc.sourceName || pc.artAsset,
        artAsset: pc.artAsset,
        width: pc.width,
        height: pc.height,
        assetType: pc.assetType || "manga-page",
        readyForTextLayerEditor: pc.status || "yes",
        textLayerOptional: Boolean(pc.textLayerOptional),
        readingIndex: pc.readingIndex || null,
        pageCode: pc.pageCode || page
      },
      editor: { nextBoxNumber: 1 },
      boxes: []
    };
  }

  function createBox(num = state.editor.nextBoxNumber) {
    const n = String(num).padStart(2, "0");
    return {
      id: `${pageBase()}_b${n}`,
      type: "caption",
      shape: "text-only",
      text: "",
      box: {
        x: 5 + ((num - 1) % 5) * 4,
        y: 5 + ((num - 1) % 5) * 4,
        width: 30,
        height: 10,
        unit: "percent"
      },
      style: {
        fontSize: 32,
        lineHeight: 1.25,
        writingMode: "horizontal-tb",
        textAlign: "left",
        verticalAlign: "middle",
        fontFamily: "system-cjk",
        color: "#111111",
        background: "transparent",
        border: "none"
      },
      readingOrder: num,
      speaker: null,
      note: ""
    };
  }

  function setStatus(message, kind = "ok") {
    if (!els.status) return;
    els.status.textContent = message;
    els.status.className = `status-line is-${kind}`;
  }

  function setDirty(dirty = true, cleanLabel = "已載入") {
    isDirty = dirty;
    els.saveState.textContent = dirty ? "未匯出" : cleanLabel;
    els.saveState.className = `save-state is-${dirty ? "dirty" : "loaded"}`;
  }

  function saveLocal(markDirty = true) {
    localStorage.setItem(storageKey(), JSON.stringify(state));
    if (markDirty) setDirty(true);
  }

  function loadLocal() {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return false;
    try {
      state = validate(JSON.parse(raw));
      selectedBoxId = state.boxes[0]?.id || null;
      return true;
    } catch (error) {
      localStorage.removeItem(storageKey());
      return false;
    }
  }

  function normalizeBox(box, index, doc = state) {
    const base = createBox(index);
    const id = box.id || `${pageBase(doc.page, doc.episode)}_b${String(index).padStart(2, "0")}`;
    return {
      ...base,
      ...box,
      id,
      type: box.type || base.type,
      shape: box.shape || "text-only",
      text: String(box.text || ""),
      box: { ...base.box, ...(box.box || {}), unit: "percent" },
      style: (() => {
        const style = { ...base.style, ...(box.style || {}) };
        if (!box.style || !Object.prototype.hasOwnProperty.call(box.style, "textAlign")) style.textAlign = "center";
        return style;
      })(),
      readingOrder: Math.max(1, Number(box.readingOrder) || index),
      speaker: box.speaker || null,
      note: String(box.note || "")
    };
  }

  function validate(doc) {
    if (!doc || doc.schemaVersion !== "0.1") throw new Error("schemaVersion must be 0.1");
    if (!episodes[doc.episode]?.pages?.[doc.page]) throw new Error("unknown episode/page");
    const base = createDefaultState(doc.episode, doc.page);
    doc.project = doc.project || base.project;
    doc.chapter = doc.chapter || base.chapter;
    doc.version = doc.version || base.version;
    doc.locale = doc.locale || base.locale;
    doc.source = { ...(doc.source || {}), ...base.source };
    doc.editor = { nextBoxNumber: 1, ...(doc.editor || {}) };
    doc.boxes = Array.isArray(doc.boxes) ? doc.boxes.map((box, index) => normalizeBox(box, index + 1, doc)) : [];
    const next = doc.boxes.reduce((max, box) => Math.max(max, Number((box.id.match(/_b(\d+)$/) || [])[1] || 0) + 1), 1);
    doc.editor.nextBoxNumber = Math.max(doc.editor.nextBoxNumber || 1, next);
    return doc;
  }

  function selectedBox() {
    return state.boxes.find((box) => box.id === selectedBoxId) || null;
  }

  function scaleFont(size) {
    const renderedWidth = els.stage.getBoundingClientRect().width || state.source.width || 1024;
    return Math.max(6, Number(size || 32) * renderedWidth / Number(state.source.width || 1024));
  }

  function renderEpisodeButtons() {
    const buttons = Object.entries(episodes).map(([episodeKey, config]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.episodeSelect = episodeKey;
      button.textContent = config.label || episodeKey.toUpperCase();
      button.classList.toggle("is-active", episodeKey === state.episode);
      return button;
    });
    els.episodeSwitch.replaceChildren(...buttons);
  }

  function renderPageButtons() {
    const buttons = Object.entries(episodes[state.episode].pages).map(([page, config]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.pageSelect = page;
      button.textContent = config.label || page;
      button.classList.toggle("is-active", page === state.page);
      if (config.assetType === "cover") button.title = "cover";
      return button;
    });
    els.pageSwitch.replaceChildren(...buttons);
  }


  async function getSeedDoc(episode) {
    const config = episodes[episode];
    if (!config?.seedEnabled || !config.seedPath) return null;
    if (seedCache.has(episode)) return seedCache.get(episode);
    const response = await fetch(`${seedBase}${config.seedPath}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`seed fetch failed: ${response.status}`);
    const doc = await response.json();
    seedCache.set(episode, doc);
    return doc;
  }

  function seedItemsForPage(doc, page) {
    if (!doc?.pages) return [];
    const value = doc.pages[page] || [];
    return Array.isArray(value) ? value : [value];
  }

  function seedButton(seed) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "seed-candidate-button";
    button.dataset.applySeed = seed.seedId || "";
    button.addEventListener("click", () => applySeed(seed.seedId || ""));
    button.textContent = `${seed.readingOrder || "?"}. ${seed.text || ""}`;
    const meta = document.createElement("small");
    meta.textContent = `${seed.type || "unknown"} · ${seed.speaker || "unknown"} · ${seed.confidence || "inferred"}${seed.needsReview ? " · needs HM review" : ""}`;
    button.append(document.createElement("br"), meta);
    return button;
  }

  async function renderSeedPanel() {
    els.seedList.replaceChildren();
    const config = episodes[state.episode];
    if (!config?.seedEnabled) {
      els.seedStatus.textContent = `Seed disabled: ${config?.seedTextStatus || "missing"}`;
      els.seedStatus.className = "status-line";
      return;
    }
    els.seedStatus.textContent = "Seed loading...";
    try {
      const doc = await getSeedDoc(state.episode);
      if (doc.episode !== state.episode || doc.locale !== state.locale) {
        els.seedStatus.textContent = `Seed metadata mismatch: ${doc.episode || "?"} / ${doc.locale || "?"}`;
        els.seedStatus.className = "status-line is-error";
        return;
      }
      const items = seedItemsForPage(doc, state.page);
      const omittedCount = Array.isArray(doc.omittedCandidates) ? doc.omittedCandidates.length : 0;
      if (!items.length) {
        els.seedStatus.textContent = `Seed loaded: ${doc.seedTextStatus || "unknown"}; no candidates on ${state.page}; omitted ${omittedCount}`;
        els.seedStatus.className = "status-line is-ok";
        return;
      }
      els.seedList.replaceChildren(...items.map(seedButton));
      els.seedStatus.textContent = `Seed loaded: ${doc.seedTextStatus || "unknown"}; ${items.length} candidates on ${state.page}; omitted ${omittedCount}; manual apply only`;
      els.seedStatus.className = "status-line is-ok";
    } catch (error) {
      els.seedStatus.textContent = `Seed load failed: ${error.message}`;
      els.seedStatus.className = "status-line is-error";
    }
  }

  async function applySeed(seedId) {
    const box = selectedBox();
    if (!box) {
      setStatus("請先選取一個文字框，再套用候選台詞。", "error");
      return;
    }
    const doc = await getSeedDoc(state.episode);
    const seed = seedItemsForPage(doc, state.page).find((item) => item.seedId === seedId);
    if (!seed) return;
    if (box.text && box.text !== seed.text) {
      const ok = confirm("目前文字框已有文字。是否用 seed candidate 覆蓋這個選取框？");
      if (!ok) return;
    }
    const nextNote = [seed.note, seed.confidence ? `confidence=${seed.confidence}` : "", seed.needsReview ? "needsReview=true" : ""].filter(Boolean).join("; ");
    const nextReadingOrder = Number(seed.readingOrder) || box.readingOrder;
    const changed = box.text !== (seed.text || "") || box.type !== (seed.type || box.type) || box.speaker !== (seed.speaker || null) || box.readingOrder !== nextReadingOrder || box.note !== nextNote;
    if (!changed) {
      setStatus(`候選已在 ${box.id}，未變更。`);
      return;
    }
    box.text = seed.text || "";
    box.type = seed.type || box.type;
    box.speaker = seed.speaker || null;
    box.readingOrder = nextReadingOrder;
    box.note = nextNote;
    saveLocal(true);
    render();
    setStatus(`已手動套用 ${seed.seedId} 到 ${box.id}`);
  }
  function renderMeta() {
    app.querySelectorAll("[data-meta]").forEach((input) => {
      input.value = state[input.dataset.meta] || "";
    });
    const pc = pageConfig();
    els.filename.textContent = filename();
    els.subtitle.textContent = `${state.episode.toUpperCase()} ${pc.label || state.page} · ${state.locale} · ${state.source.assetType || "manga-page"}${episodes[state.episode].seedEnabled ? "" : " · seed disabled"}`;
    const rows = [
      ["project", state.project],
      ["chapter", state.chapter],
      ["episode", state.episode],
      ["page", state.page],
      ["locale", state.locale],
      ["version", state.version],
      ["artAsset", state.source.artAsset],
      ["assetType", state.source.assetType],
      ["ready", state.source.readyForTextLayerEditor],
      ["box count", String(state.boxes.length)]
    ];
    els.metadataSummary.replaceChildren(...rows.flatMap(([key, value]) => {
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = key;
      dd.textContent = value == null ? "" : String(value);
      return [dt, dd];
    }));
    renderSeedPanel();
  }

  function boxNode(box) {
    const node = document.createElement("div");
    node.className = "edit-box";
    node.dataset.boxId = box.id;
    node.dataset.shape = box.shape || "text-only";
    node.classList.toggle("is-selected", box.id === selectedBoxId);
    Object.assign(node.style, {
      left: `${box.box.x}%`,
      top: `${box.box.y}%`,
      width: `${box.box.width}%`,
      height: `${box.box.height}%`,
      fontSize: `${scaleFont(box.style.fontSize)}px`,
      lineHeight: String(box.style.lineHeight || 1.25),
      writingMode: box.style.writingMode || "horizontal-tb",
      textAlign: box.style.textAlign || "center",
      color: box.style.color || "#111111"
    });
    const text = document.createElement("span");
    text.className = "box-text";
    text.textContent = box.text;
    const id = document.createElement("span");
    id.className = "box-id";
    id.textContent = box.id;
    const handle = document.createElement("span");
    handle.className = "resize-handle";
    node.append(text, id, handle);
    return node;
  }

  function renderBoxes() {
    els.layer.replaceChildren(...state.boxes.map(boxNode));
  }

  function renderList() {
    const items = [...state.boxes]
      .sort((a, b) => a.readingOrder - b.readingOrder || a.id.localeCompare(b.id))
      .map((box) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.selectBox = box.id;
        button.classList.toggle("is-active", box.id === selectedBoxId);
        button.textContent = `${box.readingOrder}. ${box.id} ${box.shape}`;
        return button;
      });
    els.boxList.replaceChildren(...items);
    els.empty.hidden = state.boxes.length > 0;
  }

  function renderControls() {
    const box = selectedBox();
    const disabled = !box;
    [els.text, els.type, els.speaker, els.readingOrder, els.fontSize, els.shape, els.textAlign, els.note].forEach((field) => {
      if (field) field.disabled = disabled;
    });
    app.querySelectorAll("[data-coordinate-input]").forEach((input) => { input.disabled = disabled; });
    if (!box) {
      els.selectedId.textContent = "";
      els.text.value = "";
      els.speaker.value = "";
      els.readingOrder.value = "";
      els.fontSize.value = "";
      if (els.textAlign) els.textAlign.value = "left";
      els.note.value = "";
      app.querySelectorAll("[data-coordinate-input]").forEach((input) => { input.value = ""; });
      return;
    }
    els.selectedId.textContent = box.id;
    els.text.value = box.text;
    els.type.value = box.type;
    els.speaker.value = box.speaker || "";
    els.readingOrder.value = box.readingOrder;
    els.fontSize.value = box.style.fontSize;
    els.shape.value = box.shape || "text-only";
    if (els.textAlign) els.textAlign.value = box.style.textAlign || "center";
    els.note.value = box.note || "";
    app.querySelectorAll("[data-coordinate-input]").forEach((input) => {
      input.value = Number(box.box[input.dataset.coordinateInput]).toFixed(2);
    });
  }

  function checkReadingOrder() {
    const seen = new Map();
    const duplicates = [];
    state.boxes.forEach((box) => {
      const order = String(box.readingOrder);
      if (seen.has(order)) duplicates.push(order);
      seen.set(order, box.id);
    });
    els.readingOrderStatus.textContent = duplicates.length ? `readingOrder 重複：${[...new Set(duplicates)].join(", ")}` : "readingOrder 正常";
    els.readingOrderStatus.className = `status-line is-${duplicates.length ? "error" : "ok"}`;
  }

  function checkOverflow() {
    const ids = [];
    state.boxes.forEach((box) => {
      const node = els.layer.querySelector(`[data-box-id="${CSS.escape(box.id)}"]`);
      if (!node) return;
      const text = node.querySelector(".box-text");
      const overflow = text.scrollWidth > text.clientWidth || text.scrollHeight > text.clientHeight;
      node.classList.toggle("is-overflowing", overflow);
      if (overflow) ids.push(box.id);
    });
    els.overflow.textContent = ids.length ? `overflow: ${ids.join(", ")}` : `${state.boxes.length} boxes · no overflow`;
    els.overflow.className = `status-line is-${ids.length ? "error" : "ok"}`;
    return ids;
  }

  function render() {
    renderEpisodeButtons();
    renderPageButtons();
    renderMeta();
    els.stage.style.aspectRatio = `${state.source.width} / ${state.source.height}`;
    els.art.src = `${imageBase}${state.source.artAsset}`;
    els.art.width = state.source.width;
    els.art.height = state.source.height;
    els.art.alt = `${state.episode.toUpperCase()} ${state.page} clean art`;
    renderBoxes();
    renderList();
    renderControls();
    checkReadingOrder();
    requestAnimationFrame(checkOverflow);
  }

  function loadPage(page) {
    if (!episodes[state.episode].pages[page] || page === state.page) return;
    state = createDefaultState(state.episode, page);
    selectedBoxId = null;
    loadLocal();
    render();
    setDirty(false);
    setStatus(`已切換 ${state.episode.toUpperCase()} ${page}`);
  }

  function loadEpisode(ep) {
    if (!episodes[ep] || ep === state.episode) return;
    state = createDefaultState(ep, firstPage(ep));
    selectedBoxId = null;
    loadLocal();
    render();
    setDirty(false);
    setStatus(`已切換 ${ep.toUpperCase()}`);
  }

  function updateSelected(change, rerender = false) {
    const box = selectedBox();
    if (!box) return;
    change(box);
    saveLocal(true);
    if (rerender) render();
    else {
      renderBoxes();
      renderList();
      renderControls();
      checkReadingOrder();
      checkOverflow();
    }
  }

  function addBox() {
    const box = createBox(state.editor.nextBoxNumber++);
    state.boxes.push(box);
    selectedBoxId = box.id;
    saveLocal(true);
    render();
    setStatus(`已新增 ${box.id}`);
  }

  function removeBox() {
    const box = selectedBox();
    if (!box) return;
    state.boxes = state.boxes.filter((item) => item.id !== box.id);
    selectedBoxId = state.boxes[0]?.id || null;
    saveLocal(true);
    render();
    setStatus(`已移除 ${box.id}`);
  }

  function exportJson() {
    const exportDoc = { ...state };
    delete exportDoc.editor;
    const json = JSON.stringify(exportDoc, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename();
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setDirty(false, "已匯出");
    setStatus(`已匯出：${filename()}`);
  }

  async function importJson(file) {
    if (!file) return;
    try {
      const text = (await file.text()).replace(/^\uFEFF/, "");
      const doc = validate(JSON.parse(text));
      if (doc.episode !== state.episode || doc.page !== state.page) {
        const ok = confirm(`匯入檔案是 ${doc.episode} ${doc.page}，目前頁面是 ${state.episode} ${state.page}。仍要載入嗎？`);
        if (!ok) return;
      }
      state = doc;
      selectedBoxId = state.boxes[0]?.id || null;
      saveLocal(false);
      render();
      setDirty(false, "已匯入");
      window.setTimeout(() => setDirty(false, "已匯入"), 0);
      setStatus(`已匯入：${file.name}`);
    } catch (error) {
      setStatus(`匯入失敗：${error.message}`, "error");
    } finally {
      els.importInput.value = "";
    }
  }

  function runUtf() {
    const value = els.utfInput.value;
    const ok = JSON.parse(JSON.stringify({ value })).value === value && !value.includes("�");
    els.utfStatus.textContent = ok ? "UTF-8 round-trip 通過" : "UTF-8 round-trip 失敗";
    els.utfStatus.className = `status-line is-${ok ? "ok" : "error"}`;
  }

  function beginInteraction(event) {
    if (app.dataset.mode !== "edit") return;
    const node = event.target.closest(".edit-box");
    if (!node) return;
    selectedBoxId = node.dataset.boxId;
    const box = selectedBox();
    const rect = els.stage.getBoundingClientRect();
    interaction = {
      id: box.id,
      type: event.target.closest(".resize-handle") ? "resize" : "drag",
      startX: event.clientX,
      startY: event.clientY,
      stageWidth: rect.width,
      stageHeight: rect.height,
      origin: { ...box.box }
    };
    node.setPointerCapture?.(event.pointerId);
    render();
    event.preventDefault();
  }

  function moveInteraction(event) {
    if (!interaction) return;
    const box = state.boxes.find((item) => item.id === interaction.id);
    if (!box) return;
    const dx = (event.clientX - interaction.startX) / interaction.stageWidth * 100;
    const dy = (event.clientY - interaction.startY) / interaction.stageHeight * 100;
    if (interaction.type === "drag") {
      box.box.x = Math.min(100 - box.box.width, Math.max(0, interaction.origin.x + dx));
      box.box.y = Math.min(100 - box.box.height, Math.max(0, interaction.origin.y + dy));
    } else {
      box.box.width = Math.min(100 - box.box.x, Math.max(4, interaction.origin.width + dx));
      box.box.height = Math.min(100 - box.box.y, Math.max(3, interaction.origin.height + dy));
    }
    renderBoxes();
    renderControls();
    checkOverflow();
    event.preventDefault();
  }

  function endInteraction() {
    if (!interaction) return;
    interaction = null;
    saveLocal(true);
    render();
  }

  function resetPage() {
    if (!confirm("確定要重設本頁 localStorage 暫存資料？")) return;
    localStorage.removeItem(storageKey());
    state = createDefaultState(state.episode, state.page);
    selectedBoxId = null;
    render();
    setDirty(false);
    setStatus("已重設本頁資料");
  }

  app.addEventListener("click", (event) => {
    const episodeButton = event.target.closest("[data-episode-select]");
    if (episodeButton) return loadEpisode(episodeButton.dataset.episodeSelect);
    const pageButton = event.target.closest("[data-page-select]");
    if (pageButton) return loadPage(pageButton.dataset.pageSelect);
    const modeButton = event.target.closest("[data-mode]");
    if (modeButton) {
      app.dataset.mode = modeButton.dataset.mode;
      app.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("is-active", button === modeButton));
      return;
    }
    const widthButton = event.target.closest("[data-preview-width]");
    if (widthButton) {
      els.frame.dataset.width = widthButton.dataset.previewWidth;
      app.querySelectorAll("[data-preview-width]").forEach((button) => button.classList.toggle("is-active", button === widthButton));
      return;
    }
    const seedButton = event.target.closest("[data-apply-seed]");
    if (seedButton) return applySeed(seedButton.dataset.applySeed);
    const listButton = event.target.closest("[data-select-box]");
    if (listButton) {
      selectedBoxId = listButton.dataset.selectBox;
      render();
    }
  });

  app.querySelector("[data-add-box]").addEventListener("click", addBox);
  app.querySelector("[data-remove-box]").addEventListener("click", removeBox);
  app.querySelector("[data-save]").addEventListener("click", () => {
    saveLocal(false);
    setDirty(false, "已暫存");
    setStatus("已暫存");
  });
  app.querySelector("[data-export]").addEventListener("click", exportJson);
  app.querySelector("[data-reset]").addEventListener("click", resetPage);
  app.querySelector("[data-utf-test]").addEventListener("click", runUtf);

  els.text.addEventListener("input", () => updateSelected((box) => { box.text = els.text.value; }));
  els.type.addEventListener("change", () => updateSelected((box) => { box.type = els.type.value; }, true));
  els.speaker.addEventListener("input", () => updateSelected((box) => { box.speaker = els.speaker.value || null; }));
  els.readingOrder.addEventListener("input", () => updateSelected((box) => { box.readingOrder = Math.max(1, Number(els.readingOrder.value) || 1); }, true));
  els.fontSize.addEventListener("input", () => updateSelected((box) => { box.style.fontSize = Math.max(10, Math.min(72, Number(els.fontSize.value) || 32)); }));
  els.shape.addEventListener("change", () => updateSelected((box) => { box.shape = els.shape.value; }, true));
  if (els.textAlign) els.textAlign.addEventListener("change", () => updateSelected((box) => { box.style.textAlign = els.textAlign.value; }));
  els.note.addEventListener("input", () => updateSelected((box) => { box.note = els.note.value; }));
  app.querySelectorAll("[data-coordinate-input]").forEach((input) => {
    input.addEventListener("input", () => updateSelected((box) => {
      const key = input.dataset.coordinateInput;
      box.box[key] = Number(input.value) || 0;
    }, true));
  });
  app.querySelector("[data-art-toggle]").addEventListener("change", (event) => {
    els.stage.classList.toggle("is-art-hidden", !event.target.checked);
  });
  app.querySelector("[data-text-toggle]").addEventListener("change", (event) => {
    els.layer.classList.toggle("is-hidden", !event.target.checked);
  });
  els.importInput.addEventListener("change", () => importJson(els.importInput.files[0]));

  els.layer.addEventListener("pointerdown", beginInteraction);
  els.layer.addEventListener("pointermove", moveInteraction);
  els.layer.addEventListener("pointerup", endInteraction);
  els.layer.addEventListener("pointercancel", endInteraction);
  window.addEventListener("beforeunload", (event) => {
    if (!isDirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  app.dataset.mode = "edit";
  state = createDefaultState();
  loadLocal();
  selectedBoxId = state.boxes[0]?.id || null;
  render();
  setDirty(false);
  runUtf();
  setStatus("tools_new editor ready");
})();









