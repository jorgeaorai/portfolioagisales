/**
 * Solutions Section Controller
 * Handles the circular layout, AI visualizer, and interactions.
 */

class SolutionsController {
    constructor() {
        this.container = document.querySelector('.solutions-container');
        this.items = document.querySelectorAll('.solution-item');
        this.centralText = document.querySelector('.solution-central-text');
        this.canvas = document.getElementById('ai-visualizer');
        this.bgOverlays = document.querySelectorAll('.solutions-bg-overlay');
        
        if (!this.container) return;

        this.ctx = this.canvas.getContext('2d');
        this.dots = [];
        this.dotCount = 200;
        this.radius = 250; // Radius for the circular layout
        this.visualizerActive = false;
        
        this.init();
    }

    init() {
        this.setupCircularLayout();
        this.setupEventListeners();
        this.initVisualizer();
        this.animateVisualizer();
        
        // Select first item by default
        if (this.items.length > 0) {
            this.selectItem(this.items[0]);
        }
    }

    setupCircularLayout() {
        const count = this.items.length;
        this.items.forEach((item, index) => {
            const angle = (index * (360 / count) - 90) * (Math.PI / 180);
            const x = 300 + this.radius * Math.cos(angle);
            const y = 300 + this.radius * Math.sin(angle);
            
            item.style.left = `${x}px`;
            item.style.top = `${y}px`;
        });
    }

    setupEventListeners() {
        this.items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.selectItem(item);
            });
            
            item.addEventListener('click', () => {
                this.selectItem(item);
            });
        });
    }

    selectItem(item) {
        const name = item.dataset.name;
        const index = item.dataset.index;
        
        // Update Active States
        this.items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Update Central Text with a "voice-like" fade/scale
        this.centralText.classList.remove('active');
        setTimeout(() => {
            this.centralText.textContent = name;
            this.centralText.classList.add('active');
        }, 300);

        // Update Background
        this.bgOverlays.forEach(bg => bg.classList.remove('active'));
        if (this.bgOverlays[index]) {
            this.bgOverlays[index].classList.add('active');
        }

        // Pulse the visualizer
        this.pulseVisualizer();
    }

    initVisualizer() {
        this.dots = [];
        for (let i = 0; i < this.dotCount; i++) {
            this.dots.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                baseX: Math.random() * this.canvas.width,
                baseY: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                color: 'rgba(17, 175, 220, ' + (Math.random() * 0.5 + 0.2) + ')',
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.02 + 0.01
            });
        }
    }

    animateVisualizer() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const time = Date.now() * 0.001;
        
        this.dots.forEach((dot, i) => {
            // Organic movement logic: Sine waves + Noise-like behavior
            dot.angle += dot.speed;
            
            // Create a complex wave pattern
            const wave = Math.sin(time + i * 0.1) * 15 + Math.cos(time * 0.5 + i * 0.05) * 10;
            const dist = 120 + wave + (this.visualizerActive ? 30 : 0);
            
            const targetX = centerX + Math.cos(dot.angle) * dist;
            const targetY = centerY + Math.sin(dot.angle) * dist;
            
            // Smooth interpolation
            dot.x += (targetX - dot.x) * 0.1;
            dot.y += (targetY - dot.y) * 0.1;
            
            // Draw dot
            this.ctx.beginPath();
            this.ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
            this.ctx.fillStyle = dot.color;
            this.ctx.fill();
            
            // Occasional connections (web effect)
            if (i % 20 === 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(dot.x, dot.y);
                this.ctx.lineTo(centerX, centerY);
                this.ctx.strokeStyle = `rgba(17, 175, 220, 0.05)`;
                this.ctx.stroke();
            }
        });
        
        requestAnimationFrame(() => this.animateVisualizer());
    }

    pulseVisualizer() {
        this.visualizerActive = true;
        setTimeout(() => {
            this.visualizerActive = false;
        }, 600);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new SolutionsController();
});
