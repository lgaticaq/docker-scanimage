'use strict';

require('babel-polyfill');

import {exec} from 'child-process-promise';
import fs from 'fs';
import im from 'imagemagick';
import imgur from 'imgur';
import koa from 'koa';
import koaRouter from 'koa-router';
import os from 'os';
import path from 'path';
import Promise from 'bluebird';
import uuid from 'uuid';

Promise.promisifyAll(fs);
Promise.promisifyAll(im);

const router = koaRouter();
const app = koa();

router.get('/', async function () {
  try {
    const rawFile = path.join(os.tmpdir(), `${uuid.v4()}.ppm`);
    const outFile = path.join(os.tmpdir(), `${uuid.v4()}.jpg`);
    await exec(`scanimage > ${rawFile}`);
    await im.convertAsync([rawFile, outFile]);
    const json = await imgur.uploadFile(outFile);
    await fs.unlinkAsync(rawFile);
    await fs.unlinkAsync(outFile);
    this.body = json.data.link;
  } catch (err) {
    this.status = err.status || 500;
    this.body = err.message;
  }
});

app.use(router.routes());

app.listen(process.env.PORT || 3000);
