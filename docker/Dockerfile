# =========================
# 1️⃣ Builder Stage
# =========================
FROM node:20.19-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Chỉ cài tool CẦN cho build native module
RUN apk add --no-cache python3 make g++

# Copy file ảnh hưởng dependency
COPY package.json yarn.lock* ./

# Cài deps cho build
RUN yarn install \
    --frozen-lockfile \
    --non-interactive \
    --prefer-offline \
 && yarn cache clean

# Copy source (đã lọc bởi .dockerignore)
COPY . .

# Build standalone
RUN yarn build \
 && rm -rf .next/cache


# =========================
# 2️⃣ Runtime Stage (MINIMAL)
# =========================
FROM node:20.19-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--disable-proto=delete --max-old-space-size=512"

# Runtime chỉ cần tini + libc
RUN apk add --no-cache tini libc6-compat \
 && adduser -D -u 1001 appuser

# Copy output cần thiết (KHÔNG chown -R)
COPY --from=builder --chown=appuser:appuser /app/.next/standalone ./
COPY --from=builder --chown=appuser:appuser /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appuser /app/public ./public

# Fix quyền cho Image Optimizer (chỉ thư mục cần ghi)
RUN mkdir -p .next/cache/images \
 && chown appuser:appuser .next/cache/images

USER appuser

ENTRYPOINT ["tini", "--"]
CMD ["node", "server.js"]

VOLUME ["/tmp"]
