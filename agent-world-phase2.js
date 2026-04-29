/**
 * Agent World — PixiJS 進階版本 (Phase 2)
 * Kairos Studio © 2026
 * 
 * 新增功能：
 * - WebSocket 連接 Hermes webhook
 * - 場景切換系統
 * - 音效系統
 * - 粒子效果進階版
 */

// 配置
const CONFIG = {
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x1A1A2E,
    agentCount: 5,
    agentSize: 64,
    websocket: {
        enabled: true,
        url: 'wss://your-hermes-webhook-url',  // 替換為實際 webhook URL
        reconnectInterval: 5000,
        maxReconnectAttempts: 10
    },
    colors: {
        guardian: 0x4A90E2,
        silver: 0xC0C0C0,
        dark: 0x1A1A2E,
        purple: 0x9B59B6,
        red: 0xE74C3C,
        green: 0x2ECC71
    }
};

// 場景配置
const SCENES = {
    'intelligence': {  // 情報分析署
        background: 0x1A1A2E,
        gridColor: 0x4A90E2,
        name: '情報分析署'
    },
    'command': {  // 作戰指揮室
        background: 0x2D1B1B,
        gridColor: 0xE74C3C,
        name: '作戰指揮室'
    },
    'datacenter': {  // 資料處理中心
        background: 0x1B2D23,
        gridColor: 0x2ECC71,
        name: '資料處理中心'
    },
    'relay': {  // 通訊中繼站
        background: 0x2D1B3D,
        gridColor: 0x9B59B6,
        name: '通訊中繼站'
    }
};

// 音效配置
const AUDIO_CONFIG = {
    enabled: true,
    volume: 0.3,
    sounds: {
        agentAppear: null,  // Agent 出現
        agentAction: null,  // Agent 動作
        sceneChange: null,  // 場景切換
        notification: null  // 通知音
    }
};

let app; // PixiJS app instance

// Async PixiJS v8 初始化（必須在 async 函式內才能用 await）
async function initPixi() {
 app = new PIXI.Application();
 await app.init({
  width: CONFIG.width,
  height: CONFIG.height,
  backgroundColor: CONFIG.backgroundColor,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
  autoDensity: true,
  preserveDrawingBuffer: true, // 必須！否則 canvas 全黑
 });
 document.getElementById('canvas-container').appendChild(app.canvas);
}

const state = {
    agents: [],
    particles: [],
    currentScene: 'intelligence',
    websocket: null,
    reconnectAttempts: 0,
    lastFrameTime: performance.now(),
    frameCount: 0,
    fps: 0
};

// Agent 類別（進階版）
class Agent extends PIXI.Container {
    constructor(name, x, y) {
        super();
        this.name = name;
        this.x = x;
        this.y = y;
        this.status = 'idle';
        this.createSprite();
        this.createGlowEffect();
        this.createThoughtBubble();
        this.createParticleEmitter();
    }

    createSprite() {
        const size = CONFIG.agentSize;
        
        // 身體（藍色）
        const body = new PIXI.Graphics();
        body.beginFill(CONFIG.colors.guardian);
        body.drawRoundedRect(-size/2, -size/2, size, size, 8);
        body.endFill();
        
        // 描邊
        body.lineStyle(2, 0x2C5282);
        body.drawRoundedRect(-size/2, -size/2, size, size, 8);
        
        // 胸口光核（銀色）
        const core = new PIXI.Graphics();
        core.beginFill(CONFIG.colors.silver);
        core.drawCircle(0, 0, size/6);
        core.endFill();
        
        // 光暈
        const glow = new PIXI.Graphics();
        glow.beginFill(CONFIG.colors.silver, 0.3);
        glow.drawCircle(0, 0, size/3);
        glow.endFill();
        
        this.body = body;
        this.core = core;
        this.glow = glow;
        
        this.addChild(glow);
        this.addChild(body);
        this.addChild(core);
        
        this.pivot.set(0, 0);
    }

