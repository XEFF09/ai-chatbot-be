-include snippets/nest.Makefile

gen-pb:
	@mkdir -p ./src/genproto/
	@protoc \
		--plugin=./node_modules/.bin/protoc-gen-ts_proto \
		--ts_proto_out=./src/genproto/ \
		--ts_proto_opt=nestJs=true \
		--proto_path=./protos \
		./protos/chat/v1/message.proto \
		./protos/chat/v1/service.proto
