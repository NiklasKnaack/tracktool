class CollisionDetection {

    static GRID_SIZE_X = 750;
    static GRID_SIZE_Y = 750;

    constructor() {

        if ( CollisionDetection._instance ) {

            return CollisionDetection._instance;

        }

        CollisionDetection._instance = this;
        
        //---

        this._canvasManager = new CanvasManager();
        // this._graphsManager = new GraphsManager();
        // this._navigator = new Navigator();

        this._canvasObject = this._canvasManager.getCanvasObjectByName( 'main' );
        this._context = this._canvasObject.context;
        this._gridBorders = Tools.getFieldGridBorders( this._canvasManager.width, this._canvasManager.height );

        this._grid = [];

        this.init();

    }

    //---

    init() {

        for ( let y = this._gridBorders.top, yl = this._gridBorders.bottom + this._canvasManager.height; y < yl; y += CollisionDetection.GRID_SIZE_Y ) {

            for ( let x = this._gridBorders.left, xl = this._gridBorders.right + this._canvasManager.width; x < xl; x += CollisionDetection.GRID_SIZE_X ) {

                const gridCell = {

                    x: x,
                    y: y,
                    width: CollisionDetection.GRID_SIZE_X,
                    height: CollisionDetection.GRID_SIZE_Y,
                    vehicles: []

                };

                this._grid.push( gridCell );


            }

        }

        console.log( this._grid );

    }

    //---

    // drawGrid() {

    //     for ( let i = 0, l = this._grid.length; i < l; i ++ ) {




    //     }

    // }

    moveGrid( dx, dy ) {

        for ( let i = 0, l = this._grid.length; i < l; i ++ ) {

            const gridCell = this._grid[ i ];

            gridCell.x += dx;
            gridCell.y += dy;

        }

    }

    //---

    clearGridCells() {

        for ( let i = 0, l = this._grid.length; i < l; i ++ ) {

            const gridCell = this._grid[ i ];

            gridCell.vehicles = [];

        }

    }

    //---

    getGridCellByPosition( position ) {

        let gridCell = null;

        for ( let i = 0, l = this._grid.length; i < l; i ++ ) {

            const gC = this._grid[ i ];

            if ( position.x >= gC.x && position.x < gC.x + gC.width && position.y >= gC.y && position.y < gC.y + gC.height ) {

                gridCell = gC;

                break;

            }

        }

        return gridCell;

    }

    //---

    get grid() {

        return this._grid;

    }

    //---



}