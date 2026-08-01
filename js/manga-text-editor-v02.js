(() => {
  "use strict";

  const app = document.querySelector("[data-editor-app]");
  if (!app) return;

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
  const JP21_PAGE_CONFIG = {
    p01: {
      label: "P1",
      sourceName: "JP21_P01_recap_sea_train_transition_BW_v01.png",
      artAsset: "c_nwf_ch02_ep21_p01_art_v01.webp",
      width: 1024,
      height: 1536,
      boxes: [
        { text: "上一場衝突，還在震。", type: "caption", speaker: "narration", readingOrder: 1,
          box: { x: 71.5, y: 2.2, width: 24.8, height: 11.2 }, note: "JP21_P01_AREA01" },
        { text: "列車把他們推向下一站。", type: "caption", speaker: "narration", readingOrder: 2,
          box: { x: 63.5, y: 70.4, width: 33, height: 13.5 }, note: "JP21_P01_AREA03" },
      ],
    },
    p02: {
      label: "P2",
      sourceName: "JP21_P02_sea_train_appears_BW_v01.png",
      artAsset: "c_nwf_ch02_ep21_p02_art_v01.webp",
      width: 1055,
      height: 1491,
      boxes: [
        { text: "海上列車，正在加速。", type: "caption", speaker: "narration", readingOrder: 1,
          box: { x: 65.2, y: 1, width: 33.4, height: 11.7 }, note: "JP21_P02_AREA01" },
        { text: "等一下，我們真的在海上跑？", type: "dialogue", speaker: "raimondo", readingOrder: 2,
          box: { x: 53.3, y: 36.3, width: 45.3, height: 11.7 }, note: "JP21_P02_AREA02" },
      ],
    },
    p03: {
      label: "P3",
      sourceName: "JP21_P03_cabin_contrast_raimondo_golem_BW_v01.png",
      artAsset: "c_nwf_ch02_ep21_p03_art_v01.webp",
      width: 1055,
      height: 1491,
      boxes: [
        { text: "你坐得下嗎？", type: "dialogue", speaker: "raimondo", readingOrder: 1,
          box: { x: 6.6, y: 9.5, width: 17.8, height: 14.1 }, note: "JP21_P03_AREA01" },
        { text: "大家都換座位了，你還這麼冷靜？", type: "dialogue", speaker: "raimondo", readingOrder: 2,
          box: { x: 1.6, y: 32.2, width: 22.7, height: 18.1 }, note: "JP21_P03_AREA03" },
        { text: "座位很勇敢。", type: "dialogue", speaker: "golem", readingOrder: 3,
          box: { x: 77.9, y: 86.6, width: 20.1, height: 12.6 }, note: "JP21_P03_AREA05" },
      ],
    },
    p04: {
      label: "P4",
      sourceName: "JP21_P04_ticket_check_train_contrast_BW_v01.png",
      artAsset: "c_nwf_ch02_ep21_p04_art_v01.webp",
      width: 1055,
      height: 1491,
      boxes: [],
    },
    p05: {
      label: "P5",
      sourceName: "JP21_P05_work_for_ticket_golem_kitchen_BW_v01.png",
      artAsset: "c_nwf_ch02_ep21_p05_art_v01.webp",
      width: 1055,
      height: 1491,
      boxes: [],
    },
    p06: {
      label: "P6",
      sourceName: "JP21_P06_golem_blocks_train_door_BW_v01.png",
      artAsset: "c_nwf_ch02_ep21_p06_art_v01.webp",
      width: 1103,
      height: 1426,
      boxes: [],
    },
    p07: {
      label: "P7",
      sourceName: "JP21_P07_magnetic_algae_sea_train_omen_BW_v01.png",
      artAsset: "c_nwf_ch02_ep21_p07_art_v01.webp",
      width: 1055,
      height: 1491,
      boxes: [],
    },
    p08: {
      label: "P8",
      sourceName: "JP21_P08_shadow_between_train_cars_BW_v01.png",
      artAsset: "c_nwf_ch02_ep21_p08_art_v01.webp",
      width: 1103,
      height: 1426,
      boxes: [],
    },
    p09: {
      label: "P9",
      sourceName: "JP21_P09_ninja_shadow_hook_BW_v01.png",
      artAsset: "c_nwf_ch02_ep21_p09_art_v01.webp",
      width: 1103,
      height: 1426,
      boxes: [],
    },
    p10: {
      label: "P10",
      sourceName: "JP21_P10_lights_out_ninja_cliffhanger_BW_v01.png",
      artAsset: "c_nwf_ch02_ep21_p10_art_v01.webp",
      width: 1055,
      height: 1491,
      boxes: [],
    },
  };
  const JP21_SEED_TEXT = {
    p01: [
      { ref: "b01", type: "caption", speaker: "narration", readingOrder: 1, text: "上一場衝突，還在震。" },
      { ref: "b03", type: "caption", speaker: "narration", readingOrder: 2, text: "列車把他們推向下一站。" },
    ],
    p02: [
      { ref: "b01", type: "caption", speaker: "narration", readingOrder: 1, text: "海上列車，正在加速。" },
      { ref: "b02", type: "dialogue", speaker: "raimondo", readingOrder: 2, text: "等一下，我們真的在海上跑？" },
      { ref: "b03", type: "reaction", speaker: "raimondo", readingOrder: 3, text: "這也太快了吧。", optional: true },
    ],
    p03: [
      { ref: "b01", type: "dialogue", speaker: "raimondo", readingOrder: 1, text: "你坐得下嗎？" },
      { ref: "b03", type: "dialogue", speaker: "raimondo", readingOrder: 2, text: "大家都換座位了，你還這麼冷靜？" },
      { ref: "b05", type: "dialogue", speaker: "golem", readingOrder: 3, text: "座位很勇敢。" },
    ],
    p04: [
      { ref: "b02", type: "dialogue", speaker: "conductor", readingOrder: 1, text: "請出示您的車票。" },
      { ref: "b03", type: "reaction", speaker: "raimondo", readingOrder: 2, text: "這個……有點複雜。" },
      { ref: "b04", type: "dialogue", speaker: "passenger", readingOrder: 3, text: "那是什麼？", optional: true },
    ],
    p05: [
      { ref: "b02", type: "dialogue", speaker: "raimondo", readingOrder: 1, text: "我只是搭錯車，怎麼變洗碗？" },
      { ref: "b03", type: "dialogue", speaker: "golem", readingOrder: 2, text: "勞動公平。" },
    ],
    p06: [
      { ref: "b01", type: "dialogue", speaker: "raimondo", readingOrder: 1, text: "你把門擋住了啦！" },
      { ref: "b02", type: "dialogue", speaker: "golem", readingOrder: 2, text: "我知道。", optional: true },
      { ref: "b03", type: "dialogue", speaker: "passenger", readingOrder: 3, text: "借過……", optional: true },
    ],
    p07: [
      { ref: "b02", type: "reaction", speaker: "raimondo", readingOrder: 1, text: "那是什麼？" },
      { ref: "b01", type: "caption", speaker: "narration", readingOrder: 2, text: "窗外，光變了。", optional: true },
    ],
    p08: [
      { ref: "b01", type: "reaction", speaker: "raimondo", readingOrder: 1, text: "等一下。" },
    ],
    p09: [
      { ref: "b02", type: "dialogue", speaker: "golem", readingOrder: 1, text: "退後。", optional: true },
      { ref: "b01", type: "dialogue", speaker: "raimondo", readingOrder: 2, text: "有人在那裡。", optional: true },
    ],
    p10: [
      { ref: "b02", type: "reaction", speaker: "raimondo", readingOrder: 1, text: "石頭……" },
      { ref: "b03", type: "dialogue", speaker: "golem", readingOrder: 2, text: "我在。", optional: true },
      { ref: "b01", type: "caption", speaker: "narration", readingOrder: 3, text: "燈暗了。", optional: true },
    ],
  };

  const EPISODE_CONFIG = window.CRASHER_MANGA_EPISODES || {};
  let externalSeed = { pages: {} };

  function episodeConfig(episode = state?.episode || DEFAULT_META.episode) {
    return EPISODE_CONFIG[episode] || EPISODE_CONFIG.ep21;
  }

  function pageConfig(
    episode = state?.episode || DEFAULT_META.episode,
    page = state?.page || DEFAULT_META.page,
  ) {
    const shared = episodeConfig(episode)?.pages?.[page] || null;
    if (!shared) return null;
    const legacy = episode === "ep21" ? JP21_PAGE_CONFIG[page] || {} : {};
    return { ...legacy, ...shared, boxes: legacy.boxes || [] };
  }

  function firstPage(episode) {
    return Object.keys(episodeConfig(episode)?.pages || {})[0] || "p01";
  }

  function currentSeedSuggestions() {
    if (state.episode === "ep21") return JP21_SEED_TEXT[state.page] || [];
    return externalSeed.pages?.[state.page] || [];
  }

  async function loadSeedForEpisode(episode) {
    externalSeed = { pages: {} };
    const config = episodeConfig(episode);
    if (!config?.seedPath) {
      if (episode === "ep23") {
        els.seedStatus.textContent = "EP23 seed 尚待 PM2 / Nana2 提供，本工具不自行建立台詞。";
        els.seedStatus.className = "status-line";
      }
      return;
    }
    try {
      const response = await fetch(`${app.dataset.seedBase}${config.seedPath}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const seed = await response.json();
      const valid = seed.schemaVersion === "0.1"
        && seed.project === "crasher-nwf"
        && seed.chapter === config.chapter
        && seed.episode === episode
        && seed.locale === config.locale
        && seed.version === config.version
        && seed.pages && typeof seed.pages === "object";
      if (!valid) throw new Error("metadata 不符合目前話數");
      externalSeed = seed;
      els.seedStatus.textContent = seed.status === "awaiting-pm2-nana2-content"
        ? "EP22 seed schema 已載入，候選內容等待 PM2 / Nana2 提供。"
        : "外部 seed JSON 已載入。";
      els.seedStatus.className = "status-line is-ok";
    } catch (error) {
      els.seedStatus.textContent = `seed 載入失敗：${error.message}`;
      els.seedStatus.className = "status-line is-error";
    }
  }

  const els = {
    stage: app.querySelector("[data-stage]"),
    art: app.querySelector("[data-art]"),
    subtitle: app.querySelector(".subtitle"),
    textLayer: app.querySelector("[data-text-layer]"),
    frame: app.querySelector("[data-preview-frame]"),
    filename: app.querySelector("[data-filename]"),
    saveState: app.querySelector("[data-save-state]"),
    metadataSummary: app.querySelector("[data-metadata-summary]"),
    boxList: app.querySelector("[data-box-list]"),
    seedList: app.querySelector("[data-seed-list]"),
    seedStatus: app.querySelector("[data-seed-status]"),
    empty: app.querySelector("[data-empty-state]"),
    controls: app.querySelector("[data-box-controls]"),
    selectedId: app.querySelector("[data-selected-id]"),
    text: app.querySelector("[data-box-text]"),
    type: app.querySelector("[data-box-type]"),
    speaker: app.querySelector("[data-box-speaker]"),
    readingOrder: app.querySelector("[data-reading-order]"),
    fontSize: app.querySelector("[data-font-size]"),
    shape: app.querySelector("[data-box-shape]"),
    note: app.querySelector("[data-box-note]"),
    readingOrderStatus: app.querySelector("[data-reading-order-status]"),
    overflow: app.querySelector("[data-overflow-status]"),
    status: app.querySelector("[data-app-status]"),
    utfInput: app.querySelector("[data-utf-input]"),
    utfPreview: app.querySelector("[data-utf-preview]"),
    utfStatus: app.querySelector("[data-utf-status]"),
    importInput: app.querySelector("[data-import]"),
    pageSwitch: app.querySelector("[data-page-switch]"),
  };

  let state = null;
  state = createDefaultState();
  let selectedBoxId = state.boxes[0]?.id || null;
  let interaction = null;
  let isDirty = false;
  let currentFileName = null;
  const artDirectory = els.art.src.slice(0, els.art.src.lastIndexOf("/") + 1);

  function pageBase(page, episode = state?.episode || DEFAULT_META.episode) {
    return `c_nwf_ch02_${episode}_${page}`;
  }

  function createDefaultState(
    episode = DEFAULT_META.episode,
    page = firstPage(episode),
  ) {
    const episodeData = episodeConfig(episode);
    const config = pageConfig(episode, page);
    if (!config) throw new Error(`不支援 ${episode} ${page}`);
    const defaultBoxes = config.boxes || [];
    return {
      schemaVersion: "0.1",
      ...DEFAULT_META,
      chapter: episodeData.chapter,
      episode,
      page,
      version: episodeData.version,
      locale: episodeData.locale,
      source: {
        sourceName: config.sourceName || config.artAsset,
        artAsset: config.artAsset,
        width: config.width,
        height: config.height,
        assetType: config.assetType,
        readyForTextLayerEditor: config.status,
        textLayerOptional: Boolean(config.textLayerOptional),
      },
      editor: { nextBoxNumber: defaultBoxes.length + 1 },
      boxes: defaultBoxes.map((box, index) => createBox(index + 1, box, page, episode)),
    };
  }

  function createBox(
    number,
    overrides = {},
    page = state?.page || "p01",
    episode = state?.episode || "ep21",
  ) {
    const suffix = String(number).padStart(2, "0");
    const defaultPosition = 5 + ((number - 1) % 6) * 4;
    const base = {
      id: `${pageBase(page, episode)}_b${suffix}`,
      type: "caption",
      shape: "text-only",
      text: "",
      box: {
        x: defaultPosition,
        y: defaultPosition,
        width: 30,
        height: 10,
        unit: "percent",
      },
      style: {
        fontSize: 32,
        lineHeight: 1.25,
        writingMode: "horizontal-tb",
        textAlign: "center",
        verticalAlign: "middle",
        fontFamily: "system-cjk",
        color: "#111111",
        background: "transparent",
        border: "none",
      },
      readingOrder: number,
      speaker: null,
      note: "",
    };
    return {
      ...base,
      ...overrides,
      box: { ...base.box, ...(overrides.box || {}), unit: "percent" },
      style: { ...base.style, ...(overrides.style || {}) },
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

  function generatedBase() {
    return `c_nwf_${[
      state?.chapter || DEFAULT_META.chapter,
      state?.episode || DEFAULT_META.episode,
      state?.page || DEFAULT_META.page,
    ].map((part) => normalizeToken(part, "unknown")).join("_")}`;
  }

  function generatedFilename() {
    return `${generatedBase()}_text_${normalizeToken(state.locale, "zh-tw")}_${normalizeToken(state.version, "v01")}.json`;
  }

  function storageKey(page = state.page) {
    return `${state.project}_${state.chapter}_${state.episode}_${page}_${state.locale}_editorState_${state.version}`;
  }

  function exportedKey(page = state.page) {
    return `${storageKey(page)}-lastExported`;
  }

  function exportDocument(source = state) {
    const { editor, ...document } = source;
    return structuredClone(document);
  }

  function canonicalize(value) {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value && typeof value === "object") {
      return Object.keys(value).sort().reduce((result, key) => {
        result[key] = canonicalize(value[key]);
        return result;
      }, {});
    }
    return value;
  }

  function currentContentHash(source = state) {
    return JSON.stringify(canonicalize(exportDocument(source)));
  }

  function refreshDirtyState() {
    const lastExportedHash = localStorage.getItem(exportedKey());
    if (lastExportedHash && lastExportedHash === currentContentHash()) {
      setSaveState("exported", "已匯出");
      return false;
    }
    setSaveState("dirty", "未匯出");
    return true;
  }

  function setSaveState(stateName, label) {
    isDirty = stateName === "dirty";
    els.saveState.textContent = label;
    els.saveState.className = `save-state is-${stateName}`;
  }

  function markDirty() {
    setSaveState("dirty", "未匯出");
  }

  function renderMetadataSummary() {
    const rows = [
      ["project", state.project],
      ["chapter", state.chapter],
      ["episode", state.episode],
      ["page", state.page],
      ["locale", state.locale],
      ["version", state.version],
      ["sourceName", state.source.sourceName],
      ["artAsset", state.source.artAsset],
      ["assetType", state.source.assetType || "manga-page"],
      ["status", state.source.readyForTextLayerEditor || "yes"],
      ["textLayerOptional", String(Boolean(state.source.textLayerOptional))],
      ["box count", String(state.boxes.length)],
      ["current file", currentFileName || "尚未匯入檔案"],
    ];
    els.metadataSummary.replaceChildren(...rows.flatMap(([term, value]) => {
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = term;
      dd.textContent = value;
      return [dt, dd];
    }));
  }

  function duplicateReadingOrders() {
    const counts = new Map();
    state.boxes.forEach((box) => {
      counts.set(box.readingOrder, (counts.get(box.readingOrder) || 0) + 1);
    });
    return [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([order]) => order)
      .sort((left, right) => left - right);
  }

  function renderReadingOrderStatus() {
    const duplicates = duplicateReadingOrders();
    els.readingOrderStatus.textContent = duplicates.length
      ? `警告：readingOrder ${duplicates.join("、")} 重複。`
      : "readingOrder 無重複。";
    els.readingOrderStatus.className = `status-line is-${duplicates.length ? "error" : "ok"}`;
    return duplicates;
  }

  function selectedBox() {
    return state.boxes.find((box) => box.id === selectedBoxId) || null;
  }

  function boxNumber(id) {
    const match = String(id).match(/_b(\d+)$/);
    return match ? Number(match[1]) : 0;
  }

  function syncAllBoxIds() {
    state.boxes.forEach((box, index) => {
      const number = boxNumber(box.id) || index + 1;
      const oldId = box.id;
      box.id = `${generatedBase()}_b${String(number).padStart(2, "0")}`;
      if (selectedBoxId === oldId) selectedBoxId = box.id;
    });
  }

  function syncMetadataFromInputs() {
    app.querySelectorAll("[data-meta]").forEach((input) => {
      const key = input.dataset.meta;
      state[key] = normalizeToken(input.value, DEFAULT_META[key]);
      input.value = state[key];
    });
    syncAllBoxIds();
    saveLocal(false);
    render();
  }

  function syncMetadataToInputs() {
    app.querySelectorAll("[data-meta]").forEach((input) => {
      input.value = state[input.dataset.meta] || DEFAULT_META[input.dataset.meta];
    });
  }

  function scaledFontSize(sourceFontSize) {
    const sourceWidth = Number(state.source.width) || 1024;
    const renderedWidth = els.stage.getBoundingClientRect().width || sourceWidth;
    return Math.max(6, Number(sourceFontSize) * (renderedWidth / sourceWidth));
  }

  function createBoxNode(box) {
    const node = document.createElement("div");
    node.className = "edit-box";
    node.classList.toggle("is-selected", box.id === selectedBoxId);
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
    handle.setAttribute("aria-label", `調整 ${box.id} 大小`);
    node.append(handle);
    return node;
  }

  function renderBoxList() {
    els.boxList.replaceChildren();
    const overflowIds = currentOverflowIds();
    const duplicateOrders = duplicateReadingOrders();
    [...state.boxes]
      .sort((left, right) => left.readingOrder - right.readingOrder || left.id.localeCompare(right.id))
      .forEach((box) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "box-list-item";
        button.classList.toggle("is-selected", box.id === selectedBoxId);
        button.classList.toggle("has-order-warning", duplicateOrders.includes(box.readingOrder));
        button.dataset.selectBox = box.id;

        const order = document.createElement("span");
        order.className = "box-list-order";
        order.textContent = `#${box.readingOrder}`;

        const copy = document.createElement("span");
        copy.className = "box-list-copy";
        const id = document.createElement("strong");
        id.textContent = box.id;
        const text = document.createElement("span");
        text.textContent = box.text || "(空白框)";
        copy.append(id, text);
        button.append(order, copy);

        if (overflowIds.includes(box.id)) {
          const alert = document.createElement("span");
          alert.className = "box-list-alert";
          alert.textContent = "overflow";
          button.append(alert);
        }
        els.boxList.append(button);
      });
  }

  function renderSeedSuggestions() {
    const suggestions = currentSeedSuggestions();
    els.seedList.replaceChildren();
    if (!suggestions.length) {
      const empty = document.createElement("p");
      empty.className = "seed-empty";
      empty.textContent = "本頁沒有建議台詞。";
      els.seedList.append(empty);
      return;
    }
    suggestions.forEach((suggestion, index) => {
      const item = document.createElement("div");
      item.className = "seed-item";
      item.classList.toggle("is-optional", Boolean(suggestion.optional));
      const copy = document.createElement("div");
      copy.className = "seed-copy";
      const text = document.createElement("strong");
      text.textContent = suggestion.text;
      const meta = document.createElement("span");
      meta.textContent = `${suggestion.ref || suggestion.seedId} · ${suggestion.type} · ${suggestion.speaker} · #${suggestion.readingOrder}${suggestion.optional ? " · optional" : ""}`;
      copy.append(text, meta);
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.applySeed = String(index);
      button.textContent = "套用";
      item.append(copy, button);
      els.seedList.append(item);
    });
  }

  function applySeedSuggestion(index) {
    const suggestion = currentSeedSuggestions()[index];
    const box = selectedBox();
    if (!suggestion || !box) {
      els.seedStatus.textContent = "請先建立並選取一個文字框。";
      els.seedStatus.className = "status-line is-error";
      return;
    }
    const current = box.text.trim();
    if (current && current !== suggestion.text && !window.confirm(
      `${box.id} 已有文字。確定要用建議台詞取代嗎？`,
    )) {
      els.seedStatus.textContent = "已取消，原文字與框位均未變更。";
      els.seedStatus.className = "status-line";
      return;
    }
    const nextText = suggestion.text.normalize("NFC");
    const unchanged = box.text === nextText
      && box.type === suggestion.type
      && box.speaker === suggestion.speaker
      && box.readingOrder === suggestion.readingOrder;
    if (unchanged) {
      els.seedStatus.textContent = "選取框已是相同內容，未產生變更。";
      els.seedStatus.className = "status-line is-ok";
      return;
    }
    box.text = nextText;
    box.type = suggestion.type;
    box.speaker = suggestion.speaker;
    box.readingOrder = suggestion.readingOrder;
    saveLocal(false);
    render();
    els.seedStatus.textContent = `已將 ${suggestion.ref || suggestion.seedId} 建議台詞套用到 ${box.id}；框位與樣式未變更。`;
    els.seedStatus.className = "status-line is-ok";
    setStatus(`${box.id} 已套用建議台詞，尚未匯出。`, "ok");
  }

  function renderControls() {
    const box = selectedBox();
    els.empty.hidden = state.boxes.length > 0;
    els.controls.hidden = !box;
    if (!box) return;
    els.selectedId.textContent = box.id;
    els.text.value = box.text;
    els.type.value = box.type;
    els.speaker.value = box.speaker || "";
    els.readingOrder.value = box.readingOrder;
    els.fontSize.value = box.style.fontSize;
    els.shape.value = box.shape;
    els.note.value = box.note || "";
    renderCoordinates(box);
  }

  function renderPageContext() {
    const config = pageConfig();
    els.art.src = `${artDirectory}${config.artAsset}`;
    els.art.width = config.width;
    els.art.height = config.height;
    els.art.alt = `${state.episode.toUpperCase()} ${config.label} clean art`;
    els.stage.style.aspectRatio = `${config.width} / ${config.height}`;
    const optional = config.textLayerOptional ? " · text optional" : "";
    els.subtitle.textContent =
      `${state.episode.toUpperCase()} ${config.label} · zh-tw · ${config.assetType} · ${config.status}${optional}`;
    app.querySelectorAll("[data-episode-select]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.episodeSelect === state.episode);
    });
    els.pageSwitch.replaceChildren(...Object.entries(episodeConfig().pages).map(([page, item]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.pageSelect = page;
      button.textContent = item.label;
      button.classList.toggle("is-active", page === state.page);
      button.classList.toggle("is-conditional", item.status === "conditional");
      if (item.status === "conditional") button.title = "conditional：可排字，後續可能調整框位";
      return button;
    }));
  }

  function render() {
    renderPageContext();
    renderSeedSuggestions();
    syncMetadataToInputs();
    els.filename.textContent = generatedFilename();
    renderMetadataSummary();
    renderReadingOrderStatus();
    els.textLayer.replaceChildren(...state.boxes.map(createBoxNode));
    renderControls();
    requestAnimationFrame(() => {
      checkOverflow();
      renderBoxList();
    });
  }

  function renderCoordinates(box = selectedBox()) {
    if (!box) return;
    ["x", "y", "width", "height"].forEach((key) => {
      const input = app.querySelector(`[data-coordinate-input="${key}"]`);
      if (document.activeElement !== input) input.value = Number(box.box[key]).toFixed(2);
    });
  }

  function setStatus(message, kind = "") {
    els.status.textContent = message;
    els.status.className = `status-line${kind ? ` is-${kind}` : ""}`;
  }

  function saveLocal(announce = true, checkDirty = true) {
    localStorage.setItem(storageKey(), JSON.stringify(state));
    if (checkDirty) refreshDirtyState();
    if (announce) {
      setStatus(
        isDirty
          ? `已暫存 ${state.boxes.length} 個文字框；仍需匯出 JSON。`
          : `已暫存 ${state.boxes.length} 個文字框；內容與最後匯出一致。`,
        "ok",
      );
    }
  }

  function loadLocal() {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return false;
    try {
      state = validateDocument(JSON.parse(raw));
      selectedBoxId = state.boxes[0]?.id || null;
      return true;
    } catch (error) {
      localStorage.removeItem(storageKey());
      setStatus(`暫存資料無法讀取：${error.message}`, "error");
      return false;
    }
  }

  function loadPage(page) {
    if (!pageConfig(state.episode, page) || page === state.page) return;
    state = createDefaultState(state.episode, page);
    selectedBoxId = state.boxes[0]?.id || null;
    currentFileName = null;
    els.seedStatus.textContent = "";
    const restored = loadLocal();
    const lastExportedHash = localStorage.getItem(exportedKey());
    const matchesExport = restored && lastExportedHash === currentContentHash();
    if (matchesExport) currentFileName = generatedFilename();
    render();
    runUtfRoundTrip();
    if (matchesExport) setSaveState("exported", "已匯出");
    else setSaveState("dirty", restored ? "暫存未匯出" : "未匯出");
    renderMetadataSummary();
    setStatus(
      restored
        ? `已還原 ${state.episode.toUpperCase()} ${pageConfig().label} 的本機資料。`
        : `已切換至 ${state.episode.toUpperCase()} ${pageConfig().label} 預設資料，請完成後匯出 JSON。`,
      "ok",
    );
  }

  async function loadEpisode(episode) {
    if (!EPISODE_CONFIG[episode] || episode === state.episode) return;
    state = createDefaultState(episode, firstPage(episode));
    selectedBoxId = state.boxes[0]?.id || null;
    currentFileName = null;
    els.seedStatus.textContent = "";
    const restored = loadLocal();
    await loadSeedForEpisode(episode);
    const lastExportedHash = localStorage.getItem(exportedKey());
    const matchesExport = restored && lastExportedHash === currentContentHash();
    if (matchesExport) currentFileName = generatedFilename();
    render();
    runUtfRoundTrip();
    if (matchesExport) setSaveState("exported", "已匯出");
    else setSaveState("dirty", restored ? "暫存未匯出" : "未匯出");
    renderMetadataSummary();
    setStatus(
      restored
        ? `已還原 ${episode.toUpperCase()} ${pageConfig().label} 的本機資料。`
        : `已切換至 ${episode.toUpperCase()} ${pageConfig().label}，請完成後匯出 JSON。`,
      "ok",
    );
  }

  function validateDocument(candidate) {
    if (!candidate || candidate.schemaVersion !== "0.1") {
      throw new Error("只接受 schemaVersion 0.1");
    }
    if (candidate.locale !== "zh-tw") {
      throw new Error("V0.4 只接受 zh-tw");
    }
    if (!EPISODE_CONFIG[candidate.episode]
      || !pageConfig(candidate.episode, candidate.page)) {
      throw new Error("不支援此 episode / page");
    }
    if (!candidate.source || !Array.isArray(candidate.boxes)) {
      throw new Error("缺少 source 或 boxes");
    }
    const merged = {
      ...createDefaultState(candidate.episode, candidate.page),
      ...candidate,
      source: { ...createDefaultState(candidate.episode, candidate.page).source, ...candidate.source },
      editor: { nextBoxNumber: 1, ...(candidate.editor || {}) },
      boxes: candidate.boxes.map((candidateBox, index) => {
        const base = createBox(index + 1, {}, candidate.page, candidate.episode);
        const box = {
          ...base,
          ...candidateBox,
          text: String(candidateBox.text || "").normalize("NFC"),
          box: { ...base.box, ...(candidateBox.box || {}), unit: "percent" },
          style: { ...base.style, ...(candidateBox.style || {}) },
          readingOrder: Math.max(1, Number(candidateBox.readingOrder) || index + 1),
          speaker: candidateBox.speaker === null ? null : String(candidateBox.speaker || ""),
          note: String(candidateBox.note || ""),
        };
        clampBox(box.box);
        return box;
      }),
    };
    const ids = merged.boxes.map((box) => box.id);
    if (new Set(ids).size !== ids.length) throw new Error("box id 不可重複");
    const maxNumber = Math.max(0, ...ids.map(boxNumber));
    merged.editor.nextBoxNumber = Math.max(
      Number(merged.editor.nextBoxNumber) || 1,
      maxNumber + 1,
    );
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

  function selectBox(id, announce = false) {
    if (!state.boxes.some((box) => box.id === id)) return;
    selectedBoxId = id;
    render();
    if (announce) setStatus(`已選取 ${id}。`, "ok");
  }

  function addBox() {
    const number = state.editor.nextBoxNumber;
    state.editor.nextBoxNumber += 1;
    const box = createBox(number);
    state.boxes.push(box);
    selectedBoxId = box.id;
    saveLocal(false);
    render();
    setStatus(`已新增 ${box.id}。`, "ok");
  }

  function removeSelectedBox() {
    const box = selectedBox();
    if (!box) return;
    const index = state.boxes.findIndex((item) => item.id === box.id);
    state.boxes.splice(index, 1);
    selectedBoxId = state.boxes[index]?.id || state.boxes[index - 1]?.id || null;
    saveLocal(false);
    render();
    setStatus(`已刪除 ${box.id}。`, "ok");
  }

  function beginInteraction(event) {
    if (app.dataset.mode !== "edit") return;
    const node = event.target.closest(".edit-box");
    if (!node) return;
    if (node.dataset.boxId !== selectedBoxId) selectBox(node.dataset.boxId);
    const box = selectedBox();
    if (!box) return;
    const stageRect = els.stage.getBoundingClientRect();
    interaction = {
      boxId: box.id,
      type: event.target.closest(".resize-handle") ? "resize" : "drag",
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      stageWidth: stageRect.width,
      stageHeight: stageRect.height,
      origin: { ...box.box },
    };
    try {
      node.setPointerCapture(event.pointerId);
    } catch {}
    event.preventDefault();
  }

  function updateInteraction(event) {
    if (!interaction || event.pointerId !== interaction.pointerId) return;
    const box = state.boxes.find((item) => item.id === interaction.boxId);
    const node = els.textLayer.querySelector(`[data-box-id="${CSS.escape(interaction.boxId)}"]`);
    if (!box || !node) return;
    const dx = ((event.clientX - interaction.startX) / interaction.stageWidth) * 100;
    const dy = ((event.clientY - interaction.startY) / interaction.stageHeight) * 100;
    if (interaction.type === "drag") {
      box.box.x = interaction.origin.x + dx;
      box.box.y = interaction.origin.y + dy;
    } else {
      box.box.width = interaction.origin.width + dx;
      box.box.height = interaction.origin.height + dy;
    }
    clampBox(box.box);
    node.style.left = `${box.box.x}%`;
    node.style.top = `${box.box.y}%`;
    node.style.width = `${box.box.width}%`;
    node.style.height = `${box.box.height}%`;
    renderCoordinates(box);
    checkOverflow();
    event.preventDefault();
  }

  function endInteraction(event) {
    if (!interaction || event.pointerId !== interaction.pointerId) return;
    const id = interaction.boxId;
    interaction = null;
    saveLocal(false);
    renderBoxList();
    setStatus(`${id} 框位已更新並暫存。`, "ok");
  }

  function updateRenderedScale() {
    state.boxes.forEach((box) => {
      const node = els.textLayer.querySelector(`[data-box-id="${CSS.escape(box.id)}"]`);
      if (node) node.style.fontSize = `${scaledFontSize(box.style.fontSize)}px`;
    });
  }

  function currentOverflowIds() {
    return [...els.textLayer.querySelectorAll(".edit-box.is-overflowing")]
      .map((node) => node.dataset.boxId);
  }

  function checkOverflow() {
    updateRenderedScale();
    const overflowIds = [];
    state.boxes.forEach((box) => {
      const node = els.textLayer.querySelector(`[data-box-id="${CSS.escape(box.id)}"]`);
      if (!node) return;
      const text = node.querySelector(".box-text");
      const contentOverflow = text.scrollWidth > text.clientWidth
        || text.scrollHeight > text.clientHeight;
      const boundsOverflow = box.box.x < 0 || box.box.y < 0
        || box.box.x + box.box.width > 100 || box.box.y + box.box.height > 100;
      const encodingError = box.text.includes("\uFFFD");
      const overflow = contentOverflow || boundsOverflow || encodingError;
      node.classList.toggle("is-overflowing", overflow);
      if (overflow) overflowIds.push(box.id);
    });
    els.overflow.textContent = overflowIds.length
      ? `警告：${overflowIds.join("、")} 發生 overflow、越界或編碼異常。`
      : `通過：${state.boxes.length} 個文字框未偵測到 overflow。`;
    els.overflow.className = `status-line is-${overflowIds.length ? "error" : "ok"}`;
    return overflowIds;
  }

  function exportJson() {
    syncMetadataFromInputs();
    const json = JSON.stringify(exportDocument(), null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = generatedFilename();
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    currentFileName = generatedFilename();
    localStorage.setItem(exportedKey(), currentContentHash());
    setSaveState("exported", "已匯出");
    renderMetadataSummary();
    const duplicates = duplicateReadingOrders();
    setStatus(
      duplicates.length
        ? `已匯出 ${state.boxes.length} 框；警告 readingOrder ${duplicates.join("、")} 重複。`
        : `已匯出 ${state.boxes.length} 框 JSON（UTF-8 no BOM）。`,
      duplicates.length ? "error" : "ok",
    );
  }

  async function importJson(file) {
    if (!file) return;
    try {
      const raw = (await file.text()).replace(/^\uFEFF/, "");
      if (raw.includes("\uFFFD")) throw new Error("檔案含 U+FFFD");
      const candidate = JSON.parse(raw);
      const checks = ["project", "chapter", "episode", "page", "locale", "version"];
      const mismatches = checks.filter((key) => candidate[key] !== state[key]);
      if (mismatches.length) {
        const detail = mismatches.map((key) => `${key}: ${candidate[key]} ≠ ${state[key]}`).join("；");
        throw new Error(`metadata 不一致（${detail}）。請先切到正確頁面再匯入。`);
      }
      state = validateDocument(candidate);
      selectedBoxId = state.boxes[0]?.id || null;
      currentFileName = file.name;
      saveLocal(false, false);
      localStorage.setItem(exportedKey(), currentContentHash());
      render();
      setSaveState("loaded", "已載入");
      setStatus(`已載入 ${file.name}，共 ${state.boxes.length} 個文字框。`, "ok");
    } catch (error) {
      setStatus(`匯入失敗：${error.message}`, "error");
    } finally {
      els.importInput.value = "";
    }
  }

  function runUtfRoundTrip() {
    const first = els.utfInput.value.normalize("NFC");
    const expected = [
      first,
      "多框測試：列車把他們推向下一站。！？「」",
      "",
    ];
    const testDocument = structuredClone(state);
    while (testDocument.boxes.length < 3) {
      testDocument.boxes.push(createBox(testDocument.boxes.length + 1));
    }
    testDocument.boxes.slice(0, 3).forEach((box, index) => {
      box.text = expected[index];
    });
    const memory = testDocument.boxes.slice(0, 3).map((box) => box.text.normalize("NFC"));
    const exported = JSON.stringify(testDocument);
    const bytes = new TextEncoder().encode(exported);
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const importedDocument = validateDocument(JSON.parse(decoded));
    const imported = importedDocument.boxes.slice(0, 3).map((box) => box.text.normalize("NFC"));
    els.utfPreview.replaceChildren(...imported.map((value) => {
      const span = document.createElement("span");
      span.textContent = value;
      return span;
    }));
    const preview = [...els.utfPreview.children].map((node) => node.textContent.normalize("NFC"));
    const exact = [memory, imported, preview]
      .every((values) => values.every((value, index) => value === expected[index]));
    const clean = [memory, imported, preview].flat()
      .every((value) => !value.includes("\uFFFD"));
    const noBom = !(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf);
    if (exact && clean && noBom) {
      els.utfStatus.textContent =
        "通過：多框中文、空白框、JSON export/import 與 Preview DOM 完全一致；UTF-8 no BOM。";
      els.utfStatus.className = "status-line is-ok";
      return true;
    }
    els.utfStatus.textContent = "失敗：多框 UTF-8 round-trip 不一致或含 U+FFFD。";
    els.utfStatus.className = "status-line is-error";
    return false;
  }

  function updateSelected(mutator, rerender = false) {
    const box = selectedBox();
    if (!box) return;
    mutator(box);
    saveLocal(false);
    if (rerender) render();
    else {
      const node = els.textLayer.querySelector(`[data-box-id="${CSS.escape(box.id)}"]`);
      if (node) {
        node.dataset.shape = box.shape;
        node.style.fontSize = `${scaledFontSize(box.style.fontSize)}px`;
        node.querySelector(".box-text").textContent = box.text;
      }
      checkOverflow();
      renderBoxList();
    }
  }

  app.addEventListener("click", (event) => {
    const episodeButton = event.target.closest("button[data-episode-select]");
    if (episodeButton) {
      loadEpisode(episodeButton.dataset.episodeSelect);
      return;
    }
    const pageButton = event.target.closest("button[data-page-select]");
    if (pageButton) {
      loadPage(pageButton.dataset.pageSelect);
      return;
    }
    const seedButton = event.target.closest("button[data-apply-seed]");
    if (seedButton) {
      applySeedSuggestion(Number(seedButton.dataset.applySeed));
      return;
    }
    const modeButton = event.target.closest("button[data-mode]");
    if (modeButton) {
      app.dataset.mode = modeButton.dataset.mode;
      app.querySelectorAll("button[data-mode]").forEach((button) => {
        button.classList.toggle("is-active", button === modeButton);
      });
      checkOverflow();
      return;
    }
    const widthButton = event.target.closest("[data-preview-width]");
    if (widthButton) {
      els.frame.dataset.width = widthButton.dataset.previewWidth;
      app.querySelectorAll("[data-preview-width]").forEach((button) => {
        button.classList.toggle("is-active", button === widthButton);
      });
      requestAnimationFrame(() => {
        checkOverflow();
        renderBoxList();
      });
      return;
    }
    const listButton = event.target.closest("[data-select-box]");
    if (listButton) {
      selectBox(listButton.dataset.selectBox, true);
      return;
    }
    if (event.target.closest("[data-add-box]")) return addBox();
    if (event.target.closest("[data-remove-box]")) return removeSelectedBox();
    if (event.target.closest("[data-save]")) return saveLocal(true);
    if (event.target.closest("[data-export]")) return exportJson();
    if (event.target.closest("[data-utf-test]")) return runUtfRoundTrip();
    if (event.target.closest("[data-reset]")) {
      localStorage.removeItem(storageKey());
      localStorage.removeItem(exportedKey());
      currentFileName = null;
      state = createDefaultState(state.episode, state.page);
      selectedBoxId = state.boxes[0]?.id || null;
      saveLocal(false);
      render();
      runUtfRoundTrip();
      return setStatus(`已重設為 ${state.episode.toUpperCase()} ${pageConfig().label} 測試資料。`, "ok");
    }
  });

  app.querySelectorAll("[data-meta]").forEach((input) => {
    input.addEventListener("change", syncMetadataFromInputs);
  });
  els.text.addEventListener("input", () => updateSelected((box) => {
    box.text = els.text.value.normalize("NFC");
  }));
  els.type.addEventListener("change", () => updateSelected((box) => {
    box.type = els.type.value;
  }, true));
  els.speaker.addEventListener("input", () => updateSelected((box) => {
    box.speaker = els.speaker.value || null;
  }));
  els.readingOrder.addEventListener("input", () => updateSelected((box) => {
    box.readingOrder = Math.max(1, Number(els.readingOrder.value) || 1);
  }, true));
  els.fontSize.addEventListener("input", () => updateSelected((box) => {
    box.style.fontSize = clamp(Number(els.fontSize.value) || 18, 10, 72);
  }));
  els.shape.addEventListener("change", () => updateSelected((box) => {
    box.shape = els.shape.value;
  }, true));
  els.note.addEventListener("input", () => updateSelected((box) => {
    box.note = els.note.value;
  }));
  app.querySelectorAll("[data-coordinate-input]").forEach((input) => {
    input.addEventListener("input", () => {
      if (input.value === "") return;
      const value = Number(input.value);
      if (!Number.isFinite(value)) return;
      updateSelected((box) => {
        box.box[input.dataset.coordinateInput] = value;
        clampBox(box.box);
      }, true);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!event.key.startsWith("Arrow") || app.dataset.mode !== "edit") return;
    const target = event.target;
    if (target instanceof HTMLElement && (
      target.matches("input, textarea, select, button") || target.isContentEditable
    )) return;
    const box = selectedBox();
    if (!box) return;
    const step = event.shiftKey ? 1 : 0.1;
    if (event.key === "ArrowLeft") box.box.x -= step;
    if (event.key === "ArrowRight") box.box.x += step;
    if (event.key === "ArrowUp") box.box.y -= step;
    if (event.key === "ArrowDown") box.box.y += step;
    clampBox(box.box);
    saveLocal(false);
    render();
    setStatus(`${box.id} 已鍵盤微調 ${step}% 。`, "ok");
    event.preventDefault();
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
  window.addEventListener("resize", () => requestAnimationFrame(() => {
    checkOverflow();
    renderBoxList();
  }));

  window.addEventListener("beforeunload", (event) => {
    if (!isDirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  app.dataset.mode = "edit";
  const restored = loadLocal();
  if (!selectedBoxId) selectedBoxId = state.boxes[0]?.id || null;
  const lastExportedHash = localStorage.getItem(exportedKey());
  const matchesExport = restored && lastExportedHash === currentContentHash();
  if (matchesExport) currentFileName = generatedFilename();
  render();
  loadSeedForEpisode(state.episode).then(renderSeedSuggestions);
  runUtfRoundTrip();
  if (matchesExport) setSaveState("exported", "已匯出");
  else setSaveState("dirty", restored ? "暫存未匯出" : "未匯出");
  renderMetadataSummary();
  setStatus(
    restored
      ? `已從 localStorage 還原 ${state.boxes.length} 個文字框。`
      : "已載入 JP21 P1 的 b01 / b02 測試資料，請完成後匯出 JSON。",
    "ok",
  );
})();
