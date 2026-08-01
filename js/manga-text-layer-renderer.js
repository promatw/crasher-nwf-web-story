(() => {
  "use strict";
  const api = {};
  api.scaledFontSize = (stage, data, box) => {
    const sourceWidth = Number(data.source?.width) || stage.clientWidth || 1024;
    return Math.max(6, Number(box.style?.fontSize || 24) * stage.clientWidth / sourceWidth);
  };
  api.fits = (node) => {
    const text = node.querySelector("span");
    return !text || (text.scrollWidth <= text.clientWidth + 1 && text.scrollHeight <= text.clientHeight + 1);
  };
  api.fitAfterLayout = (node, initialSize, minSize = 10) => {
    const text = node.querySelector("span");
    if (!text || !text.textContent.trim()) return;
    let size = initialSize;
    node.style.fontSize = `${size}px`;
    for (let i = 0; i < 24 && size > minSize && !api.fits(node); i += 1) {
      size = Math.max(minSize, size * 0.92);
      node.style.fontSize = `${size}px`;
    }
    node.dataset.renderedFontSize = size.toFixed(1);
    node.classList.toggle("is-overflowing", !api.fits(node));
  };
  api.createBox = (stage, data, box, className = "preview-box") => {
    const node = document.createElement("div");
    node.className = className;
    node.dataset.boxId = box.id;
    node.dataset.shape = box.shape || "text-only";
    node.style.left = `${box.box.x}%`;
    node.style.top = `${box.box.y}%`;
    node.style.width = `${box.box.width}%`;
    node.style.height = `${box.box.height}%`;
    node.style.fontSize = `${api.scaledFontSize(stage, data, box)}px`;
    node.style.lineHeight = String(box.style?.lineHeight || 1.25);
    node.style.writingMode = box.style?.writingMode || "horizontal-tb";
    node.style.textAlign = box.style?.textAlign || "center";
    node.style.color = box.style?.color || "#111";
    const span = document.createElement("span");
    span.textContent = box.text || "";
    node.append(span);
    return node;
  };
  api.render = (stage, layer, data, className = "preview-box", autoFit = false) => {
    const nodes = (data.boxes || []).map((box) => api.createBox(stage, data, box, className));
    layer.replaceChildren(...nodes);
    const fit = () => {
      if (autoFit) nodes.forEach((node, index) => api.fitAfterLayout(node, api.scaledFontSize(stage, data, data.boxes[index])));
    };
    requestAnimationFrame(fit);
    return nodes;
  };
  window.CrasherTextLayerRenderer = api;
})();
