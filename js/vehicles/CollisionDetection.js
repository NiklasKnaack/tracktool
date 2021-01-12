class CollisionDetection {

    //die optimale größe für die tiles muss noch genau bestimmt werden. on movement scheint größer besser
    static GRID_CELL_SIZE_X = 500;
    static GRID_CELL_SIZE_Y = 500;

    static COLLISION_DISTANCE = 2;

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
            vehicle.drawTempStuff = [];
            // vehicle.collisions = [];
            // vehicle.speed = this._vehicles.getVehicleSpeed( vehicle, Vehicles.VEHICLE_SPEED );

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

    _getAllVehiclesToCheckAgainst( gridCell ) {

        const vehiclesFound = [];

        if ( gridCell.vehicles.length > 0 ) {

            this._getVehiclesOfGridCell( gridCell, vehiclesFound );

        } else {

            return vehiclesFound;

        }

        if ( gridCell.neighbors.length > 0 ) {

            for ( let i = 0, l = gridCell.neighbors.length; i < l; i ++ ) {

                const gridCellNeighbor = gridCell.neighbors[ i ];

                this._getVehiclesOfGridCell( gridCellNeighbor, vehiclesFound );

            }

        }

        return vehiclesFound;

    }

    //---

    checkCollisions() {

        for ( let i = 0, l = this._grid.length; i < l; i ++ ) {

            const vehiclesFound = this._getAllVehiclesToCheckAgainst( this._grid[ i ] );

            //---

            this._setCollisions( vehiclesFound );

        }

    }

    checkCollisionsToVehicle( vehicle ) {

        const vehiclesFound = this._getAllVehiclesToCheckAgainst( vehicle.gridCell );

        //---

        return this._getCollisionToVehicle( vehiclesFound, vehicle );

    }

    //---

    _setCollisions( vehicles ) {

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
                    // if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS ) === true ) {
                    if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS * CollisionDetection.COLLISION_DISTANCE ) === true ) {
                    // if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS * 3 ) === true ) {
                    // if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS * 4 ) === true ) {//* 4 for testing

                        //vehicle0.collisionDetected = true;
                        //vehicle1.collisionDetected = true;

                        //---

                        const angle01 = Math.atan2( vehicle1.position.y - vehicle0.position.y, vehicle1.position.x - vehicle0.position.x ) + Settings.MATH_PI_050;
                        const angle10 = Math.atan2( vehicle0.position.y - vehicle1.position.y, vehicle0.position.x - vehicle1.position.x ) + Settings.MATH_PI_050;

                        // let vehicle0CollisionDetected = false;
                        // let vehicle1CollisionDetected = false;

                        let vehicle00CollisionDetected = false;
                        let vehicle01CollisionDetected = false;
                        let vehicle10CollisionDetected = false;
                        let vehicle11CollisionDetected = false;

                        const angleFront0 = vehicle0.angle + Settings.MATH_PI_050;
                        const angleFront1 = vehicle1.angle + Settings.MATH_PI_050;

                        if ( angleFront0 - Settings.MATH_PI_015 < angle01 && angleFront0 + Settings.MATH_PI_015 > angle01 ) {

                            // vehicle0CollisionDetected = true;
                            vehicle00CollisionDetected = true;

                        }

                        if ( angleFront1 - Settings.MATH_PI_015 < angle10 && angleFront1 + Settings.MATH_PI_015 > angle10 ) {

                            // vehicle1CollisionDetected = true;
                            vehicle10CollisionDetected = true;

                        }

                        if ( vehicle00CollisionDetected === false || vehicle10CollisionDetected === false ) {

                            //distance um zu prüfen ob sich die vehicles annähern oder entfernen.
                            const distance = Tools.getDistance( vehicle0.position, vehicle1.position );

                            vehicle0.distanceToVehicle = distance;
                            vehicle1.distanceToVehicle = distance;

                        }

                        if ( vehicle00CollisionDetected === false && vehicle10CollisionDetected === false ) {

                            if ( Tools.isLeft( vehicle0.lastPosition, vehicle0.position, vehicle1.position ) === true && vehicle0.distanceToVehicle < vehicle0.lastDistanceToVehicle ) {

                                // vehicle0CollisionDetected = true;
                                vehicle10CollisionDetected = true;

                            }

                            if ( Tools.isLeft( vehicle1.lastPosition, vehicle1.position, vehicle0.position ) === true && vehicle1.distanceToVehicle < vehicle1.lastDistanceToVehicle ) {

                                // vehicle1CollisionDetected = true;
                                vehicle11CollisionDetected = true;

                            }

                        }

                        vehicle0.lastDistanceToVehicle = vehicle0.distanceToVehicle;
                        vehicle1.lastDistanceToVehicle = vehicle1.distanceToVehicle;

                        //---

                        if ( vehicle00CollisionDetected === true && vehicle01CollisionDetected === false && vehicle10CollisionDetected === true && vehicle11CollisionDetected === false ) {

                            vehicle0.collisionDetected = true;
                            vehicle1.collisionDetected = false;

                            return;

                        }

                        //---

                        if ( vehicle00CollisionDetected === true || vehicle01CollisionDetected === true ) {

                            vehicle0.collisionDetected = true;

                        }

                        if ( vehicle10CollisionDetected === true || vehicle11CollisionDetected === true ) {

                            vehicle1.collisionDetected = true;

                        }

                    }

                // }

            }

        }

    }

    _getCollisionToVehicle( vehicles, vehicle ) {

        let foundCollision = false;

        for ( let i = 0, l = vehicles.length; i < l; i ++ ) {

            const v = vehicles[ i ];

            if ( vehicle.id !== v.id ) {

                if ( Tools.isPositionInCircle( vehicle.position.x, vehicle.position.y, v.position.x, v.position.y, Vehicles.VEHICLE_RADIUS * CollisionDetection.COLLISION_DISTANCE ) === true ) {

                    foundCollision = true;

                    break;

                }

            }

        }
        
        return foundCollision;

    }

    //---

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