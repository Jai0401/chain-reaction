import { Player } from './models/Player';
import { Room } from './models/Room';
import { Grid } from './models/Grid';

class GameManager {
    private rooms: Map<string, Room> = new Map();
    private nextRoomId: number = 1;
    private nextPlayerId: number = 1;

    public createRoom(): Room {
        const grid = new Grid(9, 6);
        const roomId = this.nextRoomId.toString();
        const roomUrl = `room-${roomId}`;
        
        // Create a new room
        const room = new Room(
            roomId,
            roomUrl,
            [],
            grid,
            8, // Default max players for Chain Reaction
            0, // Initial turn index
            '' // No winner yet
        );
        
        this.rooms.set(roomId, room);
        this.nextRoomId++;
        
        return room;
    }

    public getRoom(roomId: string): Room {
        const room = this.rooms.get(roomId);
        if (!room) {
            throw new Error(`Room with id ${roomId} not found`);
        }
        return room;
    }
    public getActiveRooms(): Room[] {
        return Array.from(this.rooms.values()).filter(room => room.isActive);
    }
    public joinRoom(roomId: string, playerName: string, playerColor: string): Player {
        const room = this.getRoom(roomId);
        
        if (room.RoomPlayers.length >= room.RoomSize) {
            throw new Error('Room is full');
        }
        
        const player = new Player(
            this.nextPlayerId.toString(),
            playerName,
            playerColor,
            0, // Initial score
            roomId
        );
        
        // If this is the first player, make it their turn
        if (room.RoomPlayers.length === 0) {
            player.isTurn = true;
        }
        
        room.addPlayer(player);
        this.nextPlayerId++;
        
        return player;
    }

    public makeMove(roomId: string, playerId: string, row: number, col: number): void {
        const room = this.getRoom(roomId);
        
        // Check if game is active
        if (!room.isActive) {
            throw new Error('Game has ended');
        }
        
        // Check if it's the player's turn
        const currentPlayer = room.RoomPlayers[room.RoomTurn];
        if (currentPlayer.PlayerId !== playerId) {
            throw new Error('Not your turn');
        }
        
        // Check if the move is valid (cell is empty or owned by the current player)
        const cell = room.Grid.state[row][col];
        if (cell.owner !== '' && cell.owner !== playerId) {
            throw new Error('Cannot place on opponent\'s cell');
        }
        
        // Make the move
        cell.owner = playerId;
        cell.count++;
        
        // Process explosions (chain reactions)
        this.processExplosions(room);
        
        // Check for a winner
        if (this.checkWinner(room)) {
            room.isActive = false;
            return;
        }
        
        // Move to next player's turn
        room.nextTurn();
    }
    
    private processExplosions(room: Room): void {
        let explosionsOccurred = true;
        
        // Continue processing until no more explosions occur
        while (explosionsOccurred) {
            explosionsOccurred = false;
            
            for (let i = 0; i < room.Grid.rows; i++) {
                for (let j = 0; j < room.Grid.cols; j++) {
                    const cell = room.Grid.state[i][j];
                    
                    // Skip empty cells
                    if (cell.owner === '') continue;
                    
                    // Calculate critical mass based on cell position
                    const criticalMass = this.calculateCriticalMass(i, j, room.Grid.rows, room.Grid.cols);
                    
                    // Check if cell should explode
                    if (cell.count >= criticalMass) {
                        explosionsOccurred = true;
                        
                        // Capture owner before resetting
                        const owner = cell.owner;
                        
                        // Reset the exploding cell
                        cell.count = 0;
                        cell.owner = '';
                        
                        // Distribute to valid neighbors
                        cell.neighbors.forEach(neighbor => {
                            // Check if neighbor is within bounds
                            if (neighbor.row >= 0 && neighbor.row < room.Grid.rows &&
                                neighbor.col >= 0 && neighbor.col < room.Grid.cols) {
                                const neighborCell = room.Grid.state[neighbor.row][neighbor.col];
                                
                                // Increment count and set owner
                                neighborCell.count++;
                                neighborCell.owner = owner;
                            }
                        });
                    }
                }
            }
        }
    }
    
    private calculateCriticalMass(row: number, col: number, maxRows: number, maxCols: number): number {
        // Corner cells (2 neighbors)
        if ((row === 0 || row === maxRows - 1) && (col === 0 || col === maxCols - 1)) {
            return 2;
        }
        // Edge cells (3 neighbors)
        else if (row === 0 || row === maxRows - 1 || col === 0 || col === maxCols - 1) {
            return 3;
        }
        // Center cells (4 neighbors)
        else {
            return 4;
        }
    }
    
    private checkWinner(room: Room): boolean {
        // Game needs at least 2 players to have a winner
        if (room.RoomPlayers.length < 2) return false;
        
        // Check if only one player has cells on the grid
        const activePlayers = new Set<string>();
        
        // Collect all active players (those who have cells on the grid)
        for (let i = 0; i < room.Grid.rows; i++) {
            for (let j = 0; j < room.Grid.cols; j++) {
                const cell = room.Grid.state[i][j];
                if (cell.owner !== '') {
                    activePlayers.add(cell.owner);
                }
            }
        }
        
        // If only one player is active and there were initially multiple players
        if (activePlayers.size === 1 && room.RoomPlayers.length > 1) {
            // Set the winner
            room.RoomWinner = Array.from(activePlayers)[0];
            return true;
        }
        
        return false;
    }
}

export { GameManager };
