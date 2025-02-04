#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const http = require('http')
const https = require('https')
const { createRequestHandler } = require('@expo/server/adapter/express')
const express = require('express')
const compression = require('compression')
const morgan = require('morgan')

require('dotenv').config()

const CLIENT_BUILD_DIR = path.join(process.cwd(), 'dist/client')
const SERVER_BUILD_DIR = path.join(process.cwd(), 'dist/server')

const app = express()

app.use(compression())
app.disable('x-powered-by')

app.use(
  express.static(CLIENT_BUILD_DIR, {
    maxAge: '1h',
    extensions: ['html'],
  }),
)

app.use(morgan('tiny'))

app.all(
  '*',
  createRequestHandler({
    build: SERVER_BUILD_DIR,
  }),
)

const httpsOptions = {
  key: fs.readFileSync(process.env.KEY_PATH),
  cert: fs.readFileSync(process.env.CERT_PATH),
  passphrase: process.env.KEY_PASS,
}

https.createServer(httpsOptions, app).listen(443, '0.0.0.0', () => {
  console.log('Nostra Pizza server escuchando en el puerto 443 para HTTPS')
})

// @ts-ignore - Da error si los defino como any
http.createServer((req, res) => {
    res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` })
    res.end()
  })
  .listen(80, '0.0.0.0', () => {
    console.log(
      'Nostra Pizza server escuchando en el puerto 80 para redirigir a HTTPS',
    )
  })
