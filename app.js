class CyberZen {
    constructor() {
        this.editor = document.getElementById('text-editor');
        this.saveBtn = document.getElementById('save-btn');
        this.fadeBtn = document.getElementById('fade-btn');
        this.volumeSlider = document.getElementById('volume-slider');
        this.pomodoroTimer = document.getElementById('pomodoro-timer');
        this.pomodoroDisplay = this.pomodoroTimer.querySelector('.pomodoro-display');
        this.pomodoroStart = document.getElementById('pomodoro-start');
        
        this.rainAudio = document.getElementById('rain-audio');
        this.snowAudio = document.getElementById('snow-audio');
        
        this.currentMode = 'snowy';
        this.currentFont = 'system-ui';
        this.currentSize = 'medium';
        this.pomodoroInterval = null;
        this.pomodoroTimeLeft = 25 * 60;
        
        this.canvas = document.getElementById('background-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationId = null;
        
        this.fadeTimeouts = [];
        this.isFading = false;
        
        this.fadeContainer = document.getElementById('fade-animation-container');
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.initCanvas();
        this.initAudio();
        this.applySettings();
        this.startBackgroundAnimation();
    }
    
    loadFromStorage() {
        const savedText = localStorage.getItem('cyberZenText');
        if (savedText) {
            this.editor.value = savedText;
        }
        
        const savedMode = localStorage.getItem('cyberZenMode');
        if (savedMode) {
            this.currentMode = savedMode;
            document.querySelector(`[data-mode="${savedMode}"]`).classList.add('active');
            document.querySelector(`[data-mode="${this.currentMode === 'rainy' ? 'snowy' : 'rainy'}"]`).classList.remove('active');
        }
        
        const savedFont = localStorage.getItem('cyberZenFont');
        if (savedFont) {
            this.currentFont = savedFont;
            document.querySelector(`[data-font="${savedFont}"]`).classList.add('active');
            document.querySelector(`[data-font="${this.currentFont}"]`).classList.add('active');
        }
        
        const savedSize = localStorage.getItem('cyberZenSize');
        if (savedSize) {
            this.currentSize = savedSize;
            document.querySelector(`[data-size="${savedSize}"]`).classList.add('active');
            document.querySelector(`[data-size="${this.currentSize}"]`).classList.add('active');
        }
        
        const savedVolume = localStorage.getItem('cyberZenVolume');
        if (savedVolume) {
            this.volumeSlider.value = savedVolume;
        }
    }
    
    bindEvents() {
        // 字体选择
        document.querySelectorAll('.font-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFont = btn.dataset.font;
                this.applyFont();
                localStorage.setItem('cyberZenFont', this.currentFont);
            });
        });
        
        // 字号选择
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSize = btn.dataset.size;
                this.applySize();
                localStorage.setItem('cyberZenSize', this.currentSize);
            });
        });
        
        // 模式选择
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentMode = btn.dataset.mode;
                this.switchMode();
                localStorage.setItem('cyberZenMode', this.currentMode);
            });
        });
        
        // 文本输入自动保存
        this.editor.addEventListener('input', () => {
            localStorage.setItem('cyberZenText', this.editor.value);
        });
        
        // 保存导出
        this.saveBtn.addEventListener('click', () => {
            this.exportText();
        });
        
        // 飘散清空
        this.fadeBtn.addEventListener('click', () => {
            this.fadeOutText();
        });
        
        // 音量调节
        this.volumeSlider.addEventListener('input', () => {
            this.updateVolume();
            localStorage.setItem('cyberZenVolume', this.volumeSlider.value);
        });
        
        // 番茄钟开始
        this.pomodoroStart.addEventListener('click', () => {
            this.startPomodoro();
        });
        
        // 窗口大小调整
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }
    
    initCanvas() {
        this.resizeCanvas();
        this.initParticles();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    initParticles() {
        this.particles = [];
        const count = this.currentMode === 'rainy' ? 150 : 100;
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: this.currentMode === 'rainy' ? (Math.random() * 1 + 0.5) : (Math.random() * 3 + 1),
                speed: this.currentMode === 'rainy' ? (Math.random() * 10 + 5) : (Math.random() * 2 + 1),
                opacity: Math.random() * 0.5 + 0.3,
                angle: this.currentMode === 'rainy' ? Math.PI / 4 : 0
            });
        }
    }
    
    startBackgroundAnimation() {
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 设置背景颜色渐变
            if (this.currentMode === 'rainy') {
                const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
                gradient.addColorStop(0, '#0f2027');
                gradient.addColorStop(1, '#203a43');
                this.ctx.fillStyle = gradient;
            } else {
                const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
                gradient.addColorStop(0, '#2b3a42');
                gradient.addColorStop(1, '#556270');
                this.ctx.fillStyle = gradient;
            }
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 绘制粒子
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.particles.forEach(particle => {
                this.ctx.globalAlpha = particle.opacity;
                
                if (this.currentMode === 'rainy') {
                    this.ctx.fillRect(particle.x, particle.y, 1, particle.size * 3);
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // 更新位置
                particle.y += particle.speed;
                if (this.currentMode === 'rainy') {
                    particle.x += particle.speed * 0.5;
                }
                
                // 超出屏幕重置
                if (particle.y > this.canvas.height || particle.x > this.canvas.width) {
                    particle.x = Math.random() * this.canvas.width;
                    particle.y = -10;
                }
            });
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.animationId = requestAnimationFrame(animate);
    }
    
    initAudio() {
        this.updateVolume();
        this.switchMode();
        
        // 尝试自动播放
        const playAudio = () => {
            if (this.currentMode === 'rainy') {
                this.rainAudio.play().catch(() => {});
            } else {
                this.snowAudio.play().catch(() => {});
            }
        };
        
        playAudio();
        
        // 用户交互后确保可以播放
        document.addEventListener('click', () => {
            playAudio();
        }, { once: true });
    }
    
    updateVolume() {
        const volume = this.volumeSlider.value / 100;
        this.rainAudio.volume = volume;
        this.snowAudio.volume = volume;
    }
    
    switchMode() {
        this.rainAudio.pause();
        this.snowAudio.pause();
        
        this.initParticles();
        this.startBackgroundAnimation();
        
        if (this.currentMode === 'rainy') {
            this.rainAudio.play().catch(() => {});
        } else {
            this.snowAudio.play().catch(() => {});
        }
    }
    
    applySettings() {
        this.applyFont();
        this.applySize();
    }
    
    applyFont() {
        this.editor.style.fontFamily = this.currentFont;
    }
    
    applySize() {
        this.editor.classList.remove('small', 'medium', 'large');
        this.editor.classList.add(this.currentSize);
    }
    
    exportText() {
        const text = this.editor.value;
        if (!text) return;
        
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const filename = `cyber-zen-${dateStr}.txt`;
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    fadeOutText() {
        const text = this.editor.value;
        if (!text) {
            this.clearText();
            return;
        }
        
        if (this.isFading) {
            return;
        }
        
        // 清除之前未完成的定时器
        this.fadeTimeouts.forEach(timeout => clearTimeout(timeout));
        this.fadeTimeouts = [];
        this.isFading = true;
        this.fadeBtn.disabled = true;
        
        // 同步字体和字号
        this.fadeContainer.style.fontFamily = this.currentFont;
        this.fadeContainer.classList.remove('small', 'medium', 'large');
        this.fadeContainer.classList.add(this.currentSize);
        
        // 分割成行
        const lines = text.split('\n');
        this.fadeContainer.innerHTML = '';
        
        // 创建行元素
        lines.forEach((line) => {
            const lineEl = document.createElement('span');
            lineEl.className = 'fade-line';
            lineEl.textContent = line || '\u200B'; // 保留空行
            this.fadeContainer.appendChild(lineEl);
        });
        
        // 显示动画容器，隐藏编辑器
        this.fadeContainer.classList.add('active');
        
        // 从下往上依次添加动画
        const lineElements = this.fadeContainer.querySelectorAll('.fade-line');
        let delay = 0;
        
        for (let i = lineElements.length - 1; i >= 0; i--) {
            this.fadeTimeouts.push(setTimeout(() => {
                lineElements[i].classList.add('fade-out');
            }, delay));
            delay += 80;
        }
        
        // 所有动画完成后清空
        this.fadeTimeouts.push(setTimeout(() => {
            this.clearText();
            this.fadeContainer.classList.remove('active');
            this.fadeContainer.innerHTML = '';
            this.isFading = false;
            this.fadeBtn.disabled = false;
        }, delay + 1600));
    }
    
    clearText() {
        this.editor.value = '';
        localStorage.removeItem('cyberZenText');
    }
    
    startPomodoro() {
        // 清除之前的计时器
        if (this.pomodoroInterval) {
            clearInterval(this.pomodoroInterval);
        }
        
        this.pomodoroTimer.classList.remove('blinking');
        this.pomodoroTimeLeft = 25 * 60;
        this.updatePomodoroDisplay();
        
        this.pomodoroInterval = setInterval(() => {
            this.pomodoroTimeLeft--;
            this.updatePomodoroDisplay();
            
            if (this.pomodoroTimeLeft <= 0) {
                clearInterval(this.pomodoroInterval);
                this.pomodoroTimer.classList.add('blinking');
                this.pomodoroInterval = null;
            }
        }, 1000);
    }
    
    updatePomodoroDisplay() {
        const minutes = Math.floor(this.pomodoroTimeLeft / 60);
        const seconds = this.pomodoroTimeLeft % 60;
        this.pomodoroDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new CyberZen();
});