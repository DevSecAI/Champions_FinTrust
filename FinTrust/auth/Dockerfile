# P78: Minimal base image (node:20-alpine) and multi-stage build to reduce attack surface.
# Scan images with: trivy image <image> or snyk container test <image>

# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Production ----
FROM node:20-alpine
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY . .
USER app
EXPOSE 5000
CMD ["node", "index.js"]
