const express = require('express');

const channelRouter = require('./routes/channels');
const userRouter = require('./routes/users');
const envConfig = require('./config/env');

const app = express();

app.use('/', userRouter);
app.use('/channels', channelRouter);

app.listen(envConfig.express.port);
