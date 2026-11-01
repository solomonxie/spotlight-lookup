# STORE: App Store region baked into Info.plist (us = Canada/US, cn). Default us.
STORE ?= us

.PHONY: device check

# Release build onto the connected iPhone, JS embedded (no Metro server).
device:
	npx react-native run-ios --device --mode Release --no-packager --extra-params "STORE=$(STORE)"

check:
	npm run typecheck
