import http from 'http';
import querystring from 'querystring';
import url from 'url';
import * as fs from 'fs';

import {
  pipeline,
  env
} from '@xenova/transformers';
env.localModelPath = 'src/static/models/';


class TextGenerationPipeline {
  static task = 'text-generation';
  static model = 'Xenova/gpt2';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      // NOTE: Uncomment this to change the cache directory
      // env.cacheDir = './.cache';

      this.instance = pipeline(this.task, this.model, {
        progress_callback
      });
    }

    return this.instance;
  }
}


// Define the HTTP server
const server = http.createServer();
const hostname = 'localhost';
const port = 3000;


// Listen for requests made to the server
server.on('request', async (req, res) => {
  // Parse the request URL
  const parsedUrl = url.parse(req.url);

  // Extract the query parameters
  const {
    text
  } = querystring.parse(parsedUrl.query);

  let response;
  if (parsedUrl.pathname === '/generate' && text) {
    // Set the response headers
    res.setHeader('Content-Type', 'application/json');

    const classifier = await TextGenerationPipeline.getInstance();
    response = await classifier(text);
    res.statusCode = 200;

    // Send the JSON response
    res.end(JSON.stringify(response));
  } else if (parsedUrl.pathname === '/') {
    //Calling the root, serving index.html
    res.setHeader('Content-Type', 'text/html');
    res.statusCode = 200;
    // Send the JSON response
    res.end(fs.readFileSync('index.html'));
  } else {
    response = {
      'error': 'Bad request'
    }
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 400;
    // Send the JSON response
    res.end(JSON.stringify(response));
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


TextGenerationPipeline.getInstance();