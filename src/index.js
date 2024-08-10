// import express from 'express';
// import { Buffer } from 'buffer';
// import process from 'process';
// import '@babel/polyfill';
// // import { execSync } from 'child_process';
// import webpack from 'webpack';
// import webpackConfig from '../webpack.config.cjs';
// import cors from 'cors';
// import redis from 'redis';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

require('core-js/stable');
require('regenerator-runtime/runtime');
require('dotenv').config();


const express = require('express');
const { Buffer } = require('buffer');
const process = require('process');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config.cjs');
const cors = require('cors');
const redis = require('redis');
const path = require('path');
const { execSync } = require('child_process');  // Add this line to require execSync
const fs = require('fs');


const app = express();
const PORT = process.env.PORT || 5000;
const cacheExpiration = 300; // Cache expiration time in seconds (e.g., 5 minutes)
const redisClient = redis.createClient({
  url: 'redis://localhost:6379'
});

app.use(cors());
app.use(express.json());

redisClient.on('connect', function() {
    console.log('Redis client connected');
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

// delete any of the previous calls to bundle.js in index.html: 
const htmlPath = path.resolve(__dirname, '../public', 'index.html');
const scriptTagRegex = /<script defer src="\/bundle.js"><\/script>/g;

fs.readFile(htmlPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading index.html:', err);
    return;
  }

  const cleanedHtml = data.replace(scriptTagRegex, '');
  fs.writeFile(htmlPath, cleanedHtml, 'utf8', (err) => {
    if (err) {
      console.error('Error writing index.html:', err);
      return;
    }
    console.log('index.html cleaned successfully.');
  });
});

redisClient.connect().then(() => {
    console.log('Connected to Redis');
  
    // Run Webpack bundle when the server starts
    webpack(webpackConfig, (err, stats) => {
      if (err || stats.hasErrors()) {
        console.error(err || stats.toJson().errors);
      } else {
        console.log('Webpack bundle generated successfully');
        app.listen(PORT, () => {
          console.log(`Server is running on http://localhost:${PORT}`);
        });
      }
    });
  }).catch((err) => {
    console.error('Failed to connect to Redis', err);
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/api/maptiler-key', (req, res) => {
  res.json({ key: process.env.MAPTILER_API_KEY });
});

app.get('/api/youtube-key', (req, res) => {
  res.json({ key: process.env.YOUTUBE_API_KEY });
});

// Handle POST requests
// app.post('/callPythonFunction', (req, res) => {
//     console.log("entering index.js callPythonFunction Post request");
//     const { functionName, param } = req.body;
//     console.log("Received payload:", req.body);
//     if (!functionName || !param) {
//         console.log("Missing function name or parameter");
//         return res.status(400).send('Function name and parameter are required');
//     }

//     const cacheKey = `${functionName}_${param.join('_')}`;
//     console.log("cachekey:" , cacheKey);

//     if (!redisClient.isOpen) {
//         console.error('Redis client is closed');
//         return res.status(500).send('Redis client is closed');
//     }

//     redisClient.get(cacheKey, (err, cachedResult) => {
//         console.log("Inside redisClient.get callback"); // Added debug log

//         if (err) {
//             console.error('Error retrieving from cache:', err);
//             return res.status(500).send('Internal Server Error');
//         }
//         if (cachedResult) {
//             console.log("Returning JSON result from cache:", cachedResult);
//             // return res.json({ result: cachedResult });
//             return res.json({ result: JSON.parse(cachedResult) });
//         } else {
//             try {
//                 runWebpackBundle();
//                 const scriptPath = path.join(__dirname, 'python', 'location.py');
//                 // const output = execSync(`python3 ${scriptPath} ${param.join(' ')}`, { encoding: 'utf-8' });
//                 const pythonCommand = `python3 ${scriptPath} '${JSON.stringify(param)}'`;
//                 console.log("Executing Python command:", pythonCommand);
//                 const output = execSync(pythonCommand, { encoding: 'utf-8' });
//                 console.log("Python script output:", output);
//                 redisClient.setex(cacheKey, cacheExpiration, output.trim(), (setexErr) => {
//                     if (setexErr) {
//                         console.error('Error setting cache:', setexErr);
//                     } else {
//                         console.log("Cached result successfully");
//                     }
//                 });
//                 res.json({ result: JSON.parse(output.trim()) });
//             } catch (error) {
//                 console.error('Error executing Python script:', error.message);
//                 res.status(500).send('Internal Server Error');
//             }
//         }
//     });
// });

app.post('/callPythonFunction', async (req, res) => {
    // console.log("Entering index.js callPythonFunction POST request");
    const { functionName, param } = req.body;
    // console.log("Received payload:", req.body);

    if (!functionName || !param || !Array.isArray(param)) {
        // console.log("Missing or invalid function name or parameter");
        return res.status(400).send('Function name and parameter are required and param must be an array');
    }

    // Sanitize input to generate a valid cache key
    const sanitizeString = (str) => str.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedParam = param.map(sanitizeString);
    const cacheKey = `${sanitizeString(functionName)}_${sanitizedParam.join('_')}`;
    // console.log("Generated cache key:", cacheKey);

    // Check Redis client connectivity
    if (!redisClient.isOpen) {
        return res.status(500).send('Redis client is closed');
    }

    // Log types of parameters passed to Redis command
    // console.log("Type of cacheKey:", typeof cacheKey, "Value:", cacheKey);

    // Test redisClient.ping command
    try {
        const pingResult = await redisClient.ping();
        // console.log('Redis ping result:', pingResult);

        // Use redisClient.get with detailed logging and promise-based approach
        try {
            const cachedResult = await redisClient.get(cacheKey);
            // console.log("Inside redisClient.get promise");
            // console.log("Type of cacheKey:", typeof cacheKey, "Value:", cacheKey);

            if (cachedResult) {
                console.log("Returning JSON result from cache:", cachedResult);
                return res.json({ result: JSON.parse(cachedResult) });
            } else {
                try {
                    // runWebpackBundle();
                    const scriptPath = path.join(__dirname, 'python', 'location.py');
                    const pythonCommand = `python3 "${scriptPath}" '${JSON.stringify(param)}'`;  // Wrap scriptPath in quotes
                    // console.log("Executing Python command:", pythonCommand);
                    const output = execSync(pythonCommand, { encoding: 'utf-8' });
                    // console.log("Python script output:", output);

                    // Log types of parameters passed to Redis command
                    // console.log("Type of cacheKey for setEx:", typeof cacheKey, "Value:", cacheKey);
                    // console.log("Type of output for setEx:", typeof output.trim(), "Value:", output.trim());

                    await redisClient.setEx(cacheKey, cacheExpiration, output.trim());
                    console.log("Cached result successfully");

                    res.json({ result: JSON.parse(output.trim()) });
                } catch (error) {
                    console.error('Error executing Python script:', error.message);
                    res.status(500).send('Internal Server Error');
                }
            }
        } catch (err) {
            console.error('Error retrieving from cache:', err);
            return res.status(500).send('Redis get command failed');
        }
    } catch (error) {
        console.error('Redis operation failed:', error);
        res.status(500).send('Internal Server Error');
    }
});


process.on('SIGINT', () => {
    redisClient.quit().then(() => {
        console.log('Redis client disconnected');
        process.exit(0);
    }).catch((err) => {
        console.error('Error disconnecting Redis client', err);
        process.exit(1);
    });
});

