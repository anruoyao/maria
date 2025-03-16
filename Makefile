include ./dev/config.env
export


.PHONY: pre-commit
pre-commit: format entities napi

.PHONY: format
format:
	pnpm run format

.PHONY: entities
entities:
	rm --recursive --force ./packages/backend/built
	pnpm --filter=backend run build:debug
	pnpm run migrate
	$(MAKE) -C ./packages/backend-rs regenerate-entities

.PHONY: napi
napi:
	$(MAKE) -C ./packages/backend-rs update-index


.PHONY: build
build:
	corepack prepare pnpm@latest --activate
	pnpm install
	NODE_OPTIONS='--max_old_space_size=3072' pnpm run build:debug
	pnpm run migrate


.PHONY: db.up db.down db.init
db.up:
	$(MAKE) -C ./dev/db-container up
db.down:
	$(MAKE) -C ./dev/db-container down
db.init:
	$(MAKE) -C ./dev/db-container init

.PHONY: psql redis-cli
psql:
	$(MAKE) -C ./dev/db-container psql
redis-cli:
	$(MAKE) -C ./dev/db-container redis-cli
