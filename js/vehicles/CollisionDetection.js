class CollisionDetection {

    //die optimale größe für die tiles muss noch genau bestimmt werden. on movement scheint größer besser
    static GRID_CELL_SIZE_X = 500;
    static GRID_CELL_SIZE_Y = 500;

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
            vehicle.collisions = [];
            //vehicle.speed = this._vehicles.getVehicleSpeed( vehicle, Vehicles.VEHICLE_SPEED );

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
                    // if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS ) === true ) {
                    if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS * 2 ) === true ) {
                    // if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS * 3 ) === true ) {
                    // if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS * 4 ) === true ) {//* 4 for testing

                        //vehicle0.collisionDetected = true;
                        //vehicle1.collisionDetected = true;

                        //---

                        // const radius = Vehicles.VEHICLE_RADIUS * 3;

                        const angle01 = Math.atan2( vehicle1.position.y - vehicle0.position.y, vehicle1.position.x - vehicle0.position.x ) + Settings.MATH_PI_050;
                        const angle10 = Math.atan2( vehicle0.position.y - vehicle1.position.y, vehicle0.position.x - vehicle1.position.x ) + Settings.MATH_PI_050;
                        // // const angle01 = vehicle1.angle + Settings.MATH_PI_050;
                        // // const angle10 = vehicle0.angle + Settings.MATH_PI_050;

                        // const sin01 = Math.sin( angle01 );
                        // const cos01 = Math.cos( angle01 );
                        // const sin10 = Math.sin( angle10 );
                        // const cos10 = Math.cos( angle10 );

                        // const px01 = sin01 * radius + vehicle0.position.x;
                        // const py01 = -cos01 * radius + vehicle0.position.y;
                        // const px10 = sin10 * radius + vehicle1.position.x;
                        // const py10 = -cos10 * radius + vehicle1.position.y;

                        // // vehicle0.drawTempStuff = [];
                        // // vehicle1.drawTempStuff = [];

                        // vehicle0.drawTempStuff.push( { x0: vehicle0.position.x, y0: vehicle0.position.y, x1: px01, y1: py01, r: 0, g: 255, b: 0, a: 255 } );
                        // vehicle1.drawTempStuff.push( { x0: vehicle1.position.x, y0: vehicle1.position.y, x1: px10, y1: py10, r: 255, g: 255, b: 255, a: 255 } );

                        //vehicle1.drawTempStuff.push( { x0: vehicle1.position.x, y0: vehicle1.position.x, x1: px10, y1: py10, r: 255, g: 0, b: 0, a: 255 } );

                        //---

                        let vehicle0CollisionDetected = false;
                        let vehicle1CollisionDetected = false;


                        const angleFront0 = vehicle0.angle + Settings.MATH_PI_050;
                        const angleFront1 = vehicle1.angle + Settings.MATH_PI_050;

                        if ( angleFront0 - Settings.MATH_PI_025 < angle01 && angleFront0 + Settings.MATH_PI_025 > angle01 ) {

                            vehicle0CollisionDetected = true;
                            //vehicle0.collisions.push( 0 );

                        }

                        if ( angleFront1 - Settings.MATH_PI_025 < angle10 && angleFront1 + Settings.MATH_PI_025 > angle10 ) {

                            vehicle1CollisionDetected = true;
                            //vehicle1.collisions.push( 0 );

                        }

                        //if ( vehicle0.speed > 0 && vehicle1.speed > 0 ) {
                        //if ( vehicle0CollisionDetected === false || vehicle1CollisionDetected === false ) {

                            //distance um zu prüfen ob sich die vehicles annähern oder entfernen.
                            const distance = Tools.getDistance( vehicle0.position, vehicle1.position );

                            vehicle0.distanceToVehicle = distance;
                            vehicle1.distanceToVehicle = distance;

                        //}

                        // console.log( Tools.isLeft( vehicle0.lastPosition, vehicle0.position, vehicle1.position ) );

                        if ( vehicle0CollisionDetected === false && vehicle1CollisionDetected === false ) {
                        //if ( vehicle0CollisionDetected === false ) {

                            //vehicle0.position, vehicle0.lastPosition = rechts vor links, vehicle0.lastPosition, vehicle0.position = links vor rechts
                            if ( Tools.isLeft( vehicle0.position, vehicle0.lastPosition, vehicle1.position ) === true && vehicle0.distanceToVehicle < vehicle0.lastDistanceToVehicle ) {

                                //vehicle0.collisionDetected = true;
                                vehicle0CollisionDetected = true;
                                //vehicle0.collisions.push( 1 );

                            }

                        //}

                        //if ( vehicle1CollisionDetected === false ) {

                            if ( Tools.isLeft( vehicle1.position, vehicle1.lastPosition, vehicle0.position ) === true && vehicle1.distanceToVehicle < vehicle1.lastDistanceToVehicle ) {

                                //vehicle1.collisionDetected = true;
                                vehicle1CollisionDetected = true;
                                //vehicle1.collisions.push( 1 );

                            }

                        //}
                        }

                        vehicle0.lastDistanceToVehicle = vehicle0.distanceToVehicle;
                        vehicle1.lastDistanceToVehicle = vehicle1.distanceToVehicle;

                        //---

                        if ( vehicle0CollisionDetected === true ) {

                            vehicle0.collisionDetected = true;
                            vehicle0.collisions.push( vehicle1 );

                        }

                        if ( vehicle1CollisionDetected === true ) {

                            vehicle1.collisionDetected = true;
                            vehicle1.collisions.push( vehicle0 );

                        }

                        //---

                        // const angleFront0 = vehicle0.angle + Settings.MATH_PI_050;
                        // const angleFront1 = vehicle1.angle + Settings.MATH_PI_050;

                        // if ( angleFront0 - Settings.MATH_PI_025 < angle01 && angleFront0 + Settings.MATH_PI_025 > angle01 ) {
                        // //if ( angleFront0 + Settings.MATH_PI_025 < angle01 && angleFront0 + Settings.MATH_PI_075 > angle01 ) {

                        //     vehicle0.collisionDetected = true;
                        //     //vehicle0.speed = 0;

                        // } else {

                        //     //vehicle0.collisionDetected = false;

                        // }

                        // if ( angleFront1 - Settings.MATH_PI_025 < angle10 && angleFront1 + Settings.MATH_PI_025 > angle10 ) {
                        // //if ( angleFront1 + Settings.MATH_PI_025 < angle10 && angleFront1 + Settings.MATH_PI_075 > angle10 ) {

                        //     vehicle1.collisionDetected = true;
                        //     //vehicle1.speed = 0;

                        // } else {

                        //     //vehicle1.collisionDetected = false;

                        // }

                        // const angleRight00 = angleFront0 + Settings.MATH_PI_025;
                        // const angleRight01 = angleFront0 + Settings.MATH_PI_075;
                        // const angleRight10 = angleFront1 + Settings.MATH_PI_025;
                        // const angleRight11 = angleFront1 + Settings.MATH_PI_075;

                        // const sin001 = Math.sin( angleRight00 );
                        // const cos001 = Math.cos( angleRight00 );
                        // const sin010 = Math.sin( angleRight01 );
                        // const cos010 = Math.cos( angleRight01 );
                        // const sin101 = Math.sin( angleRight10 );
                        // const cos101 = Math.cos( angleRight10 );
                        // const sin110 = Math.sin( angleRight11 );
                        // const cos110 = Math.cos( angleRight11 );

                        // const px001 = sin001 * radius + vehicle0.position.x;
                        // const py001 = -cos001 * radius + vehicle0.position.y;
                        // const px010 = sin010 * radius + vehicle0.position.x;
                        // const py010 = -cos010 * radius + vehicle0.position.y;
                        // const px101 = sin101 * radius + vehicle1.position.x;
                        // const py101 = -cos101 * radius + vehicle1.position.y;
                        // const px110 = sin110 * radius + vehicle1.position.x;
                        // const py110 = -cos110 * radius + vehicle1.position.y;

                        // vehicle0.drawTempStuff.push( { x0: vehicle0.position.x, y0: vehicle0.position.y, x1: px001, y1: py001, r: 25, g: 25, b: 255, a: 255 } );
                        // vehicle0.drawTempStuff.push( { x0: vehicle0.position.x, y0: vehicle0.position.y, x1: px010, y1: py010, r: 25, g: 25, b: 255, a: 255 } );
                        // vehicle1.drawTempStuff.push( { x0: vehicle1.position.x, y0: vehicle1.position.y, x1: px101, y1: py101, r: 25, g: 25, b: 255, a: 255 } );
                        // vehicle1.drawTempStuff.push( { x0: vehicle1.position.x, y0: vehicle1.position.y, x1: px110, y1: py110, r: 25, g: 25, b: 255, a: 255 } );







                        //console.clear();
                        //console.log( vehicle0.angle, vehicle1.angle );

                        // const normalizeAngle = ( angle ) => {

                        //     return Math.atan2( Math.sin( angle ), Math.cos( angle ) );
                            
                        // }

                        // const angleFront0 = vehicle0.angle + Settings.MATH_PI_050;
                        // const angleFront1 = vehicle1.angle + Settings.MATH_PI_050;

                        // const angle01 = Math.atan2( vehicle1.position.y - vehicle0.position.y, vehicle1.position.x - vehicle0.position.x );
                        // const angle10 = Math.atan2( vehicle0.position.y - vehicle1.position.y, vehicle0.position.x - vehicle1.position.x );

                        // //console.clear();
                        // //console.log( angle01, angle10 );

                        // // if ( angleFront0 - Settings.MATH_PI_025 < angleFront1 && angleFront0 + Settings.MATH_PI_025 > angleFront1 ) {
                        // if ( angleFront0 - Settings.MATH_PI_025 < angle01 && angleFront0 + Settings.MATH_PI_025 > angle01 ) {

                        //     vehicle0.collisionDetected = true;

                        // }

                        // // if ( angleFront1 - Settings.MATH_PI_025 < angleFront0 && angleFront1 + Settings.MATH_PI_025 > angleFront0 ) {
                        // if ( angleFront1 - Settings.MATH_PI_025 < angle10 && angleFront1 + Settings.MATH_PI_025 > angle10 ) {

                        //     vehicle1.collisionDetected = true;

                        // }

                        // https://jsfiddle.net/NiklasKnaack/dhzu1qwk/
                        //funktioniert noch nicht:
                        // const angleFront0 = vehicle0.angle + Settings.MATH_PI_050;
                        // const angleFront1 = vehicle1.angle + Settings.MATH_PI_050;

                        // if ( angleFront0 - Settings.MATH_PI_025 < angleFront1 && angleFront0 + Settings.MATH_PI_025 > angleFront1 ) {

                        //     vehicle0.collisionDetected = true;

                        // }

                        // if ( angleFront1 - Settings.MATH_PI_025 < angleFront0 && angleFront1 + Settings.MATH_PI_025 > angleFront0 ) {

                        //     vehicle1.collisionDetected = true;

                        // }

                        //deaktiviert, weil es aktuell sonst zu unendlich langen Rückstaus kommt die für immer mehr vehicles sorgen und die performance dann irgendwann in den Keller geht.
                        // vehicle0.speed = this._vehicles.getVehicleSpeed( vehicle0, 0.0001 );
                        // vehicle1.speed = this._vehicles.getVehicleSpeed( vehicle1, 0.0001 );
                        // vehicle0.speed = 0;
                        // vehicle1.speed = 0;

                        // //funktioniert zwar, aber kostet extrem viel performance
                        // const angle0 = Tools.getAtan2Normalized( vehicle1.position.y - vehicle0.position.y, vehicle1.position.x - vehicle0.position.x );
                        // const angle1 = Tools.getAtan2Normalized( vehicle0.position.y - vehicle1.position.y, vehicle0.position.x - vehicle1.position.x );
                        
                        // //https://jsfiddle.net/NiklasKnaack/tq7a4bwg/
                        // if ( Tools.isInsideAngle( vehicle0.angle, angle0 ) === true ) {

                        //     vehicle0.collisionDetected = true;
                        
                        // }

                        // if ( Tools.isInsideAngle( vehicle1.angle, angle1 ) === true ) {

                        //     vehicle1.collisionDetected = true;
                        
                        // }

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