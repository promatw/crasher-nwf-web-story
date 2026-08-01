(() => {
  "use strict";

  const app = document.querySelector("[data-annotator-app]");
  if (!app) return;

  const episodes = window.CRASHER_MANGA_EPISODES || window.CRASHER_MANGA_NEW_EPISODES || {};
  const imageBase = "/crasher-nwf-web-story/images/manga_new/editor/";

  const fallbackPreset = "\u8acb\u4f9d\u9078\u64c7\u7684\u554f\u984c\u985e\u578b\u4fee\u6b63\u3002";
  const referenceOptions = [
    ["\u89d2\u8272.\u96f7\u8499\u591a.\u6b63\u80cc\u9762\u5b9a\u7a3f", "\u96f7\u8499\u591a\uff5c\u6b63\u80cc\u9762\u5b9a\u7a3f"],
    ["\u89d2\u8272.\u96f7\u8499\u591a.\u52d5\u4f5c\u5b9a\u7a3f", "\u96f7\u8499\u591a\uff5c\u52d5\u4f5c\u5b9a\u7a3f"],
    ["\u89d2\u8272.\u77f3\u982d\u4eba.\u5168\u8eab\u5b9a\u7a3f", "\u77f3\u982d\u4eba\uff5c\u5168\u8eab\u5b9a\u7a3f"],
    ["\u89d2\u8272.\u67d2.\u5b9a\u7a3f", "\u67d2\uff5c\u5b9a\u7a3f"],
    ["\u89d2\u8272.\u4e03\u661f.\u5b9a\u7a3f", "\u4e03\u661f\uff5c\u5b9a\u7a3f"],
    ["\u89d2\u8272.\u8001\u5976\u5976.\u5b9a\u7a3f", "\u8001\u5976\u5976\uff5c\u5b9a\u7a3f"],
    ["\u5834\u666f.\u6d77\u4e0a\u9ad8\u9435.\u5b9a\u9328", "\u6d77\u4e0a\u9ad8\u9435\uff5c\u5b9a\u9328"],
    ["\u5834\u666f.\u9280\u5ea7\u9802\u6a13\u64cd\u5834.\u591c\u666f\u5b9a\u9328", "\u9280\u5ea7\u9802\u6a13\u64cd\u5834\uff5c\u591c\u666f\u5b9a\u9328"],
    ["\u5834\u666f.\u5730\u4e0b\u5165\u53e3.\u5b9a\u9328", "\u5730\u4e0b\u5165\u53e3\uff5c\u5b9a\u9328"],
    ["\u5834\u666f.\u8eca\u5ec2.\u5b9a\u9328", "\u8eca\u5ec2\uff5c\u5b9a\u9328"],
    ["\u7269\u4ef6.\u5012\u6578\u5668.\u6b63\u9762\u5b9a\u9328", "\u5012\u6578\u5668\uff5c\u6b63\u9762\u5b9a\u9328"],
    ["\u7269\u4ef6.\u91cd\u578b\u6a5f\u8eca.\u5b9a\u9328", "\u91cd\u578b\u6a5f\u8eca\uff5c\u5b9a\u9328"],
    ["\u7269\u4ef6.\u6e2c\u8a66\u88dd\u7f6e.\u5b9a\u9328", "\u6e2c\u8a66\u88dd\u7f6e\uff5c\u5b9a\u9328"]
  ];

  const els = {
    subtitle: app.querySelector("[data-subtitle]"),
    saveState: app.querySelector("[data-save-state]"),
    episodeSwitch: app.querySelector("[data-episode-switch]"),
    pageSwitch: app.querySelector("[data-page-switch]"),
    stage: app.querySelector("[data-stage]"),
    art: app.querySelector("[data-art]"),
    layer: app.querySelector("[data-annotation-layer]"),
    jsonFilename: app.querySelector("[data-json-filename]"),
    taskFilename: app.querySelector("[data-task-filename]"),
    metadataSummary: app.querySelector("[data-metadata-summary]"),
    annotationList: app.querySelector("[data-annotation-list]"),
    empty: app.querySelector("[data-empty-state]"),
    selectedId: app.querySelector("[data-selected-id]"),
    category: app.querySelector("[data-category]"),
    target: app.querySelector("[data-target]"),
    preset: app.querySelector("[data-preset]"),
    note: app.querySelector("[data-note]"),
    referenceList: app.querySelector("[data-reference-list]"),
    referenceStatus: app.querySelector("[data-reference-status]"),
    status: app.querySelector("[data-app-status]")
  };

  let state = null;
  let selectedId = null;
  let interaction = null;
  let dirty = false;

  function firstEpisode() { return episodes.ep24 ? "ep24" : Object.keys(episodes)[0]; }
  function firstPage(ep) { return Object.keys(episodes[ep]?.pages || {})[0]; }
  function episodeConfig() { return episodes[state.episode]; }
  function pageConfig() { return episodeConfig()?.pages?.[state.page]; }
  function selectedAnnotation() { return state.annotations.find((item) => item.id === selectedId) || null; }
  function storageKey(doc = state) { return `tools_new_${doc.project}_${doc.chapter}_${doc.episode}_${doc.page}_${doc.revisionRound}_annotatorState_v01`; }
  function jsonFilename() { return `c_nwf_${state.chapter}_${state.episode}_${state.page}_revision_annotations_${state.revisionRound}.json`; }
  function taskFilename() { return `MGA1_revision_task_pack_${state.chapter}_${state.episode}_${state.page}_${state.revisionRound}.md`; }
  function optionText(select) { return select.options[select.selectedIndex]?.textContent || fallbackPreset; }

  function createDefaultState(ep = firstEpisode(), page = firstPage(ep)) {
    const ec = episodes[ep];
    const pc = ec.pages[page];
    return {
      schemaVersion: "0.1",
      project: "crasher-nwf",
      chapter: ec.chapter || "ch02",
      episode: ep,
      page,
      locale: ec.locale || "zh-tw",
      revisionRound: "r01",
      source: {
        sourceName: pc.sourceName || pc.artAsset,
        artAsset: pc.artAsset,
        width: pc.width || 1024,
        height: pc.height || 1536,
        assetType: pc.assetType || "manga-page",
        pageCode: pc.pageCode || page,
        readingIndex: pc.readingIndex || null
      },
      referenceAssetIds: [],
      editor: { nextAnnotationNumber: 1 },
      annotations: []
    };
  }

  function createAnnotation(num = state.editor.nextAnnotationNumber) {
    const n = String(num).padStart(2, "0");
    const category = "character_ip_face_hair";
    return {
      id: `${state.episode}_${state.page}_a${n}`,
      page: state.page,
      artAsset: state.source.artAsset,
      box: { x: 10 + ((num - 1) % 4) * 5, y: 10 + ((num - 1) % 4) * 5, width: 22, height: 14, unit: "percent" },
      category,
      target: "",
      preset: optionText(els.category),
      note: "",
      referenceAssetIds: [],
      status: "open"
    };
  }

  function setDirty(value = true, label) {
    dirty = value;
    els.saveState.textContent = label || (dirty ? "\u672a\u532f\u51fa" : "\u5df2\u8f09\u5165");
    els.saveState.className = `save-state is-${dirty ? "dirty" : "loaded"}`;
  }
  function setStatus(message, kind = "ok") { els.status.textContent = message; els.status.className = `status-line is-${kind}`; }
  function saveLocal(markDirty = true) { localStorage.setItem(storageKey(), JSON.stringify(state)); if (markDirty) setDirty(true); }

  function loadLocal() {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return false;
    try {
      const doc = JSON.parse(raw);
      state.revisionRound = doc.revisionRound || state.revisionRound;
      state.referenceAssetIds = Array.isArray(doc.referenceAssetIds) ? doc.referenceAssetIds : [];
      state.annotations = Array.isArray(doc.annotations) ? doc.annotations : [];
      state.editor = { nextAnnotationNumber: 1, ...(doc.editor || {}) };
      selectedId = state.annotations[0]?.id || null;
      return true;
    } catch {
      localStorage.removeItem(storageKey());
      return false;
    }
  }

  function updateMetaInputs() { app.querySelectorAll("[data-meta]").forEach((input) => { input.value = state[input.dataset.meta] || ""; }); }
  function renderEpisodeButtons() {
    const buttons = Object.entries(episodes).map(([ep, config]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.episodeSelect = ep;
      button.textContent = config.label || ep.toUpperCase();
      button.classList.toggle("is-active", ep === state.episode);
      return button;
    });
    els.episodeSwitch.replaceChildren(...buttons);
  }
  function renderPageButtons() {
    const buttons = Object.entries(episodeConfig().pages).map(([page, config]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.pageSelect = page;
      button.textContent = config.label || page;
      button.classList.toggle("is-active", page === state.page);
      button.classList.toggle("is-conditional", config.status === "conditional");
      return button;
    });
    els.pageSwitch.replaceChildren(...buttons);
  }
  function renderMeta() {
    const pc = pageConfig();
    updateMetaInputs();
    els.jsonFilename.textContent = jsonFilename();
    els.taskFilename.textContent = taskFilename();
    els.subtitle.textContent = `${state.episode.toUpperCase()} ${pc.label || state.page} ? ${state.source.assetType} ? ${state.revisionRound}`;
    const rows = [["project", state.project], ["chapter", state.chapter], ["episode", state.episode], ["page", state.page], ["artAsset", state.source.artAsset], ["assetType", state.source.assetType], ["annotation count", String(state.annotations.length)], ["reference count", String(state.referenceAssetIds.length)]];
    els.metadataSummary.replaceChildren(...rows.flatMap(([key, value]) => { const dt = document.createElement("dt"); const dd = document.createElement("dd"); dt.textContent = key; dd.textContent = value == null ? "" : String(value); return [dt, dd]; }));
  }
  function annotationNode(annotation) {
    const node = document.createElement("div");
    node.className = "annotation-box";
    node.classList.toggle("is-selected", annotation.id === selectedId);
    node.dataset.annotationId = annotation.id;
    Object.assign(node.style, { left: `${annotation.box.x}%`, top: `${annotation.box.y}%`, width: `${annotation.box.width}%`, height: `${annotation.box.height}%` });
    const badge = document.createElement("span"); badge.className = "annotation-badge"; badge.textContent = annotation.id.split("_").pop();
    const title = document.createElement("span"); title.className = "annotation-title"; title.textContent = annotation.target || annotation.category;
    const handle = document.createElement("span"); handle.className = "resize-handle";
    node.append(badge, title, handle);
    return node;
  }
  function renderLayer() { els.layer.replaceChildren(...state.annotations.map(annotationNode)); }
  function renderList() {
    const items = state.annotations.map((annotation, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "box-list-item";
      button.classList.toggle("is-selected", annotation.id === selectedId);
      button.dataset.selectAnnotation = annotation.id;
      const order = document.createElement("span"); order.className = "box-list-order"; order.textContent = String(index + 1).padStart(2, "0");
      const copy = document.createElement("span"); copy.className = "box-list-copy";
      const strong = document.createElement("strong"); strong.textContent = annotation.id;
      const detail = document.createElement("span"); detail.textContent = `${annotation.category} ? ${annotation.target || "no target"}`;
      copy.append(strong, detail); button.append(order, copy); return button;
    });
    els.annotationList.replaceChildren(...items);
    els.empty.hidden = items.length > 0;
  }
  function renderControls() {
    const item = selectedAnnotation();
    const disabled = !item;
    [els.category, els.target, els.preset, els.note].forEach((field) => { field.disabled = disabled; });
    app.querySelectorAll("[data-coordinate-input]").forEach((input) => { input.disabled = disabled; });
    if (!item) {
      els.selectedId.textContent = ""; els.target.value = ""; els.preset.value = ""; els.note.value = "";
      app.querySelectorAll("[data-coordinate-input]").forEach((input) => { input.value = ""; });
      return;
    }
    els.selectedId.textContent = item.id;
    els.category.value = item.category || "other";
    els.target.value = item.target || "";
    els.preset.value = item.preset || optionText(els.category);
    els.note.value = item.note || "";
    app.querySelectorAll("[data-coordinate-input]").forEach((input) => { input.value = Number(item.box[input.dataset.coordinateInput]).toFixed(2); });
  }
  function renderReferences() {
    const nodes = referenceOptions.map(([assetId, label]) => {
      const wrapper = document.createElement("label"); wrapper.className = "reference-option";
      const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.dataset.referenceAssetId = assetId; checkbox.checked = state.referenceAssetIds.includes(assetId);
      const copy = document.createElement("span"); const title = document.createElement("strong"); title.textContent = label; const code = document.createElement("span"); code.textContent = assetId; copy.append(title, code); wrapper.append(checkbox, copy); return wrapper;
    });
    els.referenceList.replaceChildren(...nodes);
    els.referenceStatus.textContent = `${state.referenceAssetIds.length} reference assets selected`;
  }
  function render() {
    renderEpisodeButtons(); renderPageButtons(); renderMeta();
    els.stage.style.aspectRatio = `${state.source.width || 1024} / ${state.source.height || 1536}`;
    els.art.src = `${imageBase}${state.source.artAsset}`;
    els.art.alt = `${state.episode.toUpperCase()} ${state.page} clean art`;
    renderLayer(); renderList(); renderControls(); renderReferences();
  }
  function loadPage(page) { if (!episodeConfig().pages[page] || page === state.page) return; state = createDefaultState(state.episode, page); selectedId = null; loadLocal(); render(); setDirty(false); setStatus(`Loaded ${state.episode.toUpperCase()} ${page}`); }
  function loadEpisode(ep) { if (!episodes[ep] || ep === state.episode) return; state = createDefaultState(ep, firstPage(ep)); selectedId = null; loadLocal(); render(); setDirty(false); setStatus(`Loaded ${ep.toUpperCase()}`); }
  function updateSelected(change, rerender = false) { const item = selectedAnnotation(); if (!item) return; change(item); saveLocal(true); if (rerender) render(); else { renderLayer(); renderList(); renderControls(); } }
  function addAnnotation() { const item = createAnnotation(state.editor.nextAnnotationNumber++); state.annotations.push(item); selectedId = item.id; saveLocal(true); render(); setStatus(`Added ${item.id}`); }
  function removeAnnotation() { const item = selectedAnnotation(); if (!item) return; state.annotations = state.annotations.filter((annotation) => annotation.id !== item.id); selectedId = state.annotations[0]?.id || null; saveLocal(true); render(); setStatus(`Removed ${item.id}`); }
  function downloadBlob(blob, name) { const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 0); }
  function exportJson() { const exportDoc = { ...state }; delete exportDoc.editor; downloadBlob(new Blob([JSON.stringify(exportDoc, null, 2)], { type: "application/json;charset=utf-8" }), jsonFilename()); setDirty(false, "\u5df2\u532f\u51fa"); setStatus(`Exported ${jsonFilename()}`); }
  function taskPackMarkdown() {
    const refs = state.referenceAssetIds.length ? state.referenceAssetIds.map((id) => `- ${id}`).join("\n") : "- none";
    const annotations = state.annotations.length ? state.annotations.map((item, index) => [`## ${index + 1}. ${item.id}`, "", `page: ${state.page}`, `artAsset: ${state.source.artAsset}`, `category: ${item.category}`, `target: ${item.target || "unspecified"}`, `box: x=${item.box.x.toFixed(2)}%, y=${item.box.y.toFixed(2)}%, w=${item.box.width.toFixed(2)}%, h=${item.box.height.toFixed(2)}%`, `preset: ${item.preset || ""}`, `note: ${item.note || ""}`, `referenceAssetIds: ${(item.referenceAssetIds || []).join(", ") || "use page-level references"}`, `status: ${item.status || "open"}`].join("\n")).join("\n\n") : "No annotations.";
    return [`# MGA1 Revision Task Pack`, "", `project: ${state.project}`, `chapter: ${state.chapter}`, `episode: ${state.episode}`, `page: ${state.page}`, `revisionRound: ${state.revisionRound}`, `sourceArt: ${state.source.artAsset}`, "", `## Page-level reference assets`, refs, "", `## Annotations`, annotations, "", `## Stop Point`, "", `MGA1 may create candidate images only. Do not overwrite clean art, tools_new assets, or text JSON.`].join("\n");
  }
  function exportTaskPack() { downloadBlob(new Blob([taskPackMarkdown()], { type: "text/markdown;charset=utf-8" }), taskFilename()); setDirty(false, "\u5df2\u532f\u51fa"); setStatus(`Exported ${taskFilename()}`); }
  function resetPage() { if (!confirm("Reset this page annotation draft?")) return; localStorage.removeItem(storageKey()); state = createDefaultState(state.episode, state.page); selectedId = null; render(); setDirty(false); setStatus("Reset page annotations"); }
  function beginInteraction(event) { if (app.dataset.mode !== "annotate") return; const node = event.target.closest(".annotation-box"); if (!node) return; selectedId = node.dataset.annotationId; const item = selectedAnnotation(); const rect = els.stage.getBoundingClientRect(); interaction = { id: item.id, type: event.target.closest(".resize-handle") ? "resize" : "drag", startX: event.clientX, startY: event.clientY, stageWidth: rect.width, stageHeight: rect.height, origin: { ...item.box } }; node.setPointerCapture?.(event.pointerId); render(); event.preventDefault(); }
  function moveInteraction(event) { if (!interaction) return; const item = state.annotations.find((annotation) => annotation.id === interaction.id); if (!item) return; const dx = (event.clientX - interaction.startX) / interaction.stageWidth * 100; const dy = (event.clientY - interaction.startY) / interaction.stageHeight * 100; if (interaction.type === "drag") { item.box.x = Math.min(100 - item.box.width, Math.max(0, interaction.origin.x + dx)); item.box.y = Math.min(100 - item.box.height, Math.max(0, interaction.origin.y + dy)); } else { item.box.width = Math.min(100 - item.box.x, Math.max(4, interaction.origin.width + dx)); item.box.height = Math.min(100 - item.box.y, Math.max(3, interaction.origin.height + dy)); } renderLayer(); renderControls(); event.preventDefault(); }
  function endInteraction() { if (!interaction) return; interaction = null; saveLocal(true); render(); }

  app.addEventListener("click", (event) => {
    const episodeButton = event.target.closest("[data-episode-select]"); if (episodeButton) return loadEpisode(episodeButton.dataset.episodeSelect);
    const pageButton = event.target.closest("[data-page-select]"); if (pageButton) return loadPage(pageButton.dataset.pageSelect);
    const modeButton = event.target.closest("[data-mode]"); if (modeButton) { app.dataset.mode = modeButton.dataset.mode; app.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("is-active", button === modeButton)); return; }
    const listButton = event.target.closest("[data-select-annotation]"); if (listButton) { selectedId = listButton.dataset.selectAnnotation; render(); }
  });
  app.querySelector("[data-add-annotation]").addEventListener("click", addAnnotation);
  app.querySelector("[data-remove-annotation]").addEventListener("click", removeAnnotation);
  app.querySelector("[data-save]").addEventListener("click", () => { saveLocal(false); setDirty(false, "\u5df2\u66ab\u5b58"); setStatus("Saved locally"); });
  app.querySelector("[data-export-json]").addEventListener("click", exportJson);
  
  function previewFilename() { return `c_nwf_${state.chapter}_${state.episode}_${state.page}_annotated_task_${state.revisionRound}.png`; }
  function shortInstruction(item) {
    const label = item.id.split("_").pop();
    const targetRaw = (item.target || item.note || "").trim();
    const target = targetRaw || "the marked area";
    const instructionMap = {
      remove_extra_character: targetRaw ? `delete ${target} inside this box` : "delete the extra character inside this box",
      remove_extra_background: targetRaw ? `remove ${target} inside this box` : "remove the extra background element inside this box",
      character_ip_face_hair: targetRaw ? `fix ${target} face and hair using reference` : "fix face and hair inside this box using reference",
      character_ip_clothing: targetRaw ? `fix ${target} outfit using reference` : "fix outfit inside this box using reference",
      character_expression: targetRaw ? `fix ${target} expression` : "fix the expression inside this box",
      character_position_swap: targetRaw ? `adjust ${target} position` : "adjust character position inside this box",
      scene_continuity: targetRaw ? `fix ${target} continuity` : "fix scene continuity inside this box",
      vehicle_or_device_design: targetRaw ? `fix ${target} design using reference` : "fix the device design inside this box using reference",
      keep_dialogue_space: "keep this blank dialogue area unchanged",
      no_new_character: "do not add any new character here",
      keep_storyboard: "keep the original storyboard and composition",
      other: targetRaw ? `fix ${target}` : "fix the marked area"
    };
    return `${label}: ${instructionMap[item.category] || instructionMap.other}`;
  }
  function stickerAnchor(item, width, height, boxW, boxH) {
    const x = item.box.x / 100 * width;
    const y = item.box.y / 100 * height;
    const w = item.box.width / 100 * width;
    const h = item.box.height / 100 * height;
    const margin = Math.max(8, Math.round(width * 0.01));
    let sx = x;
    let sy = y - boxH - margin;
    if (sy < margin) sy = y + h + margin;
    if (sy + boxH > height - margin) sy = Math.max(margin, y + h / 2 - boxH / 2);
    if (sx + boxW > width - margin) sx = width - boxW - margin;
    if (sx < margin) sx = margin;
    return { sx, sy, x, y, w, h };
  }
  function ensurePreviewButton() {
    const grid = app.querySelector(".action-grid");
    if (!grid || app.querySelector("[data-export-preview]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.exportPreview = "";
    button.textContent = "Export task PNG";
    grid.insertBefore(button, app.querySelector("[data-reset]"));
    button.addEventListener("click", exportAnnotatedPreview);
  }
  async function loadImageForCanvas(src) {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    const loaded = new Promise((resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("image load failed"));
    });
    image.src = src;
    await loaded;
    return image;
  }
  function measureSticker(ctx, text, canvasWidth) {
    const fontSize = Math.max(18, Math.round(canvasWidth * 0.024));
    const padX = Math.round(fontSize * 0.5);
    const padY = Math.round(fontSize * 0.38);
    ctx.font = `700 ${fontSize}px Arial, "Microsoft JhengHei", sans-serif`;
    const maxW = Math.round(canvasWidth * 0.46);
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    const textW = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width), 1));
    return { fontSize, padX, padY, lines, boxW: textW + padX * 2, boxH: lines.length * fontSize * 1.24 + padY * 2 };
  }
  function drawSticker(ctx, text, x, y, canvasWidth, accent) {
    const m = measureSticker(ctx, text, canvasWidth);
    ctx.fillStyle = "rgba(255, 246, 210, 0.98)";
    ctx.strokeStyle = accent;
    ctx.lineWidth = Math.max(2, Math.round(canvasWidth * 0.003));
    ctx.fillRect(x, y, m.boxW, m.boxH);
    ctx.strokeRect(x, y, m.boxW, m.boxH);
    ctx.fillStyle = "#111111";
    ctx.font = `700 ${m.fontSize}px Arial, "Microsoft JhengHei", sans-serif`;
    m.lines.forEach((line, i) => ctx.fillText(line, x + m.padX, y + m.padY + m.fontSize * (i + 0.95)));
    return m;
  }
  function drawLeaderLine(ctx, box, sticker, accent, canvasWidth) {
    const boxX = box.x + box.w / 2;
    const boxY = box.y + box.h / 2;
    const stickerX = sticker.sx + sticker.boxW / 2;
    const stickerY = sticker.sy + sticker.boxH / 2;
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.lineWidth = Math.max(2, Math.round(canvasWidth * 0.003));
    ctx.setLineDash([Math.max(6, canvasWidth * 0.006), Math.max(4, canvasWidth * 0.004)]);
    ctx.beginPath();
    ctx.moveTo(stickerX, stickerY);
    ctx.lineTo(boxX, boxY);
    ctx.stroke();
    ctx.restore();
  }
  async function exportAnnotatedPreview() {
    try {
      const width = Number(state.source.width || els.art.naturalWidth || 1024);
      const height = Number(state.source.height || els.art.naturalHeight || 1536);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      const image = await loadImageForCanvas(els.art.currentSrc || els.art.src);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0, width, height);
      const accentColors = ["#ff3b48", "#e7b84b", "#37c4ff", "#7ee081", "#d48cff"];
      ctx.lineWidth = Math.max(4, Math.round(width * 0.005));
      state.annotations.forEach((item, index) => {
        const accent = accentColors[index % accentColors.length];
        const x = item.box.x / 100 * width;
        const y = item.box.y / 100 * height;
        const w = item.box.width / 100 * width;
        const h = item.box.height / 100 * height;
        ctx.fillStyle = "rgba(255, 59, 72, 0.08)";
        ctx.strokeStyle = accent;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
        const instruction = shortInstruction(item);
        const measured = measureSticker(ctx, instruction, width);
        const anchor = stickerAnchor(item, width, height, measured.boxW, measured.boxH);
        const sticker = drawSticker(ctx, instruction, anchor.sx, anchor.sy, width, accent);
        drawLeaderLine(ctx, { x, y, w, h }, { sx: anchor.sx, sy: anchor.sy, boxW: sticker.boxW, boxH: sticker.boxH }, accent, width);
      });
      canvas.toBlob((blob) => {
        if (!blob) {
          setStatus("Task PNG export failed", "error");
          return;
        }
        downloadBlob(blob, previewFilename());
        setStatus(`Exported ${previewFilename()}`);
      }, "image/png");
    } catch (error) {
      setStatus(`Task PNG export failed: ${error.message}`, "error");
    }
  }
