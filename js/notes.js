document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================
     OLD NOTES MODAL (botão "Anotações" na page7)
     ============================================================ */
  const modal = document.getElementById("notes-modal");
  const btnTrigger = document.querySelector(".btn-notes-trigger");
  const btnClose = document.querySelector(".mac-close");
  const canvasContainer = document.querySelector(".canvas-container");
  const textInputOverlay = document.getElementById("text-input-overlay");

  if (modal && canvasContainer) {
    const tools = document.querySelectorAll(".tool-btn");
    const colors = document.querySelectorAll(".color-swatch");
    const selectStroke = document.getElementById("stroke-width");
    const btnClear = document.getElementById("btn-clear");

    const canvas = document.createElement("canvas");
    canvas.id = "notes-canvas";
    canvasContainer.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let isDrawing = false, currentTool = "pen", strokeColor = "#000000", strokeWidth = 5;
    let lastX = 0, lastY = 0;

    function resizeCanvas() {
      canvas.width = canvasContainer.clientWidth;
      canvas.height = canvasContainer.clientHeight;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (btnTrigger) {
      btnTrigger.addEventListener("click", () => {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
        resizeCanvas();
      });
    }

    if (btnClose) {
      btnClose.addEventListener("click", () => {
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
      });
    }

    if (btnClear) {
      btnClear.addEventListener("click", () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    }

    tools.forEach(btn => {
      btn.addEventListener("click", () => {
        tools.forEach(t => t.classList.remove("active"));
        btn.classList.add("active");
        currentTool = btn.dataset.tool;
        if (textInputOverlay) textInputOverlay.style.display = "none";
      });
    });

    colors.forEach(swatch => {
      swatch.addEventListener("click", () => {
        colors.forEach(c => c.classList.remove("active"));
        swatch.classList.add("active");
        strokeColor = swatch.dataset.color;
      });
    });

    if (selectStroke) {
      selectStroke.addEventListener("change", e => { strokeWidth = parseInt(e.target.value); });
    }

    let points = [];
    function getClientPos(e) {
      const rect = canvas.getBoundingClientRect();
      return { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top,
        pressure: e.pressure || 0.5,
        pointerType: e.pointerType
      };
    }

    canvas.addEventListener("pointerdown", e => {
      if (currentTool === "text") return;
      isDrawing = true;
      const p = getClientPos(e);
      points = [p];
      
      ctx.beginPath();
      ctx.fillStyle = currentTool === "eraser" ? "#ffffff" : strokeColor;
      const r = (strokeWidth * p.pressure) / 2;
      ctx.arc(p.x, p.y, r > 0.5 ? r : 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    canvas.addEventListener("pointermove", e => {
      if (!isDrawing || currentTool === "text") return;
      
      const newPoints = e.getCoalescedEvents ? 
        e.getCoalescedEvents().map(ce => getClientPos(ce)) : 
        [getClientPos(e)];

      newPoints.forEach(p => {
        const lastP = points[points.length - 1];
        if (!lastP) {
          points.push(p);
          return;
        }

        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        const currentP = (p.pressure + lastP.pressure) / 2;
        const isEraser = currentTool === "eraser";
        ctx.lineWidth = isEraser ? strokeWidth * 3 * currentP : strokeWidth * currentP;
        ctx.strokeStyle = isEraser ? "#ffffff" : strokeColor;

        // Quadratic smoothing
        const xc = (lastP.x + p.x) / 2;
        const yc = (lastP.y + p.y) / 2;
        ctx.moveTo(lastP.x, lastP.y);
        ctx.quadraticCurveTo(lastP.x, lastP.y, xc, yc);
        ctx.stroke();
        
        points.push(p);
      });
    });

    canvas.addEventListener("pointerup", () => { isDrawing = false; points = []; });
    canvas.addEventListener("pointerout", () => { isDrawing = false; points = []; });
  }

  /* ============================================================
     FLOATING PENCIL - DRAWING OVERLAY (draws on top of everything)
     ============================================================ */
  const fabBtn     = document.getElementById("fab-pencil");
  const overlay    = document.getElementById("drawing-overlay");
  const drawCanvas = document.getElementById("drawing-canvas");
  const dtbTools   = document.querySelectorAll(".dtb-tool");
  const dtbColors  = document.querySelectorAll(".dtb-color");
  const dtbStroke  = document.getElementById("dtb-stroke");
  const dtbClear   = document.getElementById("dtb-clear");
  const dtbClose   = document.getElementById("dtb-close");
  const dtbText    = document.getElementById("dtb-text-input");

  if (!fabBtn || !overlay || !drawCanvas) return;

  const dctx = drawCanvas.getContext("2d");
  let dDrawing = false, dTool = "pen", dColor = "#ffffff", dStroke = 5;
  let dLastX = 0, dLastY = 0;
  let overlayOpen = false;

  function resizeDrawCanvas() {
    // Save existing drawing
    const imgData = dctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
    drawCanvas.width = window.innerWidth;
    drawCanvas.height = window.innerHeight - 56;
    dctx.putImageData(imgData, 0, 0);
  }

  function openOverlay() {
    overlay.classList.add("active");
    fabBtn.classList.add("active");
    drawCanvas.width = window.innerWidth;
    drawCanvas.height = window.innerHeight - 56;
    overlayOpen = true;
    // Disable page scrolling/interactions behind
    document.body.style.overflow = "hidden";
  }

  function closeOverlay() {
    overlay.classList.remove("active");
    fabBtn.classList.remove("active");
    overlayOpen = false;
    document.body.style.overflow = "";
    if (dtbText) dtbText.style.display = "none";
  }

  fabBtn.addEventListener("click", () => {
    if (overlayOpen) closeOverlay(); else openOverlay();
  });

  dtbClose.addEventListener("click", closeOverlay);

  dtbClear.addEventListener("click", () => {
    dctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  });

  dtbTools.forEach(btn => {
    btn.addEventListener("click", () => {
      dtbTools.forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      dTool = btn.dataset.tool;
      if (dtbText) dtbText.style.display = "none";
    });
  });

  dtbColors.forEach(swatch => {
    swatch.addEventListener("click", () => {
      dtbColors.forEach(c => c.classList.remove("active"));
      swatch.classList.add("active");
      dColor = swatch.dataset.color;
    });
  });

  if (dtbStroke) {
    dtbStroke.addEventListener("change", e => { dStroke = parseInt(e.target.value); });
  }

  function getDPos(e) {
    const rect = drawCanvas.getBoundingClientRect();
    return { 
      x: e.clientX - rect.left, 
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5
    };
  }

  let pendingPoints = [];
  let rafPending = false;

  function renderQueue() {
    if (pendingPoints.length < 2) {
      rafPending = false;
      return;
    }

    dctx.beginPath();
    dctx.lineCap = "round";
    dctx.lineJoin = "round";
    
    if (dTool === "eraser") {
      dctx.globalCompositeOperation = "destination-out";
      dctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      dctx.globalCompositeOperation = "source-over";
      dctx.strokeStyle = dColor;
    }

    // We start from the last position
    dctx.moveTo(dLastX, dLastY);

    for (let i = 0; i < pendingPoints.length; i++) {
      const p = pendingPoints[i];
      
      // Dynamic width based on pressure
      const pPressure = p.pressure;
      dctx.lineWidth = dTool === "eraser" ? dStroke * 4 * pPressure : dStroke * pPressure;

      // Use quadratic curve for smoothing if we have enough points, 
      // otherwise lineTo for immediate feedback
      const xc = (dLastX + p.x) / 2;
      const yc = (dLastY + p.y) / 2;
      dctx.quadraticCurveTo(dLastX, dLastY, xc, yc);

      dLastX = p.x;
      dLastY = p.y;
    }

    dctx.stroke();
    pendingPoints = [];
    rafPending = requestAnimationFrame(renderQueue);
  }

  function startDraw(e) {
    if (dTool === "text") return;
    dDrawing = true;
    const p = getDPos(e);
    dLastX = p.x; dLastY = p.y;
    
    dctx.beginPath();
    const r = (dStroke * p.pressure) / 2;
    dctx.arc(p.x, p.y, r > 0.5 ? r : 0.5, 0, Math.PI * 2);
    
    if (dTool === "eraser") {
      dctx.globalCompositeOperation = "destination-out";
      dctx.fillStyle = "rgba(0,0,0,1)";
    } else {
      dctx.globalCompositeOperation = "source-over";
      dctx.fillStyle = dColor;
    }
    dctx.fill();
    
    if (!rafPending) {
      rafPending = requestAnimationFrame(renderQueue);
    }
  }

  function doDraw(e) {
    if (!dDrawing || dTool === "text") return;
    if (e.cancelable) e.preventDefault();

    let points = [];
    if (e.getCoalescedEvents) {
      points = e.getCoalescedEvents().map(ce => getDPos(ce));
    } else {
      points = [getDPos(e)];
    }

    pendingPoints.push(...points);

    if (!rafPending) {
      rafPending = requestAnimationFrame(renderQueue);
    }
  }

  function stopDraw() { 
    dDrawing = false; 
    if (rafPending) {
      cancelAnimationFrame(rafPending);
      rafPending = false;
    }
    // Final flush
    renderQueue();
    dctx.globalCompositeOperation = "source-over"; 
  }

  drawCanvas.addEventListener("pointerdown", startDraw);
  drawCanvas.addEventListener("pointermove", doDraw, { passive: false });
  drawCanvas.addEventListener("pointerup", stopDraw);
  drawCanvas.addEventListener("pointerout", stopDraw);
  drawCanvas.addEventListener("pointercancel", stopDraw);

  // Text tool on drawing overlay
  drawCanvas.addEventListener("click", e => {
    if (dTool !== "text") return;
    const { x, y } = getDPos(e);
    dtbText.style.display = "block";
    dtbText.style.left = `${x}px`;
    dtbText.style.top = `${y + 56}px`;
    dtbText.style.color = dColor;
    dtbText.style.fontSize = `${Math.max(16, dStroke * 6)}px`;
    dtbText.value = "";
    dtbText.dataset.x = x;
    dtbText.dataset.y = y;
    dtbText.focus();
  });

  function commitDText() {
    if (dtbText.style.display === "none") return;
    const text = dtbText.value.trim();
    if (text) {
      const x = parseFloat(dtbText.dataset.x);
      const y = parseFloat(dtbText.dataset.y);
      const fs = Math.max(16, dStroke * 6);
      dctx.font = `${fs}px sans-serif`;
      dctx.fillStyle = dColor;
      dctx.globalCompositeOperation = "source-over";
      dctx.textBaseline = "top";
      dctx.fillText(text, x, y);
    }
    dtbText.style.display = "none";
    dtbText.value = "";
  }

  dtbText.addEventListener("blur", commitDText);
  dtbText.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitDText(); }
  });

  window.addEventListener("resize", () => { if (overlayOpen) resizeDrawCanvas(); });

  /* ============================================================
     TIMELINE HORIZONTAL CAROUSEL
     ============================================================ */
  const track    = document.getElementById("timeline-track");
  const wrapper  = track ? track.parentElement : null;
  const section3 = document.querySelector(".section-3");

  if (!track || !wrapper) return;

  const items = track.querySelectorAll(".timeline-item");
  const bgs = Array.from(items).map(it => it.dataset.bg || "");

  let currentIndex = 0;
  let itemWidth = 0;
  
  // Drag / swipe state
  let dragStart = null, dragStartTranslate = 0, isDragging = false, wasDragged = false;

  function getItemWidth() {
    return track.querySelector(".timeline-item").offsetWidth;
  }

  function getTranslateX() {
    const style = window.getComputedStyle(track);
    const matrix = new DOMMatrix(style.transform);
    return matrix.m41;
  }

  function setActive(index) {
    items.forEach((it, i) => {
      it.classList.toggle("active", i === index);
    });

    // Change background of section (like the produtos effect)
    if (section3 && bgs[index]) {
      const bgEl = section3.querySelector(".section-bg");
      if (bgEl) {
        bgEl.style.transition = "opacity 0.6s ease";
        bgEl.style.backgroundImage = `url(${bgs[index]})`;
      }
    }

    currentIndex = index;
  }

  function goTo(index) {
    const visible = window.innerWidth <= 768 ? 2 : 4;
    const maxScroll = Math.max(0, items.length - visible);
    
    // Active index: the actual item clicked/targeted
    const activeIndex = Math.max(0, Math.min(index, items.length - 1));
    
    // Scroll position: clamp so we never scroll past the last page
    const scrollPos = Math.max(0, Math.min(activeIndex, maxScroll));
    
    itemWidth = getItemWidth();
    track.style.transform = `translateX(-${scrollPos * itemWidth}px)`;
    setActive(activeIndex);
  }

  // Click on any part of the item to select it
  items.forEach((item, i) => {
    item.addEventListener("click", () => {
      if (wasDragged) return; // ignore click that was a drag
      goTo(i);
    });
  });

  // Initial state
  setActive(0);

  function onDragStart(e) {
    const src = e.touches ? e.touches[0] : e;
    dragStart = src.clientX;
    dragStartTranslate = getTranslateX();
    isDragging = true;
    wasDragged = false;
    track.style.transition = "none";
  }

  function onDragMove(e) {
    if (!isDragging || dragStart === null) return;
    if (e.cancelable) e.preventDefault();
    const src = e.touches ? e.touches[0] : e;
    const delta = src.clientX - dragStart;
    if (Math.abs(delta) > 5) wasDragged = true;
    track.style.transform = `translateX(${dragStartTranslate + delta}px)`;
  }

  function onDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = "";

    const src = e.changedTouches ? e.changedTouches[0] : e;
    const delta = src.clientX - dragStart;

    itemWidth = getItemWidth();

    if (Math.abs(delta) > itemWidth * 0.2) {
      const newIndex = delta < 0
        ? Math.min(currentIndex + 1, items.length - 1)
        : Math.max(currentIndex - 1, 0);
      goTo(newIndex);
    } else {
      goTo(currentIndex);
    }

    dragStart = null;
    // Reset wasDragged after a short delay so the click event (which fires after mouseup) can check it
    setTimeout(() => { wasDragged = false; }, 50);
  }

  wrapper.addEventListener("mousedown", onDragStart);
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("mouseup", onDragEnd);

  wrapper.addEventListener("touchstart", onDragStart, { passive: true });
  wrapper.addEventListener("touchmove", onDragMove, { passive: false });
  wrapper.addEventListener("touchend", onDragEnd);

  window.addEventListener("resize", () => { goTo(currentIndex); });

});
