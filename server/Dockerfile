# 1. Base Image: Hum Node.js se shuru karenge
FROM node:18-bullseye

# 2. Environment Variables
ENV DEBIAN_FRONTEND=noninteractive

# 3. System Updates aur Compilers Installation
# Hum apt-get use karke Java, Python aur C++ install karenge
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    default-jdk \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 4. App Directory setup
WORKDIR /app

# 5. Dependencies install karo
COPY package*.json ./
RUN npm install

# 6. Poora code copy karo
COPY . .

# 7. Port expose karo (Render automatically detect kar lega)
EXPOSE 5000

# 8. Backend start karne ki command
CMD ["node", "server.js"]