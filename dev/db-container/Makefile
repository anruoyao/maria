.PHONY: up down init
up:
	$(COMPOSE) up --detach
down:
	$(COMPOSE) down
init:
	$(COMPOSE) down --volumes
	$(COMPOSE) up --detach

.PHONY: psql redis-cli
psql:
	$(COMPOSE) exec db psql --user=$(POSTGRES_USER) --dbname=$(POSTGRES_DB)
redis-cli:
	$(COMPOSE) exec redis redis-cli
