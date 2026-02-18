# P78: Minimal base image (node:20-alpine) and multi-stage build to reduce attack surface.
# Scan images with: trivy image <image> or snyk container test <image>
# For production static deploy: build then serve with CloudFront + S3 or nginx:alpine.

# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# ---- Production: copy only deps and app (no dev dependencies in final image) ----
FROM node:20-alpine
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
USER app
EXPOSE 3000
ENV CHOKIDAR_USEPOLLING=true
CMD ["npm", "start"]
