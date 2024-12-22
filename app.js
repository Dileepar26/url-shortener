const express = require('express');
const app = express()
const urlRoutes = require('./src/routes/urlRoutes');
const logger = require('./src/utils/logger');
const authRoutes = require('./src/routes/authRoutes');

// --------------------------------------------------------------------------------------------------
app.use(express.json()); // parse json
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
// --------------------------------------------------------------------------------------------------
app.use(function (req, res, next) {
    const requestIncomingTime = Date.now();
    res.on('finish', () => {
        const requestEndingTime = Date.now();
        const elapsedTime = requestEndingTime - requestIncomingTime;
        logger.debug(`[${req.method}] ${req.originalUrl} [${elapsedTime} ms]`);
    });
    logger.info(`[${req.ip}]: [${req.method}] ${req.originalUrl}`)
    next();
});

app.use('/auth', authRoutes);
app.use('/api', urlRoutes);

app.use('*', (req, res) => {
    res.status(404).send('<h1>page not found</h1>')
})

// Serve default page for /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
const HTTP_PORT = 3000
app.listen(HTTP_PORT, function () {
    logger.info(`HTTP Server started at port ${HTTP_PORT}`);
});