app.querySelector("[data-export-task]").addEventListener("click", exportTaskPack);
  app.querySelector("[data-reset]").addEventListener("click", resetPage);
  app.querySelector("[data-meta='revisionRound']").addEventListener("input", (event) => { state.revisionRound = event.target.value || "r01"; saveLocal(true); renderMeta(); });
  els.category.addEventListener("change", () => updateSelected((item) => { item.category = els.category.value; item.preset = optionText(els.category); }, true));
  els.target.addEventListener("input", () => updateSelected((item) => { item.target = els.target.value; }));
  els.preset.addEventListener("input", () => updateSelected((item) => { item.preset = els.preset.value; }));
  els.note.addEventListener("input", () => updateSelected((item) => { item.note = els.note.value; }));
  app.querySelectorAll("[data-coordinate-input]").forEach((input) => { input.addEventListener("input", () => updateSelected((item) => { const key = input.dataset.coordinateInput; item.box[key] = Number(input.value) || 0; }, true)); });
  els.referenceList.addEventListener("change", (event) => { const checkbox = event.target.closest("[data-reference-asset-id]"); if (!checkbox) return; const id = checkbox.dataset.referenceAssetId; const next = new Set(state.referenceAssetIds); if (checkbox.checked) next.add(id); else next.delete(id); state.referenceAssetIds = [...next]; saveLocal(true); renderReferences(); });
  els.layer.addEventListener("pointerdown", beginInteraction);
  els.layer.addEventListener("pointermove", moveInteraction);
  els.layer.addEventListener("pointerup", endInteraction);
  els.layer.addEventListener("pointercancel", endInteraction);
  window.addEventListener("beforeunload", (event) => { if (!dirty) return; event.preventDefault(); event.returnValue = ""; });

  app.dataset.mode = "annotate";
  state = createDefaultState();
  loadLocal();
  selectedId = state.annotations[0]?.id || null;
  render();
  setDirty(false);
  ensurePreviewButton();
  setStatus("Annotator ready");
})();

