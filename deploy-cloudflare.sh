#!/bin/bash
# Agent World — Cloudflare Pages 部署腳本
# 使用方法：./deploy-cloudflare.sh

set -e

PROJECT_NAME="agent-world-test"
BUILD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLOUDFLARE_ACCOUNT_ID="1369bf328feafa4871b71ef5afde505b"

echo "🤖 Agent World — Cloudflare Pages 部署"
echo "======================================"
echo ""

# 檢查 wrangler 是否安裝
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI 未安裝"
    echo ""
    echo "請執行以下命令安裝："
    echo "  npm install -g wrangler"
    echo ""
    echo "或手動部署："
    echo "  1. 前往 https://dash.cloudflare.com"
    echo "  2. Workers & Pages → Create application → Pages"
    echo "  3. Connect to Git → 選擇 kaochaoting/agent-world-test"
    echo "  4. Save and Deploy"
    exit 1
fi

# 檢查是否已登入
echo "🔐 檢查 Cloudflare 登入狀態..."
if ! wrangler whoami &> /dev/null; then
    echo "⚠️  未登入 Cloudflare"
    echo "📱 請執行：wrangler login"
    wrangler login
fi

# 建立或直接部署
echo ""
echo "📦 開始部署..."
echo ""

# 部署到 Pages
wrangler pages deploy "$BUILD_DIR" --project-name="$PROJECT_NAME"

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 訪問網址："
echo "   https://$PROJECT_NAME.pages.dev"
echo ""
echo "🔧 綁定自訂網域："
echo "   1. 前往 https://dash.cloudflare.com"
echo "   2. Workers & Pages → $PROJECT_NAME → Custom domains"
echo "   3. Add custom domain → test.agentsworld.live"
echo ""
