FROM node:22.15.0

RUN apt-get update && apt-get install -y unzip

WORKDIR /app

COPY ./alara-dashboard.zip ./alara-dashboard.zip

RUN unzip alara-dashboard.zip && \
    ls -la && \
    find . -name "package.json" -type f && \
    rm alara-dashboard.zip

# !!! Заміни назву директорії нижче, якщо вона інша
WORKDIR /app/alara-dashboard

RUN npm install && chmod +x ./node_modules/.bin/vite

EXPOSE 5173

CMD ["npx", "vite"]

