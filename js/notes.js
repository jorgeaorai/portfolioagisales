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
    canvas.style.touchAction = "none";
    canvasContainer.appendChild(canvas);
    const ctx = canvas.getContext("2d", { desynchronized: true });

    let isDrawing = false, currentTool = "pen", strokeColor = "#000000", strokeWidth = 5;
    let lastX = 0, lastY = 0;

    function resizeCanvas() {
      canvas.width = canvasContainer.clientWidth;
      canvas.height = canvasContainer.clientHeight;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (btnTrigger) {
      btnTrigger.addEventListener("click", async () => {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
        resizeCanvas();
        
        // Restore notes from DB
        const savedData = await DB.loadNotes();
        if (savedData) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0);
          img.src = savedData;
        }
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
      ctx.setLineDash([]);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      const isEraser = currentTool === "eraser";
      ctx.fillStyle = isEraser ? "#ffffff" : strokeColor;
      const r = (strokeWidth * p.pressure) / 2;
      ctx.arc(p.x, p.y, r > 0.5 ? r : 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Start path for move
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
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

        const isEraser = currentTool === "eraser";
        const pressure = p.pressure;
        ctx.lineWidth = isEraser ? strokeWidth * 3 * pressure : strokeWidth * pressure;
        ctx.strokeStyle = isEraser ? "#ffffff" : strokeColor;
        
        // CRITICAL: Ensure solid line and round tips for every segment
        ctx.setLineDash([]);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const xc = (lastP.x + p.x) / 2;
        const yc = (lastP.y + p.y) / 2;
        
        ctx.beginPath();
        // We start from the previous midpoint (saved as lastP.xc, lastP.yc)
        const startX = lastP.xc || lastP.x;
        const startY = lastP.yc || lastP.y;
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(lastP.x, lastP.y, xc, yc);
        ctx.stroke();
        
        // Save current midpoint to the point object for the next segment
        p.xc = xc;
        p.yc = yc;
        
        points.push(p);
      });
    });

    canvas.addEventListener("pointerup", () => { 
      isDrawing = false; 
      points = []; 
      // Save state to IndexedDB
      DB.saveNotes(canvas.toDataURL());
    });
    canvas.addEventListener("pointerout", () => { isDrawing = false; points = []; });
  }

  /* ============================================================
     FLOATING PENCIL - DRAWING OVERLAY (draws on top of everything)
     ============================================================ */
  const fabBtn     = document.getElementById("fab-pencil");
  const overlay    = document.getElementById("drawing-overlay");
  const drawCanvas = document.getElementById("drawing-canvas");
  const dtbTools   = document.querySelectorAll(".dtb-tool-p");
  const dtbColors  = document.querySelectorAll(".dtb-color-p");
  const dtbStroke  = document.getElementById("dtb-stroke-p");
  const dtbClear   = document.getElementById("dtb-clear-p");
  const dtbClose   = document.getElementById("dtb-close-mac");
  const dtbText    = document.getElementById("dtb-text-input");

  if (!fabBtn || !overlay || !drawCanvas) return;

  const dctx = drawCanvas.getContext("2d");
  let dDrawing = false, dTool = "pen", dColor = "#ffffff", dStroke = 5;
  let dLastX = 0, dLastY = 0, dLastXC = 0, dLastYC = 0;
  let overlayOpen = false;

  function resizeDrawCanvas() {
    // Save existing drawing
    const imgData = dctx.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
    drawCanvas.width = window.innerWidth;
    drawCanvas.height = window.innerHeight;
    dctx.putImageData(imgData, 0, 0);
  }

  function openOverlay() {
    overlay.classList.add("active");
    fabBtn.classList.add("active");
    drawCanvas.width = window.innerWidth;
    drawCanvas.height = window.innerHeight;
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
    dctx.setLineDash([]);
    
    if (dTool === "eraser") {
      dctx.globalCompositeOperation = "destination-out";
      dctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      dctx.globalCompositeOperation = "source-over";
      dctx.strokeStyle = dColor;
    }

    for (let i = 0; i < pendingPoints.length; i++) {
      const p = pendingPoints[i];
      const pPressure = p.pressure;
      dctx.lineWidth = dTool === "eraser" ? dStroke * 4 * pPressure : dStroke * pPressure;

      const xc = (dLastX + p.x) / 2;
      const yc = (dLastY + p.y) / 2;
      
      dctx.beginPath();
      // Use the last saved midpoint if available, otherwise use last position
      const startX = dLastXC || dLastX;
      const startY = dLastYC || dLastY;
      
      dctx.moveTo(startX, startY);
      dctx.quadraticCurveTo(dLastX, dLastY, xc, yc);
      dctx.stroke();

      dLastX = p.x;
      dLastY = p.y;
      dLastXC = xc;
      dLastYC = yc;
    }

    pendingPoints = [];
    rafPending = requestAnimationFrame(renderQueue);
  }

  function startDraw(e) {
    if (dTool === "text") return;
    dDrawing = true;
    const p = getDPos(e);
    dLastX = p.x; dLastY = p.y;
    dLastXC = p.x; dLastYC = p.y;
    
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
    dtbText.style.top = `${y}px`;
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
  let dragStartX = null, dragStartY = null, dragStartTranslate = 0, isDragging = false, wasDragged = false;
  let isScrolling = null; // keeps track of user intent: true = vertical scroll, false = horizontal drag

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
    dragStartX = src.clientX;
    dragStartY = src.clientY;
    dragStartTranslate = getTranslateX();
    isDragging = true;
    wasDragged = false;
    isScrolling = null; // reset 
    track.style.transition = "none";
  }

  function onDragMove(e) {
    if (!isDragging || dragStartX === null) return;
    
    const src = e.touches ? e.touches[0] : e;
    const deltaX = src.clientX - dragStartX;
    const deltaY = src.clientY - dragStartY;
    
    // Determine scroll intent after a small threshold (10px)
    if (isScrolling === null) {
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        isScrolling = Math.abs(deltaY) > Math.abs(deltaX);
      } else {
        return; // wait for more movement
      }
    }
    
    // If user is trying to scroll vertically, let the browser handle it.
    if (isScrolling) {
      isDragging = false; 
      return;
    }
    
    // If it's a horizontal drag, prevent page scroll and update carousel position
    if (e.cancelable) e.preventDefault();
    if (Math.abs(deltaX) > 5) wasDragged = true;
    track.style.transform = `translateX(${dragStartTranslate + deltaX}px)`;
  }

  function onDragEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

    const src = e.changedTouches ? e.changedTouches[0] : e;
    const deltaX = src.clientX - dragStartX;

    itemWidth = getItemWidth();

    if (Math.abs(deltaX) > itemWidth * 0.2) {
      const newIndex = deltaX < 0
        ? Math.min(currentIndex + 1, items.length - 1)
        : Math.max(currentIndex - 1, 0);
      goTo(newIndex);
    } else {
      goTo(currentIndex);
    }

    dragStartX = null;
    dragStartY = null;
    isScrolling = null;
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

  /* ============================================================
     BIG NUMBERS HORIZONTAL CAROUSEL
     ============================================================ */
  const bnTrack    = document.getElementById("bn-track");
  const bnWrapper  = bnTrack ? bnTrack.parentElement : null;

  if (bnTrack && bnWrapper) {
    const bnItems = bnTrack.querySelectorAll(".big-number-card");
    let bnCurrentIndex = 0;
    let bnDragStartX = null, bnDragStartY = null, bnDragStartTranslate = 0, bnIsDragging = false, bnWasDragged = false;
    let bnIsScrolling = null;

    function getBNTranslateX() {
      const style = window.getComputedStyle(bnTrack);
      const matrix = new DOMMatrix(style.transform);
      return matrix.m41;
    }

    function goToBN(index) {
      const cardWidth = bnItems[0].offsetWidth + 15; // include gap
      const visible = window.innerWidth > 992 ? 3 : (window.innerWidth > 576 ? 2 : 1);
      const maxScroll = Math.max(0, bnItems.length - visible);
      const targetIndex = Math.max(0, Math.min(index, maxScroll));
      
      bnTrack.style.transform = `translateX(-${targetIndex * cardWidth}px)`;
      bnCurrentIndex = targetIndex;
    }

    function onBNDragStart(e) {
      const src = e.touches ? e.touches[0] : e;
      bnDragStartX = src.clientX;
      bnDragStartY = src.clientY;
      bnDragStartTranslate = getBNTranslateX();
      bnIsDragging = true;
      bnWasDragged = false;
      bnIsScrolling = null;
      bnTrack.style.transition = "none";
    }

    function onBNDragMove(e) {
      if (!bnIsDragging || bnDragStartX === null) return;
      const src = e.touches ? e.touches[0] : e;
      const deltaX = src.clientX - bnDragStartX;
      const deltaY = src.clientY - bnDragStartY;
      
      if (bnIsScrolling === null) {
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          bnIsScrolling = Math.abs(deltaY) > Math.abs(deltaX);
        } else {
          return;
        }
      }
      
      if (bnIsScrolling) {
        bnIsDragging = false; 
        return;
      }
      
      if (e.cancelable) e.preventDefault();
      if (Math.abs(deltaX) > 5) bnWasDragged = true;
      bnTrack.style.transform = `translateX(${bnDragStartTranslate + deltaX}px)`;
    }

    function onBNDragEnd(e) {
      if (!bnIsDragging) return;
      bnIsDragging = false;
      bnTrack.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      
      const src = e.changedTouches ? e.changedTouches[0] : e;
      const deltaX = src.clientX - bnDragStartX;
      const cardWidth = bnItems[0].offsetWidth + 15;
      
      if (Math.abs(deltaX) > cardWidth * 0.2) {
        const newIndex = deltaX < 0 ? bnCurrentIndex + 1 : bnCurrentIndex - 1;
        goToBN(newIndex);
      } else {
        goToBN(bnCurrentIndex);
      }
      setTimeout(() => { bnWasDragged = false; }, 50);
    }

    bnWrapper.addEventListener("mousedown", onBNDragStart);
    window.addEventListener("mousemove", onBNDragMove);
    window.addEventListener("mouseup", onBNDragEnd);
    
    bnWrapper.addEventListener("touchstart", onBNDragStart, { passive: true });
    bnWrapper.addEventListener("touchmove", onBNDragMove, { passive: false });
    bnWrapper.addEventListener("touchend", onBNDragEnd);
    
    window.addEventListener("resize", () => { goToBN(bnCurrentIndex); });
  }

});
