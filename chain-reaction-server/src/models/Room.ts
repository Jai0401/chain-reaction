import {Player} from './Player';
import {Grid} from './Grid';

class Room{
    public RoomId: string;
    public RoomUrl: string;
    public RoomPlayers: Player[];
    public Grid: Grid;
    public RoomSize: number = 8;
    public RoomTurn: number = 0;
    public RoomWinner: string;
    public isActive: boolean = true;
    constructor(RoomId: string, RoomUrl: string, RoomPlayers: Player[], Grid: Grid, RoomSize: number, RoomTurn: number, RoomWinner: string){
        this.RoomId = RoomId;
        this.RoomUrl = RoomUrl;
        this.RoomPlayers = RoomPlayers;
        this.Grid = Grid;
        this.RoomSize = RoomSize;
        this.RoomTurn = RoomTurn;
        this.RoomWinner = RoomWinner;
    }

    addPlayer(player: Player): void{
        if(this.RoomPlayers.length >= this.RoomSize){
            throw new Error('Room is full');
        }
        player.RoomId = this.RoomId;
        this.RoomPlayers.push(player);
        this.RoomSize++;
    }

    nextTurn(): void{
        this.RoomTurn = (this.RoomTurn + 1) % this.RoomPlayers.length;
        this.RoomPlayers.forEach(player => {
            player.isTurn = false;
        }
        );
        this.RoomPlayers[this.RoomTurn].isTurn = true;
    }
}

export { Room };
