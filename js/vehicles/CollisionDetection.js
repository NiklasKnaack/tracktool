class CollisionDetection {

    static GRID_SIZE_X = 1000;
    static GRID_SIZE_Y = 1000;

    constructor() {

        if ( CollisionDetection._instance ) {

            return CollisionDetection._instance;

        }

        CollisionDetection._instance = this;
        
        //---

        this._canvasManager = new CanvasManager();
        // this._graphsManager = new GraphsManager();
        // this._navigator = new Navigator();
        this._vehicles = new Vehicles();

        this._canvasObject = this._canvasManager.getCanvasObjectByName( 'main' );
        // this._context = this._canvasObject.context;
        this._gridBorders = Tools.getFieldGridBorders( this._canvasManager.width, this._canvasManager.height );

        this._grid = [];
        this._gridYX = [];

        this.init();

    }

    //---

    init() {

        //add grid
        let ix = 0;
        let iy = 0;

        for ( let y = this._gridBorders.top, yl = this._gridBorders.bottom + this._canvasManager.height; y < yl; y += CollisionDetection.GRID_SIZE_Y ) {

            this._gridYX[ iy ] = [];

            for ( let x = this._gridBorders.left, xl = this._gridBorders.right + this._canvasManager.width; x < xl; x += CollisionDetection.GRID_SIZE_X ) {

                const gridCell = {

                    x: x,
                    y: y,
                    width: CollisionDetection.GRID_SIZE_X,
                    height: CollisionDetection.GRID_SIZE_Y,
                    neighbors: [],
                    vehicles: [],
                    // visited: false

                };

                this._grid.push( gridCell );

                this._gridYX[ iy ][ ix ] = gridCell;

                ix++;


            }

            ix = 0;
            iy++;

        }

        //set gridCell neighbors
        // for ( let y = 0, yl = this._gridYX.length; y < yl; y ++ ) {

        //     for ( let x = 0, xl = this._gridYX[ y ].length; x < xl; x ++ ) {

        //         const gridCell = this._gridYX[ y ][ x ];

        //         if ( y > 0 && x > 0 ) {

        //             gridCell.neighbors.push( this._gridYX[ y - 1 ][ x - 1 ] );

        //         }

        //         if ( y > 0 ) {

        //             gridCell.neighbors.push( this._gridYX[ y - 1 ][ x ] );

        //         }

        //         if ( y > 0 && x < xl - 2 ) {

        //             gridCell.neighbors.push( this._gridYX[ y - 1 ][ x + 1 ] );

        //         }

        //         if ( x > 0 ) {

        //             gridCell.neighbors.push( this._gridYX[ y ][ x - 1 ] );

        //         }

        //         if ( x < xl - 2 ) {

        //             gridCell.neighbors.push( this._gridYX[ y ][ x + 1 ] );

        //         }

        //         if ( y < yl - 2 && x > 0 ) {

        //             gridCell.neighbors.push( this._gridYX[ y + 1 ][ x - 1 ] );

        //         }

        //         if ( y < yl - 2 ) {

        //             gridCell.neighbors.push( this._gridYX[ y + 1 ][ x ] );

        //         }

        //         if ( y < yl - 2 && x < xl - 2 ) {

        //             gridCell.neighbors.push( this._gridYX[ y + 1 ][ x + 1 ] );

        //         }

        //     }

        // }

    }

    //---

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
            // gridCell.visited = false;

        }

        for ( let i = 0, l = this._vehicles.allVehicles.length; i < l; i ++ ) {

            const vehicle = this._vehicles.allVehicles[ i ];

            vehicle.collisionDetected = false;

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

    check() {

        for ( let i = 0, l = this._grid.length; i < l; i ++ ) {

            //collect all vehicles of grid cell and its neighbors
            const vehiclesFound = [];

            //---

            const gridCell = this._grid[ i ];
            
            if ( gridCell.vehicles.length > 0 ) {

                this._getVehiclesOfGridCell( gridCell, vehiclesFound );

            }

            // if ( gridCell.neighbors.length > 0 ) {

            //     for ( let j = 0, m = gridCell.neighbors.length; j < m; j ++ ) {

            //         const gridCellNeighbor = gridCell.neighbors[ j ];

            //         this._getVehiclesOfGridCell( gridCellNeighbor, vehiclesFound );

            //     }

            // }

            //---

            this._getCollisions( vehiclesFound );

            //console.log( vehiclesFound.length );

        }

    }

    _getCollisions( vehicles ) {

        // for ( let i = 0, l = Math.min( vehicles.length, 500 ); i < l; i ++ ) {
        for ( let i = 0, l = vehicles.length; i < l; i ++ ) {

            const vehicle0 = vehicles[ i ];

            if ( vehicle0.collisionDetected === true ) {

                continue;

            }

            // for ( let j = i, m = Math.min( vehicles.length, 500 ); j < m; j ++ ) {
            // for ( let j = 0, m = vehicles.length; j < m; j ++ ) {   
            for ( let j = i + 1, m = vehicles.length; j < m; j ++ ) {   

                const vehicle1 = vehicles[ j ];

                if ( vehicle0.collisionDetected === true && vehicle1.collisionDetected === true ) {

                    continue;

                }

                // if ( vehicle0.id !== vehicle1.id ) {

                    // if ( Tools.getDistance( vehicle0.position, vehicle1.position ) < Vehicles.VEHICLE_RADIUS * 2 ) {

                    //     vehicle0.collisionDetected = true;
                    //     vehicle1.collisionDetected = true;

                    //     // vehicle0.speed = this._vehicles.getVehicleSpeed( vehicle0, 0.05 );
                    //     // vehicle1.speed = this._vehicles.getVehicleSpeed( vehicle1, 0.05 );

                    // }

                    //better performance then getDistance
                    if ( Tools.positionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS * 2 ) === true ) {

                        vehicle0.collisionDetected = true;
                        vehicle1.collisionDetected = true;

                        //funktioniert noch nicht so wie es soll. wenn die vehicles langsamer werden oder zum stehen kommen scheint die collision detection nicht mehr korrekt zu arbeiten
                        // vehicle0.speed = this._vehicles.getVehicleSpeed( vehicle0, 0.50 );
                        // vehicle1.speed = this._vehicles.getVehicleSpeed( vehicle1, 0.50 );

                    }

                // }

            }

        }

    }

    _getVehiclesOfGridCell( gridCell, array ) {

        for ( let i = 0, l = gridCell.vehicles.length; i < l; i ++ ) {

            array.push( gridCell.vehicles[ i ] );

        }

    }

    //---

    get grid() {

        return this._grid;

    }

    //---



}