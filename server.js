const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const dashboardRoutes = require("./routes/dashboard");
const LaborRoutes = require("./routes/Labor");
const purchase = require("./routes/purchase");
const Inventory = require("./routes/Inventory");
const clockIn = require("./routes/clock-in");
const clockOut = require("./routes/clock-out");
const finance = require("./routes/finance");
const tender = require('./routes/tender');
const requestRoutes = require('./routes/ProcData');
const attendanceRoutes = require('./routes/attendance');
const weekRoutes = require('./routes/week');
// const loginRoutes = require('./routes/login');
const milestoneRoutes = require('./routes/milestone');
const materialRoutes = require('./routes/material');
const employeeRoutes = require('./routes/employee');
const payrollRoutes = require('./routes/payroll');
const documentRoutes = require('./routes/document');
const sitePhotoRoutes = require('./routes/sitePhoto');
const siteExpensesRoutes = require('./routes/siteExpenses');
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');
const profileRoutes=require('./routes/profile');
const reportRoutes = require('./routes/report');
require('dotenv').config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Import Chat model for database operations
const Chat = require('./model/Chat');

io.on('connection', (socket) => {
  socket.on('joinSite', async (siteId) => {
    socket.join(siteId);
    try {
      // Get chat history from database
      const messages = await Chat.find({ siteId })
        .sort({ timestamp: 1 })
        .limit(100);
      socket.emit('chatHistory', messages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      socket.emit('chatHistory', []);
    }
  });

  socket.on('sendMessage', async ({ siteId, message }) => {
    try {
      // Save message to database
      const newMessage = new Chat({
        siteId,
        sender: message.sender,
        message: message.message,
        timestamp: message.timestamp,
        isUser: message.isUser
      });
      
      const savedMessage = await newMessage.save();
      
      // Broadcast to all in the room
      io.to(siteId).emit('newMessage', savedMessage);
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  });
});

// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Root route for API health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// MongoDb Connection using .env for the BuildTrack App 
const url = process.env.MONGO_URI;

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/labor', LaborRoutes);
app.use('/api/team', LaborRoutes);
app.use("/api/purchase", purchase);
app.use("/api/inventory", Inventory);
app.use("/api/clock-in", clockIn);
app.use("/api/clock-out", clockOut);
app.use("/api/finance", finance);
app.use("/api/tender", tender); 
app.use('/api/procurement', requestRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/weeks', weekRoutes);
// app.use('/api/login', loginRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/site-photos', sitePhotoRoutes);
app.use('/api/site-expenses', siteExpensesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile',profileRoutes);
app.use('/api/report', reportRoutes);


// Connect to DB and Start Server at Mongo Db Cluster
mongoose.connect(url)
    .then(() => {
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, async () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Connected to ConstructionSite database');
        });
    })
    .catch(err => {
        console.error('Database connection error:', err);
        // Start server even if database connection fails
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, async () => {
            console.log(`Server running on port ${PORT} (without database)`);
        });
    }
);
