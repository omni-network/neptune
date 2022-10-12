BUILD_DIR:=build
NEPTUNE_SERVER_VERSION=v0.1.0
BUILD_ERR_FILE=build-error.log

.PHONY: clean
clean: ## clean build artifacts
	rm -r ${BUILD_DIR} 2> /dev/null || :

.PHONY: build-all
build-all: ## build for all targets
	$(MAKE) clean
	for target in aarch64-apple-darwin x86_64-apple-darwin x86_64-unknown-linux-gnu; do\
		$(MAKE) build BUILD_TARGET=$$target; \
	done

.PHONY: build
build: ## build release file
	(ls ${BUILD_DIR} 2> /dev/null || mkdir ${BUILD_DIR})
	rustup target add ${BUILD_TARGET}
	rustup update
	cargo build --target=${BUILD_TARGET} --release 2> ${BUILD_DIR}/${BUILD_TARGET}.${BUILD_ERR_FILE} && \
	mv target/${BUILD_TARGET}/release/neptune \
		${BUILD_DIR}/neptune-${NEPTUNE_SERVER_VERSION}-${BUILD_TARGET}
