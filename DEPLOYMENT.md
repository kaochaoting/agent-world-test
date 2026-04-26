# Agent World 測試頁面部署指南

## 📦 專案結構

```
agent-world-test/
├── index.html          # 主頁面
├── agent-world.js      # PixiJS 邏輯
└── DEPLOYMENT.md       # 本檔案
```

## 🚀 部署方式

### 方式一：Cloudflare Pages（推薦）⭐

#### 步驟 1：安裝 Wrangler CLI

```bash
# 在 Windows PowerShell 或 WSL 2 執行
npm install -g wrangler
```

#### 步驟 2：登入 Cloudflare

```bash
wrangler login
```

#### 步驟 3：建立 Pages 專案

```bash
cd ~/kairos-studio/visualization-platform/agent-world-test
wrangler pages project create agent-world-test
```

#### 步驟 4：本地預覽測試

```bash
wrangler pages dev .
```

訪問 http://localhost:8788 測試

#### 步驟 5：部署至生產環境

```bash
wrangler pages deploy . --project-name=agent-world-test
```

#### 步驟 6：綁定自訂網域

1. 前往 https://dash.cloudflare.com
2. 左側選單 → **Workers & Pages** → **agent-world-test**
3. 點選 **Custom domains** 標籤
4. 點擊 **Add custom domain**
5. 輸入：`test.agentsworld.live`
6. Cloudflare 會自動建立 DNS 記錄

---

### 方式二：GitHub Pages（備選）

#### 步驟 1：推送至 GitHub

```bash
cd ~/kairos-studio/visualization-platform/agent-world-test
git init
git add .
git commit -m "Initial Agent World test page"
git branch -M main
git remote add origin git@github.com:kaochaoting/agent-world-test.git
git push -u origin main
```

#### 步驟 2：啟用 GitHub Pages

1. 前往 https://github.com/kaochaoting/agent-world-test/settings/pages
2. **Source** 選擇 `Deploy from a branch`
3. **Branch** 選擇 `main` / 資料夾 `/ (root)`
4. 點擊 **Save**

#### 步驟 3：綁定自訂網域

1. 在 GitHub Pages 設定頁面找到 **Custom domain**
2. 輸入：`test.agentsworld.live`
3. 點擊 **Save**

#### 步驟 4：在 Cloudflare 設定 DNS

1. 前往 Cloudflare Dashboard → **agentsworld.live** → **DNS**
2. 新增 CNAME 記錄：
   - **Name**: `test`
   - **Target**: `kaochaoting.github.io`
   - **Proxy**: 開啟（橙色雲朵）

---

### 方式三：本地測試（最快）

直接用瀏覽器開啟：

```bash
# Windows
start ~/kairos-studio/visualization-platform/agent-world-test/index.html

# WSL
xdg-open ~/kairos-studio/visualization-platform/agent-world-test/index.html
```

或使用 Python 簡單伺服器：

```bash
cd ~/kairos-studio/visualization-platform/agent-world-test
python3 -m http.server 8000
```

訪問 http://localhost:8000

---

## 🎨 功能展示

### 畫面內容

- ✅ 5 個 Agent 同屏顯示（像素風守護者造型）
- ✅ 胸口光核脈衝動畫
- ✅ 懸浮效果（輕微上下浮動）
- ✅ 思考氣泡（💭 思考、⚡ 工作）
- ✅ 科技感網格背景
- ✅ 即時 FPS 顯示
- ✅ Agent 狀態面板

### Agent 狀態

| 狀態 | 動畫效果 | UI 顯示 |
|------|----------|--------|
| `idle` | 輕微呼吸、懸浮 | 🟢 待命中 |
| `thinking` | 光核脈衝、思考氣泡 | 💭 思考中 |
| `working` | 快速脈衝、閃電氣泡 | ⚡ 工作中 |
| `waiting` | 靜止、光核熄滅 | ⏸️ 等待中 |

---

## 🔧 自訂設定

### 修改 Agent 數量

編輯 `agent-world.js`：

```javascript
const CONFIG = {
    agentCount: 5,  // 改為想要的數量
    // ...
};
```

### 修改顏色

```javascript
const CONFIG = {
    colors: {
        guardian: 0x4A90E2,  // 守護者藍色
        silver: 0xC0C0C0,    // 光核銀色
        dark: 0x1A1A2E,      // 背景深色
        // ...
    }
};
```

### 修改 Agent 名稱

```javascript
const agentNames = [
    'HERMES-01',
    'CLAW-ALPHA',
    'SENTINEL-07',
    'ORACLE-03',
    'NEXUS-09'
];
```

---

## 📊 下一步擴展

### 第一階段（已完成）✅
- [x] 基礎 PixiJS 場景
- [x] Agent 精靈與動畫
- [x] 狀態系統
- [x] UI 面板

### 第二階段（待開發）
- [ ] WebSocket 連接 Hermes webhook
- [ ] 真實 Agent 事件驅動
- [ ] 場景切換系統
- [ ] 音效系統
- [ ] 粒子效果

### 第三階段（進階）
- [ ] 多場景支援（情報分析署、作戰指揮室等）
- [ ] Agent 自訂外觀（皮膚系統）
- [ ] 互動功能（點擊 Agent 查看詳情）
- [ ] 數據可視化（任務統計、效能圖表）

---

## 🐛 故障排除

### PixiJS 未載入

確認 CDN 連結正確：
```html
<script src="https://pixijs.download/v8.1.0/pixi.min.js"></script>
```

### 動畫卡頓

- 檢查 FPS 是否達到 60
- 減少 Agent 數量測試
- 確認瀏覽器硬體加速已開啟

### 網域綁定失敗

1. 確認 Cloudflare DNS 記錄已生效（可能需要 5-10 分鐘）
2. 檢查 SSL/TLS 設定為 **Full** 或 **Flexible**
3. 清除瀏覽器快取

---

## 📞 支援

- **專案倉庫**: github.com/kaochaoting/agent-world
- **文件**: https://pixijs.com/guides
- **團隊**: Kairos Studio PixiJS Team

---

**版本**: 1.0.0  
**最後更新**: 2026-04-27  
**維護者**: Kairos Studio
