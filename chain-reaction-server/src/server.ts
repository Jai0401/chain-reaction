import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { GameManager } from './GameManager';

// Initialize Express app
const app = express();
app.use(cors());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Create game manager instance
const gameManager = new GameManager();

// Socket.IO event handling
io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Create a new game room
  socket.on('create_room', (callback) => {
    try {
      const room = gameManager.createRoom();
      callback({
        success: true,
        roomId: room.RoomId,
        roomUrl: room.RoomUrl
      });
    } catch (error) {
      callback({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  // Join a room
  socket.on('join_room', ({ roomId, playerName, playerColor }: { roomId: string, playerName: string, playerColor: string }, callback) => {
    try {
      const player = gameManager.joinRoom(roomId, playerName, playerColor);
      const room = gameManager.getRoom(roomId);
      
      // Join the socket to the room
      socket.join(roomId);
      
      // Notify all players in the room
      io.to(roomId).emit('player_joined', {
        players: room.RoomPlayers,
        currentTurn: room.RoomTurn
      });
      
      callback({
        success: true,
        playerId: player.PlayerId,
        roomId: room.RoomId,
        players: room.RoomPlayers,
        grid: room.Grid
      });
    } catch (error) {
      callback({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  // Handle player moves
  socket.on('make_move', ({ roomId, playerId, row, col }: { roomId: string, playerId: string, row: number, col: number }, callback) => {
    try {
      gameManager.makeMove(roomId, playerId, row, col);
      const room = gameManager.getRoom(roomId);
      
      // Broadcast updated game state to all players in the room
      io.to(roomId).emit('game_update', {
        grid: room.Grid,
        currentTurn: room.RoomTurn,
        isActive: room.isActive,
        winner: room.RoomWinner
      });
      
      callback({ success: true });
    } catch (error) {
      callback({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  // Handle spectator joining a room
  socket.on('spectate_room', ({ roomId }: { roomId: string }, callback) => {
    try {
      const room = gameManager.getRoom(roomId);
      socket.join(roomId);
      
      callback({
        success: true,
        roomId: room.RoomId,
        players: room.RoomPlayers,
        grid: room.Grid,
        currentTurn: room.RoomTurn,
        isActive: room.isActive
      });
    } catch (error) {
      callback({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Implement logic to handle player leaving games
    // For example, you could iterate through all rooms and remove the player
    // If a room becomes empty, you might want to delete it
    
  });
});

// Basic API endpoint to get active rooms
app.get('/api/rooms', (req, res) => {
  try {
    // Assuming GameManager has a method to list active rooms
    const activeRooms = gameManager.getActiveRooms();
    res.json({ success: true, rooms: activeRooms });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Chain Reaction Game Server is running');
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

export default server;
