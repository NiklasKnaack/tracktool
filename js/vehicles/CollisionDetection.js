class CollisionDetection {

    static GRID_CELL_SIZE_X = 250;
    static GRID_CELL_SIZE_Y = 250;

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

        // this._canvasObject = this._canvasManager.getCanvasObjectByName( 'main' );
        // this._context = this._canvasObject.context;
        this._gridBorders = Tools.getFieldGridBorders( this._canvasManager.width, this._canvasManager.height );

        this._grid = [];
        this._gridYX = [];

        this.init();

    }

    //---

    init() {

        // console.log( this._gridBorders.left, this._gridBorders.top );

        //add grid
        const gridCellsX = Math.ceil( this._gridBorders.right / CollisionDetection.GRID_CELL_SIZE_X );
        const gridCellsY = Math.ceil( this._gridBorders.bottom / CollisionDetection.GRID_CELL_SIZE_Y );

        // const xl = gridCellsX * CollisionDetection.GRID_CELL_SIZE_X;
        // const yl = gridCellsY * CollisionDetection.GRID_CELL_SIZE_Y;
        // console.log( '-------------------------------------------' );
        // console.log( Math.abs( this._gridBorders.left ) + this._gridBorders.right, Math.abs( this._gridBorders.top ) + this._gridBorders.bottom );
        // console.log( gridCellsX, gridCellsY );
        // console.log( xl, yl );
        // console.log( this._gridBorders.left, this._gridBorders.top );
        // console.log( this._gridBorders.right, this._gridBorders.bottom );
        // console.log( '-------------------------------------------' );

        for ( let y = 0; y < gridCellsY; y ++ ) {

            this._gridYX[ y ] = [];

            for ( let x = 0; x < gridCellsX; x ++ ) {

                const xPos = x * CollisionDetection.GRID_CELL_SIZE_X + this._gridBorders.left;
                const yPos = y * CollisionDetection.GRID_CELL_SIZE_Y + this._gridBorders.top;

                const gridCell = {

                    x: xPos,
                    y: yPos,
                    width: CollisionDetection.GRID_CELL_SIZE_X,
                    height: CollisionDetection.GRID_CELL_SIZE_Y,
                    xe: xPos + CollisionDetection.GRID_CELL_SIZE_X,
                    ye: yPos + CollisionDetection.GRID_CELL_SIZE_Y,
                    neighbors: [],
                    vehicles: [],
                    // visited: false

                };

                this._grid.push( gridCell );

                this._gridYX[ y ][ x ] = gridCell;


            }


        }

        //set gridCell neighbors
        for ( let y = 0, yl = this._gridYX.length; y < yl; y ++ ) {

            for ( let x = 0, xl = this._gridYX[ y ].length; x < xl; x ++ ) {

                const gridCell = this._gridYX[ y ][ x ];

                //first direct neighbors

                //top center
                if ( y > 0 ) {

                    gridCell.neighbors.push( this._gridYX[ y - 1 ][ x ] );

                }

                //center left
                if ( x > 0 ) {

                    gridCell.neighbors.push( this._gridYX[ y ][ x - 1 ] );

                }

                //center right
                if ( x < xl - 2 ) {

                    gridCell.neighbors.push( this._gridYX[ y ][ x + 1 ] );

                }

                //bottom center
                if ( y < yl - 2 ) {

                    gridCell.neighbors.push( this._gridYX[ y + 1 ][ x ] );

                }

                //then diagonal neighbors

                //bottom left
                if ( y < yl - 2 && x > 0 ) {

                    gridCell.neighbors.push( this._gridYX[ y + 1 ][ x - 1 ] );

                }

                //bottom right
                if ( y < yl - 2 && x < xl - 2 ) {

                    gridCell.neighbors.push( this._gridYX[ y + 1 ][ x + 1 ] );

                }

                //top left
                if ( y > 0 && x > 0 ) {

                    gridCell.neighbors.push( this._gridYX[ y - 1 ][ x - 1 ] );

                }

                //top right
                if ( y > 0 && x < xl - 2 ) {

                    gridCell.neighbors.push( this._gridYX[ y - 1 ][ x + 1 ] );

                }

            }

        }

    }

    //---

    moveGrid( dx, dy ) {

        for ( let i = 0, l = this._grid.length; i < l; i ++ ) {

            const gridCell = this._grid[ i ];

            gridCell.x += dx;
            gridCell.y += dy;
            gridCell.xe += dx;
            gridCell.ye += dy;

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

    // addVehicleToGrid( vehicle ) {

    //     const gridCell = this.getGridCellByPosition( vehicle.position );

    //     if ( gridCell !== null ) {

    //         gridCell.vehicles.push( vehicle );

    //         //---

    //         // if ( gridCell.neighbors.length > 0 ) {

    //         //     for ( let j = 0, m = gridCell.neighbors.length; j < m; j ++ ) {

    //         //         const gridCellNeighbor = gridCell.neighbors[ j ];

    //         //         if ( this.isPositionInGridCell( vehicle.position, gridCellNeighbor ) === true ) {

    //         //             gridCell.vehicles.push( vehicle );

    //         //         }

    //         //     }

    //         // }

    //     }

    // }

    //---

    isPositionInGridCell( position, gridCell ) {

        if ( position.x >= gridCell.x && position.x < gridCell.xe && position.y >= gridCell.y && position.y < gridCell.ye ) {

            return true;

        }

        return false;

    }

    //---

    getGridCellByPosition( position ) {

        let gridCell = null;

        for ( let i = 0, l = this._grid.length; i < l; i ++ ) {

            const gC = this._grid[ i ];

            if ( this.isPositionInGridCell( position, gC ) === true ) {

                gridCell = gC;

                break;

            }

        }

        return gridCell;

    }

    getNeighborGridCellByPosition( position, gridCellInput ) {

        let gridCell = null;

        for ( let i = 0, l = gridCellInput.neighbors.length; i < l; i ++ ) {

            const gC = gridCellInput.neighbors[ i ];

            if ( this.isPositionInGridCell( position, gC ) === true ) {

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

            } else {

                continue;

            }

            if ( gridCell.neighbors.length > 0 ) {

                for ( let j = 0, m = gridCell.neighbors.length; j < m; j ++ ) {

                    const gridCellNeighbor = gridCell.neighbors[ j ];

                    this._getVehiclesOfGridCell( gridCellNeighbor, vehiclesFound );

                }

            }

            //---

            this._getCollisions( vehiclesFound );

            //console.log( vehiclesFound.length );

        }

    }

    _getCollisions( vehicles ) {

        // for ( let i = 0, l = Math.min( vehicles.length, 500 ); i < l; i ++ ) {
        for ( let i = 0, l = vehicles.length; i < l; i ++ ) {

            const vehicle0 = vehicles[ i ];

            // for ( let j = i, m = Math.min( vehicles.length, 500 ); j < m; j ++ ) {
            // for ( let j = 0, m = vehicles.length; j < m; j ++ ) {   
            for ( let j = i + 1, m = vehicles.length; j < m; j ++ ) {   

                const vehicle1 = vehicles[ j ];

                if ( vehicle0.collisionDetected === true && vehicle1.collisionDetected === true ) {

                    continue;

                }

                // if ( vehicle0.id === vehicle1.id ) {
                    
                //     continue;

                // }

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

                        //deaktiviert, weil es aktuell sonst zu unendlich langen Rückstaus kommt die für immer mehr vehicles sorgen und die performance dann irgendwann in den Keller geht.
                        // vehicle0.speed = this._vehicles.getVehicleSpeed( vehicle0, 0.0001 );
                        // vehicle1.speed = this._vehicles.getVehicleSpeed( vehicle1, 0.0001 );
                        // vehicle0.speed = 0;
                        // vehicle1.speed = 0;

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