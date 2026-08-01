(() => {
  "use strict";

  const app = document.querySelector("[data-editor-app]");
  if (!app) return;

  const STORAGE_KEY = "crasher-manga-text-editor-v0.1-jp21-p01";
  const UTF_TEST = "測試中文：上一場衝突，還在震。！？「」";
  const SOURCE_NAME = "JP21_P01_recap_sea_train_transition_BW_v01.png";
  const ART_ASSET = "c_nwf_ch02_ep21_p01_art_v01.webp";
  const DEFAULT_META = {
    project: "crasher-nwf",
    chapter: "ch02",
    episode: "ep21",
    page: "p01",
    version: "v01",
    locale: "zh-tw",
  };

  const els = {
    stage: app.querySelector("[data-stage]"),
    textLayer: app.querySelector("[data-text-layer]"),
    art: app.querySelector("[data-art]"),
    frame: app.querySelector("[data-preview-frame]"),
    filename: app.querySelector("[data-filename]"),
    empty: app.querySelector("[data-empty-state]"),
    boxControls: app.querySelector("[data-box-controls]"),
    text: app.querySelector("[data-box-text]"),
    shape: app.querySelector("[data-box-shape]"),
    fontSize: app.querySelector("[data-font-size]"),
    overflow: app.querySelector("[data-overflow-status]"),
    status: app.querySelector("[data-app-status]"),
    utfInput: app.querySelector("[data-utf-input]"),
    utfPreview: app.querySelector("[data-utf-preview]"),
    utfStatus: app.querySelector("[data-utf-status]"),
    importInput: app.querySelector("[data-import]"),
  };

  let state = createDefaultState();
  let interaction = null;

  function createDefaultState() {
    return {
      schemaVersion: "0.1",
      ...DEFAULT_META,
      source: {
        sourceName: SOURCE_NAME,
        artAsset: ART_ASSET,
        width: 1024,
        height: 1536,
      },
      boxes: [],
    };
  }

  function createDefaultBox() {
    return {
      id: "c_nwf_ch02_ep21_p01_b01",
      type: "caption",
      shape: "text-only",
      text: "",
      box: {
        x: 5,
        y: 5,
        width: 30,
        height: 10,
        unit: "percent",
      },
      style: {
        fontSize: 18,
        lineHeight: 1.25,
        writingMode: "horizontal-tb",
        textAlign: "center",
        verticalAlign: "middle",
        fontFamily: "system-cjk",
        color: "#111111",
        background: "transparent",
        border: "none",
      },
      readingOrder: 1,
      speaker: null,
      note: "",
    };
  }

  function normalizeToken(value, fallback) {
    const normalized = String(value || fallback)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return normalized || fallback;
  }

  function syncMetadataFromInputs() {
    app.querySelectorAll("[data-meta]").forEach((input) => {
      const key = input.dataset.meta;
      state[key] = normalizeToken(input.value, DEFAULT_META[key]);
      input.value = state[key];
    });
    syncBoxId();
    renderFilename();
    saveLocal(false);
  }

  function syncMetadataToInputs() {
    app.querySelectorAll("[data-meta]").forEach((input) => {
      input.value = state[input.dataset.meta] || DEFAULT_META[input.dataset.meta];
    });
  }

  function generatedBase() {
    return `c_nwf_${[
      state.chapter,
      state.episode,
      state.page,
    ].map((part) => normalizeToken(part, "unknown")).join("_")}`;
  }

  function generatedFilename() {
    return `${generatedBase()}_text_${normalizeToken(state.locale, "zh-tw")}_${normalizeToken(state.version, "v01")}.json`;
  }

  function syncBoxId() {
    if (state.boxes[0]) {
      state.boxes[0].id = `${generatedBase()}_b01`;
    }
  }

  function renderFilename() {
    els.filename.textContent = generatedFilename();
  }

  function render() {
    syncMetadataToInputs();
    renderFilename();
    els.textLayer.replaceChildren();
    const box = state.boxes[0];
    els.empty.hidden = Boolean(box);
    els.boxControls.hidden = !box;

    if (!box) {
      els.overflow.textContent = "尚未建立文字框。";
      els.overflow.className = "status-line";
      return;
    }

    const node = document.createElement("div");
    node.className = "edit-box";
    node.dataset.boxId = box.id;
    node.dataset.shape = box.shape;
    node.style.left = `${box.box.x}%`;
    node.style.top = `${box.box.y}%`;
    node.style.width = `${box.box.width}%`;
    node.style.height = `${box.box.height}%`;
    node.style.fontSize = `${scaledFontSize(box.style.fontSize)}px`;
    node.style.lineHeight = String(box.style.lineHeight);
    node.style.writingMode = box.style.writingMode;
    node.style.textAlign = box.style.textAlign;
    node.style.color = box.style.color;

    const text = document.createElement("span");
    text.className = "box-text";
    text.textContent = box.text;
    node.append(text);

    const id = document.createElement("span");
    id.className = "box-id";
    id.textContent = box.id;
    node.append(id);

    const handle = document.createElement("span");
    handle.className = "resize-handle";
    handle.setAttribute("aria-label", "調整文字框大小");
    node.append(handle);

    els.textLayer.append(node);
    els.text.value = box.text;
    els.shape.value = box.shape;
    els.fontSize.value = box.style.fontSize;
    renderCoordinates();
    requestAnimationFrame(checkOverflow);
  }

  function renderCoordinates() {
    const box = state.boxes[0];
    if (!box) return;
    const labels = { x: "x", y: "y", width: "w", height: "h" };
    Object.keys(labels).forEach((key) => {
      const output = app.querySelector(`[data-coordinate="${key}"]`);
      output.textContent = `${labels[key]} ${Number(box.box[key]).toFixed(2)}%`;
    });
  }

  function scaledFontSize(sourceFontSize) {
    const sourceWidth = Number(state.source.width) || 1024;
    const renderedWidth = els.stage.getBoundingClientRect().width || sourceWidth;
    return Math.max(6, Number(sourceFontSize) * (renderedWidth / sourceWidth));
  }

  function updateRenderedScale() {
    const node = els.textLayer.querySelector(".edit-box");
    if (!node || !state.boxes[0]) return;
    node.style.fontSize = `${scaledFontSize(state.boxes[0].style.fontSize)}px`;
  }
  function setStatus(message, kind = "") {
    els.status.textContent = message;
    els.status.className = `status-line${kind ? ` is-${kind}` : ""}`;
  }

  function saveLocal(announce = true) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (announce) setStatus("已暫存至此瀏覽器。", "ok");
  }

  function loadLocal() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    try {
      state = validateDocument(JSON.parse(raw));
      return true;
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
      setStatus(`暫存資料無法讀取：${error.message}`, "error");
      return false;
    }
  }

  function validateDocument(candidate) {
    if (!candidate || candidate.schemaVersion !== "0.1") {
      throw new Error("只接受 schemaVersion 0.1");
    }
    if (candidate.locale !== "zh-tw") {
      throw new Error("V0.1 只接受 zh-tw");
    }
    if (!candidate.source || !Array.isArray(candidate.boxes)) {
      throw new Error("缺少 source 或 boxes");
    }
    if (candidate.boxes.length > 1) {
      throw new Error("V0.1 只接受一個文字框");
    }
    const merged = {
      ...createDefaultState(),
      ...candidate,
      source: { ...createDefaultState().source, ...candidate.source },
      boxes: candidate.boxes,
    };
    if (merged.boxes[0]) {
      const base = createDefaultBox();
      merged.boxes[0] = {
        ...base,
        ...merged.boxes[0],
        box: { ...base.box, ...merged.boxes[0].box, unit: "percent" },
        style: { ...base.style, ...merged.boxes[0].style },
      };
      clampBox(merged.boxes[0].box);
    }
    return merged;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function clampBox(box) {
    box.width = clamp(Number(box.width) || 30, 4, 100);
    box.height = clamp(Number(box.height) || 10, 3, 100);
    box.x = clamp(Number(box.x) || 0, 0, 100 - box.width);
    box.y = clamp(Number(box.y) || 0, 0, 100 - box.height);
  }

  function beginInteraction(event) {
    if (app.dataset.mode !== "edit" || !state.boxes[0]) return;
    const boxNode = event.target.closest(".edit-box");
    if (!boxNode) return;
    const stageRect = els.stage.getBoundingClientRect();
    interaction = {
      type: event.target.closest(".resize-handle") ? "resize" : "drag",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      stageWidth: stageRect.width,
      stageHeight: stageRect.height,
      origin: { ...state.boxes[0].box },
    };
    boxNode.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function updateInteraction(event) {
    if (!interaction || event.pointerId !== interaction.pointerId) return;
    const dx = ((event.clientX - interaction.startX) / interaction.stageWidth) * 100;
    const dy = ((event.clientY - interaction.startY) / interaction.stageHeight) * 100;
    const box = state.boxes[0].box;
    if (interaction.type === "drag") {
      box.x = interaction.origin.x + dx;
      box.y = interaction.origin.y + dy;
    } else {
      box.width = interaction.origin.width + dx;
      box.height = interaction.origin.height + dy;
    }
    clampBox(box);
    const node = els.textLayer.querySelector(".edit-box");
    node.style.left = `${box.x}%`;
    node.style.top = `${box.y}%`;
    node.style.width = `${box.width}%`;
    node.style.height = `${box.height}%`;
    renderCoordinates();
    checkOverflow();
    event.preventDefault();
  }

  function endInteraction(event) {
    if (!interaction || event.pointerId !== interaction.pointerId) return;
    interaction = null;
    saveLocal(false);
    setStatus("框位已更新並暫存。", "ok");
  }

  function checkOverflow() {
    const node = els.textLayer.querySelector(".edit-box");
    if (!node) return;
    updateRenderedScale();
    const text = node.querySelector(".box-text");
    const contentOverflow = text.scrollWidth > text.clientWidth
      || text.scrollHeight > text.clientHeight;
    const box = state.boxes[0].box;
    const boundsOverflow = box.x < 0 || box.y < 0
      || box.x + box.width > 100 || box.y + box.height > 100;
    const hasReplacement = state.boxes[0].text.includes("\uFFFD");
    const overflow = contentOverflow || boundsOverflow || hasReplacement;
    node.classList.toggle("is-overflowing", overflow);
    els.overflow.textContent = overflow
      ? "警告：文字溢出、框位越界或偵測到 U+FFFD。"
      : "通過：目前尺寸未偵測到 overflow。";
    els.overflow.className = `status-line is-${overflow ? "error" : "ok"}`;
  }

  function exportJson() {
    syncMetadataFromInputs();
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = generatedFilename();
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setStatus(`已匯出 ${generatedFilename()}（UTF-8 no BOM）。`, "ok");
  }

  async function importJson(file) {
    if (!file) return;
    try {
      const raw = (await file.text()).replace(/^\uFEFF/, "");
      if (raw.includes("\uFFFD")) {
        throw new Error("檔案含有 U+FFFD replacement character");
      }
      state = validateDocument(JSON.parse(raw));
      syncBoxId();
      saveLocal(false);
      render();
      setStatus(`已匯入並還原 ${file.name}。`, "ok");
    } catch (error) {
      setStatus(`匯入失敗：${error.message}`, "error");
    } finally {
      els.importInput.value = "";
    }
  }

  function runUtfRoundTrip() {
    const inputLayer = els.utfInput.value.normalize("NFC");
    const memoryLayer = String(inputLayer).normalize("NFC");
    const testDocument = structuredClone(state);
    if (!testDocument.boxes[0]) testDocument.boxes = [createDefaultBox()];
    testDocument.boxes[0].text = memoryLayer;
    const exportedLayer = JSON.stringify(testDocument);
    const bytes = new TextEncoder().encode(exportedLayer);
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const importedLayer = JSON.parse(decoded).boxes[0].text.normalize("NFC");
    els.utfPreview.textContent = importedLayer;
    const previewLayer = els.utfPreview.textContent.normalize("NFC");
    const values = [inputLayer, memoryLayer, importedLayer, previewLayer];
    const exact = values.every((value) => value === UTF_TEST);
    const clean = values.every((value) => !value.includes("\uFFFD"));
    const noBom = bytes[0] !== 0xef || bytes[1] !== 0xbb || bytes[2] !== 0xbf;
    if (exact && clean && noBom) {
      els.utfStatus.textContent = "通過：輸入、記憶體、JSON export/import、Preview DOM 完全一致；UTF-8 no BOM。";
      els.utfStatus.className = "status-line is-ok";
      return;
    }
    els.utfStatus.textContent = "失敗：測試字串不一致、含 U+FFFD，或輸出含 BOM。";
    els.utfStatus.className = "status-line is-error";
  }

  app.addEventListener("click", (event) => {
    const modeButton = event.target.closest("button[data-mode]");
    if (modeButton) {
      app.dataset.mode = modeButton.dataset.mode;
      app.querySelectorAll("[data-mode]").forEach((button) => {
        button.classList.toggle("is-active", button === modeButton);
      });
      checkOverflow();
      return;
    }

    const widthButton = event.target.closest("[data-preview-width]");
    if (widthButton) {
      const width = widthButton.dataset.previewWidth;
      els.frame.dataset.width = width;
      app.querySelectorAll("[data-preview-width]").forEach((button) => {
        button.classList.toggle("is-active", button === widthButton);
      });
      requestAnimationFrame(checkOverflow);
      return;
    }

    if (event.target.closest("[data-add-box]")) {
      if (!state.boxes[0]) {
        state.boxes = [createDefaultBox()];
        syncBoxId();
        saveLocal(false);
        render();
        setStatus("已建立單一文字框。", "ok");
      } else {
        setStatus("V0.1 僅支援一個文字框。", "error");
      }
      return;
    }

    if (event.target.closest("[data-remove-box]")) {
      state.boxes = [];
      saveLocal(false);
      render();
      setStatus("文字框已移除。");
      return;
    }

    if (event.target.closest("[data-save]")) saveLocal(true);
    if (event.target.closest("[data-export]")) exportJson();
    if (event.target.closest("[data-utf-test]")) runUtfRoundTrip();
    if (event.target.closest("[data-reset]")) {
      localStorage.removeItem(STORAGE_KEY);
      state = createDefaultState();
      render();
      setStatus("已重設 V0.1 工具資料。");
    }
  });

  app.querySelectorAll("[data-meta]").forEach((input) => {
    input.addEventListener("change", syncMetadataFromInputs);
  });

  els.text.addEventListener("input", () => {
    if (!state.boxes[0]) return;
    state.boxes[0].text = els.text.value.normalize("NFC");
    const textNode = els.textLayer.querySelector(".box-text");
    if (textNode) textNode.textContent = state.boxes[0].text;
    saveLocal(false);
    checkOverflow();
  });

  els.shape.addEventListener("change", () => {
    if (!state.boxes[0]) return;
    state.boxes[0].shape = els.shape.value;
    saveLocal(false);
    render();
  });

  els.fontSize.addEventListener("input", () => {
    if (!state.boxes[0]) return;
    state.boxes[0].style.fontSize = clamp(Number(els.fontSize.value) || 18, 10, 72);
    const node = els.textLayer.querySelector(".edit-box");
    if (node) node.style.fontSize = `${scaledFontSize(state.boxes[0].style.fontSize)}px`;
    saveLocal(false);
    checkOverflow();
  });

  app.querySelector("[data-art-toggle]").addEventListener("change", (event) => {
    els.stage.classList.toggle("is-art-hidden", !event.target.checked);
  });

  app.querySelector("[data-text-toggle]").addEventListener("change", (event) => {
    els.textLayer.classList.toggle("is-hidden", !event.target.checked);
  });

  els.importInput.addEventListener("change", () => importJson(els.importInput.files[0]));
  els.textLayer.addEventListener("pointerdown", beginInteraction);
  els.textLayer.addEventListener("pointermove", updateInteraction);
  els.textLayer.addEventListener("pointerup", endInteraction);
  els.textLayer.addEventListener("pointercancel", endInteraction);
  window.addEventListener("resize", () => requestAnimationFrame(checkOverflow));

  app.dataset.mode = "edit";
  const restored = loadLocal();
  render();
  runUtfRoundTrip();
  setStatus(restored ? "已從 localStorage 還原上次資料。" : "工具已載入，尚未建立文字框。", "ok");
})();
