# Используем официальный Node.js образ как базовый
FROM node:20-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем локальные файлы в контейнер
COPY . /app

# Устанавливаем зависимости
RUN npm ci --omit=dev

RUN npm run build

# Открываем порт для API
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "run", "start:prod"]