class Cell{
    public count: number;
    public owner: string;
    public row: number;
    public col: number;
    public neighbors: {row: number, col: number}[] = [];
    constructor(count: number, owner: string, row: number, col: number){
        this.count = count;
        this.owner = owner;
        this.row = row;
        this.col = col;
        this.neighbors = [
            {row: row-1, col: col},
            {row: row+1, col: col},
            {row: row, col: col-1},
            {row: row, col: col+1}
        ];
    }
}

export { Cell };
