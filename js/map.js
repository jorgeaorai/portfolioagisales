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
    
    try {
      // Fetch the original mapa project index.html
      const response = await fetch('mapa/dist/index.html');
      const htmlText = await response.text();
      
      // Parse the HTML to extract the SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const svgElement = doc.querySelector('svg#map');
      
      if (svgElement) {
        // Clean up display and styling for injection
        svgElement.style.display = 'block';
        svgElement.style.width = '100%';
        svgElement.style.height = 'auto';
        
        // Remove unwanted circles and full-name labels from the original SVG
        svgElement.querySelectorAll('.icon_state, .label_state').forEach(el => el.remove());
        
        // Inject SVG
        this.container.innerHTML = '';
        this.container.appendChild(svgElement);
        
        // Mark active offices in the DOM
        this.markActiveOffices();
        
        // Initialize events
        this.setupEventListeners();
        
        console.log('Interactive map loaded successfully without markers');
      } else {
        throw new Error('SVG not found in mapa project');
      }
    } catch (error) {
      console.error('Error loading interactive map:', error);
      this.container.innerHTML = `<div class="map-error">Erro ao carregar o mapa interativo.</div>`;
    }
  }

  markActiveOffices() {
    document.querySelectorAll('.state').forEach(stateEl => {
      const stateId = stateEl.dataset.state?.toUpperCase();
      if (stateId && BRAZIL_OFFICES[stateId]) {
        stateEl.classList.add('active-office');
      }
    });
  }

  setupEventListeners() {
    // Listen for state clicks on the dynamically injected SVG
    this.container.querySelectorAll('.state').forEach(stateEl => {
      stateEl.addEventListener('click', (e) => {
        e.preventDefault();
        const stateId = stateEl.dataset.state?.toUpperCase();
        if (stateId && BRAZIL_OFFICES[stateId]) {
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
