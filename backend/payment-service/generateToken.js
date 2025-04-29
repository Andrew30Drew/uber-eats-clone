const jwt = require('jsonwebtoken');

const secretKey = 'supersecretjwtkey';

const payload = {id: 'user_123'};

const token = jwt.sign(payload, secretKey, {expiresIn: '1h'})

console.log("Generated JWT Token: ", token);