    createGlowEffect() {
        this.glowEffect = new PIXI.Graphics();
        this.glowEffect.alpha = 0;
        this.addChildAt(this.glowEffect, 0);
    }

    createThoughtBubble() {
        this.thoughtBubble = new PIXI.Graphics();
        this.thoughtBubble.visible = false;
        this.thoughtBubble.x = CONFIG.agentSize/2;
        this.thoughtBubble.y = -CONFIG.agentSize;
        this.addChild(this.thoughtBubble);
    }

    createParticleEmitter() {
        this.particleEmitter = {
            active: false,
            particles: [],
            emit: () => this.emitParticles()
        };
    }

    emitParticles() {
        if (!this.particleEmitter.active) return;
        
        const particle = new PIXI.Graphics();
        particle.beginFill(CONFIG.colors.silver, 0.6);
        particle.drawCircle(0, 0, 3);
        particle.endFill();
        particle.x = this.x;
        particle.y = this.y - CONFIG.agentSize/2;
        particle.vy = -2 - Math.random() * 2;
        particle.vx = (Math.random() - 0.5) * 2;
        particle.life = 1.0;
        
        app.stage.addChild(particle);
        this.particleEmitter.particles.push(particle);
    }

    setStatus(newStatus) {
        const oldStatus = this.status;
        this.status = newStatus;
        
        // 播放音效
        if (AUDIO_CONFIG.enabled && newStatus !== 'idle') {
            playSound('agentAction');
        }
        
        switch(newStatus) {
            case 'thinking':
                this.showThoughtBubble('💭');
                this.startPulse();
                this.particleEmitter.active = true;
                break;
            case 'working':
                this.showThoughtBubble('⚡');
                this.startFastPulse();
                this.particleEmitter.active = true;
                break;
            case 'waiting':
                this.hideThoughtBubble();
                this.stopPulse();
                this.particleEmitter.active = false;
                break;
            default:
                this.hideThoughtBubble();
                this.stopPulse();
                this.particleEmitter.active = false;
        }
    }

    showThoughtBubble(emoji) {
        this.thoughtBubble.clear();
        this.thoughtBubble.visible = true;
        
        this.thoughtBubble.beginFill(0xFFFFFF, 0.9);
        this.thoughtBubble.drawCircle(0, 0, 20);
        this.thoughtBubble.endFill();
        
        this.thoughtBubble.beginFill(0xFFFFFF, 0.7);
        this.thoughtBubble.drawCircle(-10, 15, 6);
        this.thoughtBubble.drawCircle(-5, 22, 4);
        this.thoughtBubble.endFill();
    }

    hideThoughtBubble() {
        this.thoughtBubble.visible = false;
    }

    startPulse() {
        this.pulseSpeed = 0.02;
        this.pulseAmount = 0.3;
    }

    startFastPulse() {
        this.pulseSpeed = 0.05;
        this.pulseAmount = 0.5;
    }

    stopPulse() {
        this.pulseSpeed = 0;
        this.pulseAmount = 0;
    }

    update(delta) {
        const time = performance.now() / 1000;
        
        if (this.pulseSpeed > 0) {
            const scale = 1 + Math.sin(time * this.pulseSpeed * 100) * this.pulseAmount;
            this.glow.scale.set(scale);
            this.glow.alpha = 0.3 * scale;
        } else {
            const idleScale = 1 + Math.sin(time * 2) * 0.05;
            this.glow.scale.set(idleScale);
            this.glow.alpha = 0.1;
        }

        this.y += Math.sin(time * 1.5) * 0.2;
        
        // 更新粒子
        if (this.particleEmitter.active && Math.random() > 0.7) {
            this.emitParticles();
        }
    }
}

// 場景管理
class SceneManager {
    constructor() {
        this.background = new PIXI.Graphics();
        this.grid = new PIXI.Graphics();
        app.stage.addChildAt(this.background, 0);
        app.stage.addChildAt(this.grid, 1);
        this.setScene('intelligence');
    }

