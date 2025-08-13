FROM ghcr.io/puppeteer/puppeteer:19.7.2

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    MONGODB_URI=mongodb+srv://kumar29aayush:kO7ZU3ObbH14yQLo@cluster0.em78yjp.mongodb.net \
    CLOUDINARY_NAME=needlesscat \
    CLOUDINARY_API_KEY=825611849511288 \
    CLOUDINARY_SECRET_KEY=1sVfYLC09j_lTwtRb7Bwt2YMeVE \
    ADMIN_EMAIL=admin@prasadhub.com \
    ADMIN_PASSWORD=qwerty123 \
    JWT_SECRET=needlesscat \
    RAZORPAY_KEY_ID=rzp_test_LfpeKLETcSISEc \
    RAZORPAY_KEY_SECRET=RRtB0yiG3QYypL6dH7dozI7C \
    CURRENCY=INR \
    EMAIL_USER=kumar29.aayush@gmail.com \
    EMAIL_PASSWORD=rkzw fcpt nmrl crxv

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node", "server.js"]