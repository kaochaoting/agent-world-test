/**
 * Agent World — PixiJS 測試頁面
 * Kairos Studio © 2026
 * 
 * 功能：
 * - 5 個 Agent 同屏顯示
 * - 像素風精靈動畫
 * - 即時狀態更新
 * - 粒子效果
 */

// 配置
const CONFIG = {
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x1A1A2E,
    agentCount: 5,
    agentSize: 64,
    colors: {
        guardian: 0x4A90E2,
        silver: 0xC0C0C0,
        dark: 0x1A1A2E,
        purple: 0x9B59B6,
        red: 0xE74C3C,
        green: 0x2ECC71
    }
};

// 初始化 PixiJS 應用
const app = new PIXI.Application({
    width: CONFIG.width,
    height: CONFIG.height,
    backgroundColor: CONFIG.backgroundColor,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true
});

document.getElementById('canvas-container').appendChild(app.canvas);

// 狀態追蹤
const state = {
    agents: [],
    particles: [],
    lastFrameTime: performance.now(),
    frameCount: 0,
    fps: 0
};

// Agent 類別
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
    }

    createSprite() {
        // 建立像素風 Agent 精靈（守護者造型）
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
        
        // 設定錨點
        this.pivot.set(0, 0);
    }

    createGlowEffect() {
        // 脈衝光暈
        this.glowEffect = new PIXI.Graphics();
        this.glowEffect.alpha = 0;
        this.addChildAt(this.glowEffect, 0);
    }

    createThoughtBubble() {
        // 思考氣泡（初始隱藏）
        this.thoughtBubble = new PIXI.Graphics();
        this.thoughtBubble.visible = false;
        this.thoughtBubble.x = CONFIG.agentSize/2;
        this.thoughtBubble.y = -CONFIG.agentSize;
        this.addChild(this.thoughtBubble);
    }

    setStatus(newStatus) {
        this.status = newStatus;
        
        switch(newStatus) {
            case 'thinking':
                this.showThoughtBubble('💭');
                this.startPulse();
                break;
            case 'working':
                this.showThoughtBubble('⚡');
                this.startFastPulse();
                break;
            case 'waiting':
                this.hideThoughtBubble();
                this.stopPulse();
                break;
            default:
                this.hideThoughtBubble();
                this.stopPulse();
        }
    }

    showThoughtBubble(emoji) {
        this.thoughtBubble.clear();
        this.thoughtBubble.visible = true;
        
        // 氣泡背景
        this.thoughtBubble.beginFill(0xFFFFFF, 0.9);
        this.thoughtBubble.drawCircle(0, 0, 20);
        this.thoughtBubble.endFill();
        
        // 小圓圈
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
        // 呼吸動畫
        const time = performance.now() / 1000;
        
        if (this.pulseSpeed > 0) {
            const scale = 1 + Math.sin(time * this.pulseSpeed * 100) * this.pulseAmount;
            this.glow.scale.set(scale);
            this.glow.alpha = 0.3 * scale;
        } else {
            // Idle 狀態：輕微呼吸
            const idleScale = 1 + Math.sin(time * 2) * 0.05;
            this.glow.scale.set(idleScale);
            this.glow.alpha = 0.1;
        }

        // 懸浮效果
        this.y += Math.sin(time * 1.5) * 0.2;
    }
}

// 建立場景背景
function createScene() {
    const scene = new PIXI.Graphics();
    
    // 漸層背景
    const gradient = new PIXI.Graphics();
    gradient.beginFill(CONFIG.colors.dark);
    gradient.drawRect(0, 0, CONFIG.width, CONFIG.height);
    gradient.endFill();
    
    // 網格線（科技感）
    scene.lineStyle(1, 0x4A90E2, 0.2);
    const gridSize = 50;
    
    for (let x = 0; x < CONFIG.width; x += gridSize) {
        scene.moveTo(x, 0);
        scene.lineTo(x, CONFIG.height);
    }
    
    for (let y = 0; y < CONFIG.height; y += gridSize) {
        scene.moveTo(0, y);
        scene.lineTo(CONFIG.width, y);
    }
    
    app.stage.addChild(gradient);
    app.stage.addChild(scene);
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
    
    // 更新 UI
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

// 模擬 Agent 狀態變化
function simulateAgentActivity() {
    const statuses = ['idle', 'thinking', 'working', 'waiting'];
    
    setInterval(() => {
        const randomAgent = state.agents[Math.floor(Math.random() * state.agents.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        randomAgent.setStatus(randomStatus);
        
        // 更新 UI（只顯示第一個 Agent）
        if (randomAgent.name === 'HERMES-01') {
            const statusText = {
                'idle': '🟢 待命中',
                'thinking': '💭 思考中',
                'working': '⚡ 工作中',
                'waiting': '⏸️ 等待中'
            };
            document.getElementById('hermes-status').textContent = statusText[randomStatus] || randomStatus;
        }
    }, 2000);
}

// 動畫迴圈
app.ticker.add((delta) => {
    updateFPS();
    
    state.agents.forEach(agent => {
        agent.update(delta);
    });
});

// 初始化
function init() {
    createScene();
    createAgents();
    simulateAgentActivity();
    
    // 隱藏載入畫面
    document.getElementById('loading').style.display = 'none';
    
    console.log('🤖 Agent World 初始化完成');
    console.log(`📊 Agent 數量：${state.agents.length}`);
    console.log(`🎨 場景：情報分析署`);
}

// 視窗大小調整
window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    CONFIG.width = window.innerWidth;
    CONFIG.height = window.innerHeight;
});

// 啟動
init();
