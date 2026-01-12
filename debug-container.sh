#!/bin/bash

echo "🔍 Debugging Docker Container Setup..."
echo ""

# Check if container is running
if ! docker ps | grep -q XLR8_WEB; then
    echo "❌ Backend container is not running"
    echo "Run: docker-compose up -d"
    exit 1
fi

echo "📦 Checking container structure..."
echo ""

# Check workspace setup
echo "1. Workspace structure:"
docker exec XLR8_WEB ls -la /app/ | grep -E "apps|pnpm|package"

echo ""
echo "2. Apps directory:"
docker exec XLR8_WEB ls -la /app/apps/

echo ""
echo "3. DB package structure:"
docker exec XLR8_WEB ls -la /app/apps/db/

echo ""
echo "4. Check if Prisma is generated:"
if docker exec XLR8_WEB test -d /app/apps/db/generated/prisma; then
    echo "✅ Prisma client is generated"
    docker exec XLR8_WEB ls -la /app/apps/db/generated/prisma/ | head -n 10
else
    echo "❌ Prisma client NOT generated"
fi

echo ""
echo "5. Check @prisma/client in db node_modules:"
if docker exec XLR8_WEB test -d /app/apps/db/node_modules/@prisma/client; then
    echo "✅ @prisma/client found in apps/db/node_modules"
else
    echo "❌ @prisma/client NOT found in apps/db/node_modules"
fi

echo ""
echo "6. Check @prisma/client in root node_modules:"
if docker exec XLR8_WEB test -d /app/node_modules/@prisma/client; then
    echo "✅ @prisma/client found in root node_modules"
else
    echo "❌ @prisma/client NOT found in root node_modules"
fi

echo ""
echo "7. Check backend node_modules:"
if docker exec XLR8_WEB test -d /app/apps/backend/node_modules; then
    echo "✅ Backend node_modules exists"
    docker exec XLR8_WEB ls -la /app/apps/backend/node_modules/ | grep -E "db|express" || echo "   Checking workspace links..."
else
    echo "❌ Backend node_modules NOT found"
fi

echo ""
echo "8. Check db package link in backend:"
if docker exec XLR8_WEB test -L /app/apps/backend/node_modules/db; then
    echo "✅ 'db' is symlinked in backend"
    docker exec XLR8_WEB ls -la /app/apps/backend/node_modules/db
else
    echo "❌ 'db' symlink missing in backend"
fi

echo ""
echo "9. Environment variables:"
docker exec XLR8_WEB printenv | grep DATABASE_URL || echo "⚠️  DATABASE_URL not set"

echo ""
echo "10. Node modules in db package:"
docker exec XLR8_WEB find /app/apps/db/node_modules -name "@prisma" -type d 2>/dev/null | head -n 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Container Logs (last 20 lines):"
docker logs XLR8_WEB --tail 20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 To enter container and investigate:"
echo "   docker exec -it XLR8_WEB sh"
echo ""
echo "🔧 To reinstall inside container:"
echo "   docker exec -it XLR8_WEB sh -c 'cd /app && pnpm install'"
echo ""
echo "🔧 To regenerate Prisma:"
echo "   docker exec -it XLR8_WEB sh -c 'cd /app/apps/db && pnpm run generate'"