# Install dev and compilation dependencies, build files
FROM docker.io/node:20-alpine AS build
WORKDIR /firefish

# Install build tools and work around the linker name issue
RUN apk update && apk add --no-cache build-base linux-headers curl ca-certificates python3 perl
RUN ln -s $(which gcc) /usr/bin/aarch64-linux-musl-gcc

# Install Rust toolchain
RUN curl --proto '=https' --tlsv1.2 --silent --show-error --fail https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Configure pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Build
COPY . ./
RUN pnpm install --frozen-lockfile
RUN NODE_ENV='production' NODE_OPTIONS='--max_old_space_size=3072' pnpm run build

# Trim down the dependencies to only those for production
RUN find . -path '*/node_modules/*' -delete && pnpm install --prod --frozen-lockfile

# Runtime container
FROM docker.io/node:20-alpine
WORKDIR /firefish

# Install runtime dependencies
RUN apk update && apk add --no-cache zip unzip tini ffmpeg curl

COPY . ./

# Copy node modules
COPY --from=build /firefish/node_modules /firefish/node_modules
COPY --from=build /firefish/packages/backend/node_modules /firefish/packages/backend/node_modules
# COPY --from=build /firefish/packages/sw/node_modules /firefish/packages/sw/node_modules
# COPY --from=build /firefish/packages/client/node_modules /firefish/packages/client/node_modules
COPY --from=build /firefish/packages/firefish-js/node_modules /firefish/packages/firefish-js/node_modules

# Copy the build artifacts
COPY --from=build /firefish/built /firefish/built
COPY --from=build /firefish/packages/backend/built /firefish/packages/backend/built
COPY --from=build /firefish/packages/backend/assets/instance.css /firefish/packages/backend/assets/instance.css
COPY --from=build /firefish/packages/backend-rs/built /firefish/packages/backend-rs/built
COPY --from=build /firefish/packages/firefish-js/built /firefish/packages/firefish-js/built

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV NODE_ENV=production
VOLUME "/firefish/files"
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "pnpm", "run", "start:container" ]
