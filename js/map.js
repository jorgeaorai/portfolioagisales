// Web-optimized Brazil SVG paths with state IDs
const BRAZIL_SVG_TEMPLATE = `
<svg viewBox="0 0 623.62 549.92" xmlns="http://www.w3.org/2000/svg">
  <g class="map-group">
    <path id="AC" class="map-state" d="M110.44,218.73h-.09l.09-.09v.09Z"/> <!-- Simplified for brevity, will use full paths -->
    <!-- I will use a full, accurate path set for all states -->
  </g>
</svg>
`;

// Note: In a real scenario, I'd use a complete set of paths. 
// For this implementation, I'll use a more robust way to load/inject a good SVG.

class InteractiveMap {
  constructor() {
    this.container = document.getElementById('map-3d-container');
    this.popup = document.getElementById('office-popup');
    this.overlay = document.getElementById('popup-overlay');
    this.init();
  }

  async init() {
    if (!this.container) return;
    
    // Inject SVG
    let pathsHtml = '';
    for (const [id, d] of Object.entries(BRAZIL_SVG_PATHS)) {
      const isOffice = BRAZIL_OFFICES[id] ? 'active-office' : '';
      pathsHtml += `<path id="${id}" class="map-state ${isOffice}" d="${d}" />`;
    }

    this.container.innerHTML = `
      <svg viewBox="0 0 650 650" xmlns="http://www.w3.org/2000/svg">
        <g class="map-group">
          ${pathsHtml}
        </g>
      </svg>
    `;
    
    this.renderPins();
    this.setupEventListeners();
  }

  renderPins() {
    BRAZIL_STATES.forEach(state => {
      const pin = document.createElement('div');
      pin.className = `map-pin ${state.office ? 'office-pin' : ''}`;
      pin.style.left = `${state.x}%`;
      pin.style.top = `${state.y}%`;
      pin.dataset.id = state.id;
      
      if (state.office) {
        pin.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showOffice(state.id);
        });
      }
      
      this.container.appendChild(pin);
    });
  }

  setupEventListeners() {
    // Listen for state clicks
    document.querySelectorAll('.map-state').forEach(path => {
      path.addEventListener('click', () => {
        const stateId = path.id;
        if (BRAZIL_OFFICES[stateId]) {
          this.showOffice(stateId);
        }
      });
    });

    // Close popup
    document.querySelector('.popup-close')?.addEventListener('click', () => this.hideOffice());
    this.overlay?.addEventListener('click', () => this.hideOffice());
  }

  showOffice(id) {
    const data = BRAZIL_OFFICES[id];
    if (!data) return;

    const header = this.popup.querySelector('.popup-header');
    const title = this.popup.querySelector('.popup-title');
    const desc = this.popup.querySelector('.popup-desc');

    header.style.backgroundImage = `url(${data.photo})`;
    title.textContent = data.name;
    desc.textContent = data.description;

    this.overlay.style.display = 'block';
    this.popup.style.display = 'block';
    
    setTimeout(() => {
      this.overlay.classList.add('show');
      this.popup.classList.add('show');
    }, 10);
  }

  hideOffice() {
    this.overlay.classList.remove('show');
    this.popup.classList.remove('show');
    
    setTimeout(() => {
      this.overlay.style.display = 'none';
      this.popup.style.display = 'none';
    }, 400);
  }
}

// Map initialization will happen after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.interactiveMap = new InteractiveMap();
});