    setScene(sceneId) {
        const scene = SCENES[sceneId];
        if (!scene) return;
        
        state.currentScene = sceneId;
        
        // 更新背景
        this.background.clear();
        this.background.beginFill(scene.background);
        this.background.drawRect(0, 0, CONFIG.width, CONFIG.height);
        this.background.endFill();
        
        // 更新網格
        this.grid.clear();
        this.grid.lineStyle(1, scene.gridColor, 0.2);
        const gridSize = 50;
        
        for (let x = 0; x < CONFIG.width; x += gridSize) {
            this.grid.moveTo(x, 0);
            this.grid.lineTo(x, CONFIG.height);
        }
        
        for (let y = 0; y < CONFIG.height; y += gridSize) {
            this.grid.moveTo(0, y);
            this.grid.lineTo(CONFIG.width, y);
        }
        
        // 播放場景切換音效
        if (AUDIO_CONFIG.enabled) {
            playSound('sceneChange');
        }
        
        // 更新 UI
        document.getElementById('scene-name').textContent = scene.name;
    }
}

// WebSocket 管理
class WebSocketManager {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.connect();
    }

    connect() {
        if (!CONFIG.websocket.enabled) return;
        
        console.log('🔌 嘗試連接 WebSocket...');
        
        try {
            this.ws = new WebSocket(CONFIG.websocket.url);
            
            this.ws.onopen = () => {
                console.log('✅ WebSocket 連接成功');
                state.reconnectAttempts = 0;
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleEvent(data);
                } catch (e) {
                    console.error('❌ 解析 WebSocket 消息失敗:', e);
                }
            };
            
            this.ws.onclose = () => {
                console.log('⚠️  WebSocket 連接關閉');
                this.scheduleReconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket 錯誤:', error);
            };
            
            state.websocket = this.ws;
        } catch (e) {
            console.error('❌ WebSocket 連接失敗:', e);
            this.scheduleReconnect();
        }
    }

    handleEvent(data) {
        console.log('📨 收到事件:', data);
        
        switch(data.event) {
            case 'agent_action':
                this.handleAgentAction(data);
                break;
            case 'scene_change':
                this.handleSceneChange(data);
                break;
            case 'notification':
                this.handleNotification(data);
                break;
        }
    }

    handleAgentAction(data) {
        const { agent_id, action, target } = data;
        
        const agent = state.agents.find(a => a.name === agent_id);
        if (agent) {
            agent.setStatus(action);
            
            // 更新 UI
            if (agent.name === 'HERMES-01') {
                const statusText = {
                    'idle': '🟢 待命中',
                    'thinking': '💭 思考中',
                    'working': '⚡ 工作中',
                    'waiting': '⏸️ 等待中',
                    'searching': '🔍 搜尋中',
                    'coding': '⌨️ 編碼中'
                };
                document.getElementById('hermes-status').textContent = 
                    statusText[action] || action;
            }
        }
    }

    handleSceneChange(data) {
        const { scene } = data;
        if (sceneManager && SCENES[scene]) {
            sceneManager.setScene(scene);
        }
    }

    handleNotification(data) {
        const { message, type } = data;
        console.log('📬 通知:', message);
        if (AUDIO_CONFIG.enabled) {
            playSound('notification');
        }
    }

    scheduleReconnect() {
        if (state.reconnectAttempts >= CONFIG.websocket.maxReconnectAttempts) {
            console.log('❌ 達到最大重連次數，停止重連');
            return;
        }
        
        const delay = CONFIG.websocket.reconnectInterval * Math.pow(2, state.reconnectAttempts);
        console.log(`🔄 ${state.reconnectAttempts + 1}秒後重連...`);
        
        setTimeout(() => {
            state.reconnectAttempts++;
            this.connect();
        }, delay);
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
}

// 音效管理
function initAudio() {
    // 使用 Web Audio API 產生簡單音效
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    AUDIO_CONFIG.sounds = {
        agentAppear: () => playTone(audioContext, 440, 0.1, 'sine'),
        agentAction: () => playTone(audioContext, 880, 0.05, 'triangle'),
        sceneChange: () => playTone(audioContext, 660, 0.2, 'sine'),
        notification: () => playTone(audioContext, 1320, 0.15, 'sine')
    };
}

