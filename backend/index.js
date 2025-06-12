const express = require('express');
const app = express();
const aiRouter = require('./ai');

app.use(express.json());
app.use('/api/ai', aiRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});