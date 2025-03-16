import { Cell } from './Cell';
class Grid{
    public state: Cell[][];
    public rows: number = 9;
    public cols: number = 6;
    constructor(rows: number,cols: number){
        this.rows = rows;
        this.cols = cols;
        this.state = [];
        for(let i=0; i<rows; i++){
            const row = [];
            for(let j=0; j<cols; j++){
                row.push(new Cell(0, '', i, j));
            }
            this.state.push(row);
        }
    }
}

export { Grid };
