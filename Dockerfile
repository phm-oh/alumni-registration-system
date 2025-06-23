# Alumni Backend Dockerfile
# ไฟล์: backend/Dockerfile

FROM node:20-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files first
COPY package*.json ./

# Install dependencies (simple approach)
RUN npm install

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p uploads logs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5500

# Expose port
EXPOSE 5500

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5500/api/health || exit 1

# Start the application
CMD ["node", "src/app.js"]