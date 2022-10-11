-include .env

.PHONY: clean
clean: ## clean build artifacts
	rm -r ${BUILD_DIR} 2> /dev/null || :

.PHONY: build
build: clean ## build release file
	(ls build 2> /dev/null || mkdir ${BUILD_DIR}) &&\
	rustup target add ${BUILD_TARGET} &&\
	cargo build --target=${BUILD_TARGET} --release 2> ${BUILD_DIR}/${BUILD_ERR_FILE} && \
	mv target/${BUILD_TARGET}/release/neptune \
		${BUILD_DIR}/neptune-${NEPTUNE_SERVER_VERSION}-${BUILD_TARGET}
