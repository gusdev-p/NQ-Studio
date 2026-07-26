DEVMODE = 

all:
	$(MAKE) copy-settings
	$(MAKE) distclean
	$(MAKE) build
	$(MAKE) preview DEVMODE=--devMode
	
build:
	npm run build
	node compile-preview.js

preview:
	npm run preview -- $(DEVMODE)

distclean:
	rm -rf dist
	mkdir -p dist

install-deps:
	@echo "Installing base dependencies..."
	npm install --save-dev electron typescript esbuild @types/node node-pty @xterm/xterm @xterm/addon-fit dompurify marked
	@echo "Installing languages support..."
	npm install --save-dev monaco-editor

# just to debug :)
copy-settings:
	@rm -rf ~/.config/nq-studio/settings.json
	@rm -rf ~/.config/nq-studio/themes.json
	@cp ./configs/settings.json ~/.config/nq-studio/settings.json
	@cp ./configs/themes.json ~/.config/nq-studio/themes.json