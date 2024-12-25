import express from 'express';
import httpProxy from 'http-proxy';
import dotenv from 'dotenv';

dotenv.config({
    path: '.env'
});

const app = express();

const port = process.env.PORT || 8000;

const BASE_URL = process.env.BASE_URL;

const proxy = httpProxy.createProxy({});

app.use((req, res) => {
    const hostName = req.hostname;
    const subDomain = hostName.split('.')[0];
    const resolvesTo = `${BASE_URL}${subDomain}`;

    return proxy.web(req, res, { target: resolvesTo , changeOrigin: true});

});

proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if(url === '/') {
        proxyReq.path += 'index.html';
    }
    return proxyReq;
});


app.listen(port, () => {
    console.log(`Resverse proxy is running on port ${port}`);
})