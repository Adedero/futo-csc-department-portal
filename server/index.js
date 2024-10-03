require('dotenv').config();
require('express-async-errors');
require('./src/database/db')();

const cors = require('cors');
const express = require('express');
const PORT = process.env.PORT || 8080;
const fileUpload = require('express-fileupload');

const fs = require('node:fs');
const path = require('node:path');

const passport = require('./src/config/passport-jwt.config');
const asyncErrors = require('./src/middleware/async-errors');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL
}));

app.use(passport.initialize());


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 2 * 1024 * 1024 }
}));

app.get('/', (req, res) => res.send({
  name: 'CSC Result Portal',
  version: '1.0',
  location: 'Nigeria',
}));


app.use('/images', express.static(path.join(__dirname, 'public/assets')));

app.use('/auth', require('./src/routes/auth/auth.routes'));

app.use('/api/admin', require('./src/routes/api/admin.routes'));
app.use('/api/student', require('./src/routes/api/student.routes'));
app.use('/api/staff', require('./src/routes/api/staff.routes'));
app.use('/api/advisor', require('./src/routes/api/advisor.routes'));
app.use('/api/hod', require('./src/routes/api/hod.routes'));
app.use('/api/dean', require('./src/routes/api/dean.routes'));

app.use(asyncErrors);

app.listen(PORT, () => console.log(`Server started at ${PORT}`));