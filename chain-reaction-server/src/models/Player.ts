class Player{
    public PlayerId: string;
    public PlayerName: string;
    public PlayerColor: string;
    public PlayerScore: number;
    public RoomId: string;
    public isTurn: boolean=false;
    constructor(PlayerId: string, PlayerName: string, PlayerColor: string, PlayerScore: number, RoomId: string){
        this.PlayerId = PlayerId;
        this.PlayerName = PlayerName;
        this.PlayerColor = PlayerColor;
        this.PlayerScore = PlayerScore;
        this.RoomId = RoomId;
    }
}

export { Player };
