DEVMODE=--dev-mode

run:
	@echo "target: run"
	@echo "-----------"
	@echo "Copying icon pack..."
	$(MAKE) copy-icon-pack
	@echo "Cleaning old builds..."
	$(MAKE) distclean
	@echo "Building..."
	$(MAKE) build
	@echo "Running!..."
	$(MAKE) preview DEVMODE=$(DEVMODE); code=$$?; echo "Process ended with exit code: $$code"; exit $$code

all:
	@echo "target: all (except 'copy-settings', 'backup-settings' or 'reset-settings')"
	@echo "---------------------------------------------------------------------------"
	@echo "Copying icon pack..."
	$(MAKE) copy-icon-pack
	@echo "Cleaning old builds..."
	$(MAKE) distclean
	@echo "Building..."
	$(MAKE) build
	@echo "Running!..."
	$(MAKE) preview DEVMODE=$(DEVMODE); code=$$?; echo "Process ended with exit code: $$code"; exit $$code
	
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
	@rm -rf ~/.config/nq-studio/settings.jsonc
	@rm -rf ~/.config/nq-studio/themes.json
	@cp ./configs/settings.jsonc ~/.config/nq-studio/settings.jsonc
	@cp ./configs/themes.json ~/.config/nq-studio/themes.json
	@echo "Settings copied! ([local] -> [global])"

copy-icon-pack:
	@rm -rf ~/.config/nq-studio/icon_pack
	@mkdir -p ~/.config/nq-studio/icon_pack
	@cp -r ./assets/icon_pack/nq-studio-icon-pack ~/.config/nq-studio/icon_pack/nq-studio-icon-pack
	@echo "Icon pack copied! ([local] -> [global])"

# for my sanity
backup-settings:
	@cp -r ~/.config/nq-studio/settings.jsonc ./configs/settings.jsonc
	@echo "Settings backup done! ([global] -> [local])"

reset-settings:
	@cp -r ./configs/settings.json ~/.config/nq-studio/settings.jsonc
	@echo "Settings reset done! ([local] -> [global])"