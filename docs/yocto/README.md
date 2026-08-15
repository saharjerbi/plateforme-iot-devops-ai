# Yocto / QEMU Build & Validation (Agent 2)

## 1. Overview
This directory contains the documentation and core configuration snippets for the Embedded Linux target.
- **Distribution:** Poky 5.0.19 (Scarthgap)
- **Target Machine:** `qemux86-64`
- **Kernel Version:** Linux 6.6.142-yocto-standard
- **Status:** Verified & Booted in QEMU (Headless)

## 2. Build Artifacts Policy
To maintain repository performance, heavy build directories are explicitly ignored:
- `build/tmp/`
- `build/sstate-cache/`
- `build/downloads/`

## 3. Reproduction Steps (Ubuntu Runner)
1. Initialize the Yocto environment:
   ```bash
   cd ~/yocto-workspace && source poky/oe-init-build-env build
