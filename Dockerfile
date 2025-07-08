# Stage 1: Build React frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Base backend setup
FROM node:18 AS backend-base
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend ./backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Stage 3: Production image
FROM node:18-slim AS production
WORKDIR /app
COPY --from=backend-base /app/backend ./
COPY --from=backend-base /app/frontend/dist ./frontend/dist
ENV NODE_ENV=production
CMD ["node", "index.js"]

# Stage 4: Development image
FROM node:18 AS development
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend
RUN cd backend && npm install
RUN cd frontend && npm install
CMD ["sh", "-c", "cd backend && nodemon index.js"]

# Stage 5: Testing image
FROM backend-base AS testing
ENV NODE_ENV=test
CMD ["npm", "run", "test"]