FROM ubuntu:focal

RUN apt-get update && apt-get install -y \
    curl \
    git \
    && curl -sL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /home/app
COPY kafka.pem /home/app/kafka.pem
COPY main.sh script.js package*.json .env ./

# Ensure permissions for non-root user
RUN chmod +x main.sh script.js && chown -R root:root /home/app

RUN npm install

ENTRYPOINT ["/home/app/main.sh"]
