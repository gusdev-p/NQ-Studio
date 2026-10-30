DEVMODE=--dev-mode

help:
	@echo "target: help"
	@echo "------------"
	@echo "NQ-Studio Makefile help:"
	@echo "------------------------"
	@echo "Note: In the current development state the NQ-Studio only has support for linux (like Debian or Arch)."
	@echo ""
	@echo "help: Displays this message."
	@echo "run: Copy icon pack, compile the IDE then executes."
	@echo "build: Compile the IDE (same as running 'npm run build')."
	@echo "preview: Executes the compiled IDE. Note: You MUST have the IDE compiled before using this command."
	@echo "distclean: Clean old build and packages"
	@echo "install-deps: Install all the IDE dependencies (same as running 'npm install')."
	@echo "copy-settings: Copy the local settings (from the IDE source code folder) to your home."
	@echo "copy-icon-pack: Copy the local icon pack (the default one in the IDE source code folder) to your home."
	@echo "backup-settings: Copy the global settings to the IDE source code folder."
	@echo "send-state: Copy the base IDE state file (from the IDE source code folder) to your home."
	@echo "reset-settings: Copy the local settings (from the IDE source code folder) to your home."
	@echo "gen-third-party: Generate the 'THIRD-PARTY-LICENSES.md' file."

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

build:
	npm run build

preview:
	npm run preview -- $(DEVMODE)

distclean:
	rm -rf dist release
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
	@cp -r ./configs/settings.jsonc ~/.config/nq-studio/settings.jsonc
	@echo "Settings reset done! ([local] -> [global])"

send-state:
	@cp -r ./configs/saves.json ~/.config/nq-studio/saves.json
	@echo "Base IDE state file installed! ([local] -> [global])"

gen-third-party:
	npx --yes license-checker --markdown > THIRD-PARTY-LICENSES.md