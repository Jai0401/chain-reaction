// test.ts
import { io, Socket } from "socket.io-client";

// Connect to the Socket.IO server
const socket: Socket = io("http://localhost:3001");

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);

  // Test: Create a Room
  socket.emit("create_room", (createRoomResponse: { success: boolean; roomId?: string; roomUrl?: string; message?: string }) => {
    console.log("Received create_room response:", createRoomResponse);

    // Extract roomId from the response and test join_room
    const roomId = createRoomResponse.roomId;
    if (!roomId) {
      console.error("Room creation failed, cannot join room.");
      return;
    }

    // Test: Join Room
    socket.emit(
      "join_room",
      { roomId, playerName: "TestPlayer", playerColor: "red" },
      (joinRoomResponse: any) => {
        console.log("Received join_room response:", joinRoomResponse);

        // Optionally, you can test additional events like make_move after joining
        socket.emit(
          "make_move",
          { roomId, playerId: joinRoomResponse.playerId, row: 0, col: 0 },
          (makeMoveResponse: any) => {
            console.log("Received make_move response:", makeMoveResponse);
          }
        );
      }
    );
  });
});

// Listen for broadcast events
socket.on("player_joined", (data: any) => {
  console.log("Broadcast: player_joined event:", data);
});

socket.on("game_update", (data: any) => {
  console.log("Broadcast: game_update event:", data);
});

// Listen for disconnect event
socket.on("disconnect", () => {
  console.log("Disconnected from server");
});
