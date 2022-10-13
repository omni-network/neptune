BUILD_DIR ?= build
NEPTUNE_SERVER_VERSION = v0.1.0
BUILD_ERR_FILE = build-error.log
ERR_DIR ?= build-errors
BUILD_TARGET ?= $(shell default-target)

.PHONY: setup
setup:
	which cargo || (curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh)
	which default-target || cargo install default-target
	rustup update

.PHONY: clean
clean: ## clean build artifacts
	rm -rf ${BUILD_DIR}
	rm -rf ${ERR_DIR}

.PHONY: build
build: ## build release file - aarch64-apple-darwin, x86_64-apple-darwin, or x86_64-unknown-linux-gnu
	mkdir -p -- ${BUILD_DIR}
	mkdir -p -- ${ERR_DIR}
	rustup target add ${BUILD_TARGET}
	cargo build --target=${BUILD_TARGET} --release 2> ${ERR_DIR}/${BUILD_TARGET}.${BUILD_ERR_FILE} && \
	mv target/${BUILD_TARGET}/release/neptune \
		${BUILD_DIR}/neptune-${NEPTUNE_SERVER_VERSION}-${BUILD_TARGET}
	stat ${BUILD_DIR}/neptune-${NEPTUNE_SERVER_VERSION}-${BUILD_TARGET} > /dev/null && rm -r ${ERR_DIR}
