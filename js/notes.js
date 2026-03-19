document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("notes-modal");
  const btnTrigger = document.querySelector(".btn-notes-trigger");
  const btnClose = document.querySelector(".mac-close");
  const canvasContainer = document.querySelector(".canvas-container");
  const textInputOverlay = document.getElementById("text-input-overlay");
  
  // Toolbar buttons
  const tools = document.querySelectorAll(".tool-btn");
  const colors = document.querySelectorAll(".color-swatch");
  const selectStroke = document.getElementById("stroke-width");
  const btnClear = document.getElementById("btn-clear");

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.id = "notes-canvas";
  canvasContainer.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // State
  let isDrawing = false;
  let currentTool = "pen"; // "pen", "eraser", "text"
  let strokeColor = "#000000";
  let strokeWidth = 2;
  
  let lastX = 0;
  let lastY = 0;

  // Window Resize to scale canvas and keep drawing history would be nice,
  // but for simplicity, we size on open.
  function resizeCanvas() {
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
    // Set background to white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Handle open modal
  if (btnTrigger) {
    btnTrigger.addEventListener("click", () => {
      modal.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent scrolling behind modal
      resizeCanvas(); // Ensure it fits the screen
    });
  }

  // Handle close modal
  if (btnClose) {
    btnClose.addEventListener("click", () => {
      modal.classList.remove("active");
      document.body.style.overflow = "auto";
    });
  }

  // Clear Canvas
  btnClear.addEventListener("click", () => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  // Tools Selection
  tools.forEach(btn => {
    btn.addEventListener("click", () => {
      tools.forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      currentTool = btn.dataset.tool;
      textInputOverlay.style.display = "none";
    });
  });

  // Colors Selection
  colors.forEach(swatch => {
    swatch.addEventListener("click", () => {
      colors.forEach(c => c.classList.remove("active"));
      swatch.classList.add("active");
      strokeColor = swatch.dataset.color;
    });
  });

  // Stroke width
  selectStroke.addEventListener("change", (e) => {
    strokeWidth = parseInt(e.target.value);
  });

  // Drawing Events (Mouse & Touch via PointerEvents)
  canvas.addEventListener("pointerdown", startDrawing);
  canvas.addEventListener("pointermove", draw);
  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointerout", stopDrawing);

  function getClientPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function startDrawing(e) {
    if (currentTool === "text") return; // Text handles click differently
    
    // Create text area logic if trying to type but forgot to click text tool - well nah, they should click it.
    isDrawing = true;
    const { x, y } = getClientPos(e);
    lastX = x;
    lastY = y;
    
    // Draw dot for simple click without drag
    ctx.beginPath();
    ctx.arc(x, y, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = currentTool === "eraser" ? "#ffffff" : strokeColor;
    ctx.fill();
    ctx.closePath();
  }

  function draw(e) {
    if (!isDrawing || currentTool === "text") return;
    
    const { x, y } = getClientPos(e);
    
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = strokeWidth;
    
    if (currentTool === "eraser") {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = strokeWidth * 3; // Eraser thicker
    } else {
      ctx.strokeStyle = strokeColor;
    }

    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    lastX = x;
    lastY = y;
  }

  function stopDrawing() {
    isDrawing = false;
  }

  // Text Tool functionality
  canvas.addEventListener("click", (e) => {
    if (currentTool !== "text") return;
    
    const { x, y } = getClientPos(e);
    
    // Position the input exactly where clicked
    textInputOverlay.style.display = "block";
    textInputOverlay.style.left = `${x}px`;
    textInputOverlay.style.top = `${y - 10}px`; // Adjust offset
    textInputOverlay.style.color = strokeColor;
    textInputOverlay.style.fontSize = `${Math.max(16, strokeWidth * 8)}px`; // Scale font slightly
    textInputOverlay.value = "";
    textInputOverlay.focus();
    
    // Save position for rendering later
    textInputOverlay.dataset.x = x;
    textInputOverlay.dataset.y = y;
  });

  // Commit text to canvas on blur or Enter
  function commitText() {
    if (textInputOverlay.style.display === "none") return;
    
    const text = textInputOverlay.value;
    if (text.trim() !== "") {
      const x = parseFloat(textInputOverlay.dataset.x);
      const y = parseFloat(textInputOverlay.dataset.y);
      const fontSize = Math.max(16, strokeWidth * 8);
      
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = strokeColor;
      ctx.textBaseline = "top";
      ctx.fillText(text, x, y - 10);
    }
    
    textInputOverlay.style.display = "none";
    textInputOverlay.value = "";
  }

  textInputOverlay.addEventListener("blur", commitText);
  textInputOverlay.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // allow multiline if shift held, else commit
      commitText();
    }
  });

});
