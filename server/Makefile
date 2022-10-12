$(shell cargo install default-target)
BUILD_DIR ?= build
NEPTUNE_SERVER_VERSION = v0.1.0
BUILD_ERR_FILE = build-error.log
ERR_DIR ?= build-errors
BUILD_TARGET ?= $(shell default-target)

.PHONY: clean
clean: ## clean build artifacts
	rm -r ${BUILD_DIR} 2> /dev/null || :
	rm -r ${ERR_DIR} 2> /dev/null || :

.PHONY: build
build: ## build release file - aarch64-apple-darwin, x86_64-apple-darwin, or x86_64-unknown-linux-gnu
	mkdir -p -- ${BUILD_DIR}
	mkdir -p -- ${ERR_DIR}
	rustup target add ${BUILD_TARGET}
	rustup update
	cargo build --target=${BUILD_TARGET} --release 2> ${ERR_DIR}/${BUILD_TARGET}.${BUILD_ERR_FILE} && \
	mv target/${BUILD_TARGET}/release/neptune \
		${BUILD_DIR}/neptune-${NEPTUNE_SERVER_VERSION}-${BUILD_TARGET}
	stat ${BUILD_DIR}/neptune-${NEPTUNE_SERVER_VERSION}-${BUILD_TARGET} > /dev/null && rm -r ${ERR_DIR}
