# Azaan Clock — Makefile
# Usage: make <target>

PROJECT_DIR := $(shell pwd)

.PHONY: help local deploy build clean install check logs

# ── DEFAULT ─────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  Azaan Clock"
	@echo ""
	@echo "  make local      Start dev server at localhost:3000"
	@echo "  make deploy     Build and push to GitHub Pages"
	@echo "  make build      Build for production (no deploy)"
	@echo "  make install    Install dependencies"
	@echo "  make clean      Remove node_modules and build folder"
	@echo "  make check      Check for lint errors"
	@echo "  make logs       Tail the last GitHub Actions deployment log"
	@echo ""

# ── DEV SERVER ───────────────────────────────────────────────────────────────
local:
	npm start

# ── DEPLOY ───────────────────────────────────────────────────────────────────
deploy:
	@echo "Building and deploying to GitHub Pages..."
	npm run deploy
	@echo "Deployed. Hard refresh with Cmd+Shift+R after GitHub Actions completes."

# ── BUILD ONLY ───────────────────────────────────────────────────────────────
build:
	npm run build

# ── INSTALL ──────────────────────────────────────────────────────────────────
install:
	npm install

# ── CLEAN ────────────────────────────────────────────────────────────────────
clean:
	@echo "→ Removing node_modules and build..."
	rm -rf node_modules build
	@echo "Clean. Run 'make install' to reinstall dependencies."

# ── LINT ─────────────────────────────────────────────────────────────────────
check:
	npx eslint src/ --ext .js,.jsx

# ── GITHUB ACTIONS LOG ───────────────────────────────────────────────────────
logs:
	@which gh > /dev/null 2>&1 || (echo "GitHub CLI not installed. Run: brew install gh" && exit 1)
	gh run list --limit 1 --json databaseId --jq '.[0].databaseId' | xargs gh run view --log