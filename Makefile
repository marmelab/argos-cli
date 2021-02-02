.PHONY: help install demo_all upload_all\
		demo1 demo2 demo3 demo4 demo5\
		upload_demo1 upload_demo2 upload_demo3 upload_demo4 upload_demo5

help:
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## fresh install
	yarn
	yarn tsc

demo_all: demo1 demo2 demo3 demo4 demo5 ## run demo1..5

upload_all: upload_demo1 upload_demo2 upload_demo3 upload_demo4 upload_demo5 ## upload data for demo1..5

demo1: ## realworld node-express + react-redux, 1 sample only
	API_DIR=node-express CLIENT_DIR=react-redux SAMPLES=1 \
    ./bin/demo_run.sh

upload_demo1: ## upload data for demo1
	API_DIR=node-express CLIENT_DIR=react-redux SAMPLES=1 \
    ./bin/demo_upload.sh

demo2: ## realworld node-express + react-redux, initial and broken version, 2 samples for each
	API_DIR=node-express CLIENT_DIR=react-redux SAMPLES=2 \
    BROKEN_PATCH=broken.diff ./bin/demo_run.sh

upload_demo2: ## upload data for demo2
	API_DIR=node-express CLIENT_DIR=react-redux SAMPLES=2 \
    BROKEN_PATCH=broken.diff ./bin/demo_upload.sh

demo3: ## realworld node-express + vanilla-js-web-components, initial and broken version, 2 samples for each
	API_DIR=node-express CLIENT_DIR=vanilla-js-web-components SAMPLES=2 \
    BROKEN_PATCH=broken.diff ./bin/demo_run.sh

upload_demo3: ## upload data for demo3
	API_DIR=node-express CLIENT_DIR=vanilla-js-web-components SAMPLES=2 \
    BROKEN_PATCH=broken.diff ./bin/demo_upload.sh

demo4: ## realworld rails + vanilla-js-web-components, initial and broken version, 2 samples for each
	API_DIR=rails CLIENT_DIR=vanilla-js-web-components SAMPLES=2 \
    ./bin/demo_run.sh

upload_demo4: ## upload data for demo4
	API_DIR=rails CLIENT_DIR=vanilla-js-web-components SAMPLES=2 \
    ./bin/demo_upload.sh

demo5: ## realworld rails + react-redux, initial and broken version, 2 samples for each
	API_DIR=rails CLIENT_DIR=react-redux SAMPLES=2 \
    ./bin/demo_run.sh

upload_demo5: ## upload data for demo5
	API_DIR=rails CLIENT_DIR=react-redux SAMPLES=2 \
    ./bin/demo_upload.sh

upload_replay:
	./bin/argos.sh drop Replay
	./bin/argos.sh upload data/Replay/initial/*/*.json