function playTone(audioContext, frequency, duration, type) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(CONFIG.audio.volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playSound(soundName) {
    const sound = AUDIO_CONFIG.sounds[soundName];
    if (sound) {
        sound();
    }
}

// 粒子管理
function updateParticles() {
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.y += p.vy;
        p.x += p.vx;
        p.life -= 0.02;
        p.alpha = p.life;
        
        if (p.life <= 0) {
            app.stage.removeChild(p);
            state.particles.splice(i, 1);
        }
    }
}

// 建立場景背景
function createScene() {
    sceneManager = new SceneManager();
}

// 建立所有 Agent
function createAgents() {
    const agentNames = [
        'HERMES-01',
        'CLAW-ALPHA',
        'SENTINEL-07',
        'ORACLE-03',
        'NEXUS-09'
    ];
    
    const positions = [
        { x: CONFIG.width * 0.2, y: CONFIG.height * 0.5 },
        { x: CONFIG.width * 0.4, y: CONFIG.height * 0.4 },
        { x: CONFIG.width * 0.5, y: CONFIG.height * 0.6 },
        { x: CONFIG.width * 0.6, y: CONFIG.height * 0.4 },
        { x: CONFIG.width * 0.8, y: CONFIG.height * 0.5 }
    ];
    
    for (let i = 0; i < CONFIG.agentCount; i++) {
        const agent = new Agent(agentNames[i], positions[i].x, positions[i].y);
        app.stage.addChild(agent);
        state.agents.push(agent);
    }
    
    document.getElementById('agent-count').textContent = state.agents.length;
}

// FPS 計算
function updateFPS() {
    const now = performance.now();
    state.frameCount++;
    
    if (now - state.lastFrameTime >= 1000) {
        state.fps = state.frameCount;
        state.frameCount = 0;
        state.lastFrameTime = now;
        document.getElementById('fps-counter').textContent = state.fps;
    }
}

// 模擬 Agent 狀態變化（測試用）
function simulateAgentActivity() {
    const statuses = ['idle', 'thinking', 'working', 'waiting'];
    
    setInterval(() => {
        const randomAgent = state.agents[Math.floor(Math.random() * state.agents.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        randomAgent.setStatus(randomStatus);
    }, 2000);
}

// 場景切換測試（每 10 秒）
function cycleScenes() {
    const sceneIds = Object.keys(SCENES);
    let currentIndex = 0;
    
    setInterval(() => {
        currentIndex = (currentIndex + 1) % sceneIds.length;
        sceneManager.setScene(sceneIds[currentIndex]);
    }, 10000);
}

// 動畫迴圈
app.ticker.add((delta) => {
    updateFPS();
    updateParticles();
    
    state.agents.forEach(agent => {
        agent.update(delta);
    });
});

// 初始化
let sceneManager;

async function init() {
 console.log('🤖 Agent World Phase 2 初始化...');

// 先初始化 PixiJS v8
 await initPixi();

 createScene();
 createAgents();

 // 初始化音效
 if (AUDIO_CONFIG.enabled) {
  initAudio();
 }
    
    // 連接 WebSocket
    if (CONFIG.websocket.enabled) {
        new WebSocketManager();
    }
    
    // 測試用模擬
    simulateAgentActivity();
    // cycleScenes();  // 取消註解以啟用自動場景切換
    
    // 隱藏載入畫面
    document.getElementById('loading').style.display = 'none';
    
    console.log('✅ Agent World Phase 2 初始化完成');
    console.log(`📊 Agent 數量：${state.agents.length}`);
    console.log(`🎨 場景：${SCENES[state.currentScene].name}`);
}

// 視窗大小調整
window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    CONFIG.width = window.innerWidth;
    CONFIG.height = window.innerHeight;
    
    if (sceneManager) {
        sceneManager.setScene(state.currentScene);
    }
});

// 啟動
init();
