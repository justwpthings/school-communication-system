const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

console.log('LOADING ROUTES FILE...');
const routes = require('./routes');
const { uploadsDir } = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(uploadsDir));

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'School communication backend is healthy' });
});

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
