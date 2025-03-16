recursive_wildcard = $(foreach d, $(wildcard $(1:=/*)), $(call recursive_wildcard, $d, $2) $(filter $(subst *, %, $2), $d))

SRC := Cargo.toml
SRC += $(call recursive_wildcard, src, *)


.PHONY: regenerate-entities
regenerate-entities:
	rm --recursive --force src/model/entity
	sea-orm-cli generate entity \
	  --output-dir='src/model/entity' \
	  --database-url='postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:25432/$(POSTGRES_DB)' \
	  --date-time-crate='chrono' \
		--with-serde='both' \
	  --model-extra-attributes='NAPI_EXTRA_ATTR_PLACEHOLDER' && \
	for file in src/model/entity/*; do \
	  base=$$(basename -- "$${file}"); \
	  jsname=$$(printf '%s\n' "$${base%.*}" | perl -pe 's/(^|_)./uc($$&)/ge;s/_//g'); \
	  attribute=$$(printf 'macros::export(object, js_name = "%s")' "$${jsname}"); \
	  sed -i "s/NAPI_EXTRA_ATTR_PLACEHOLDER/$${attribute}/" "$${file}"; \
		sed -i 's/#\[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)\]/#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq, Serialize, Deserialize)]\n#[serde(rename_all = "camelCase")]/' "$${file}"; \
	done
	sed -i 's/#\[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)\]/#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]\n#[serde(rename_all = "camelCase")]\n#[macros::export(string_enum = "camelCase")]/' \
	  src/model/entity/sea_orm_active_enums.rs
	cargo fmt --all --

.PHONY: update-index
update-index: index.js index.d.ts

index.js index.d.ts: $(SRC) package.json
	NODE_OPTIONS='--max_old_space_size=3072' pnpm run build:debug
	[ -f built/index.js ] && [ -f built/index.d.ts ]
	rm --force index.js index.d.ts
	cp built/index.js index.js
	cp built/index.d.ts index.d.ts
