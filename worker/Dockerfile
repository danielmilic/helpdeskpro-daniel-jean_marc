FROM node:22-alpine
WORKDIR /app
# 1. Dépendances : couche reconstruite uniquement si package*.json change
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev
# 2. Code applicatif : change à chaque commit, placé en dernier
COPY --chown=node:node . .
# 3. Exécution sans privilèges
USER node
CMD ["node", "worker.js"]
