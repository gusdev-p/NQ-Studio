DEVMODE=--devMode

all:
	$(MAKE) copy-settings
	$(MAKE) distclean
	$(MAKE) build
	$(MAKE) preview DEVMODE=$(DEVMODE)
	
build:
	npm run build
	node compile-preview.js

preview:
	npm run preview -- $(DEVMODE)

distclean:
	rm -rf dist
	mkdir -p dist

install-deps:
	npm install

# just to debug :)
copy-settings:
	@mkdir -p ~/.config/nq-studio
	@rm -rf ~/.config/nq-studio/settings.json
	@rm -rf ~/.config/nq-studio/themes.json
	@cp ./configs/settings.json ~/.config/nq-studio/settings.json
	@cp ./configs/themes.json ~/.config/nq-studio/themes.json