const express = require('express');
const app = express();
const aiRoutes = require('./ai');
app.use(express.json());
app.use('/api/ai', aiRoutes);

// ...other routes and middleware...

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));