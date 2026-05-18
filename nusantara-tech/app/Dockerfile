# Stage 1: Build & Install Dependencies [cite: 124]
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

# Stage 2: Runtime Environment (Best Practices & Non-Root) [cite: 123, 128]
FROM node:18-alpine
WORKDIR /app

# Menerapkan best practice: membuat non-root user [cite: 22, 130]
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Salin modul dari stage builder dan salin sisa source code [cite: 132, 133]
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Mengubah hak kepemilikan direktori kerja [cite: 134]
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
