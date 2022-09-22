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
        this._graphsManager = new GraphsManager();
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
                    visible: false,
                    // visited: false

                };

                gridCell.visible = this._isGridCellVisible( gridCell );

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

            gridCell.visible = this._isGridCellVisible( gridCell );

        }

    }

    updateGrid() {

        for ( let i = 0, l = this._grid.length; i < l; i ++ ) {

            const gridCell = this._grid[ i ];

            gridCell.visible = this._isGridCellVisible( gridCell );

        }

    }

    //---

    _isGridCellVisible( gridCell ) {

        //https://stackoverflow.com/questions/123999/how-can-i-tell-if-a-dom-element-is-visible-in-the-current-viewport
        return (
            gridCell.xe > 0 &&
            gridCell.ye > 0 &&
            gridCell.x < this._canvasManager.width &&
            gridCell.y < this._canvasManager.height
        );

    }

    //---

    clearGridCells() {

        for ( let i = 0, l = this._grid.length; i < l; i ++ ) {

            const gridCell = this._grid[ i ];

            gridCell.vehicles = [];
            // gridCell.visited = false;

        }

    }

    clearCollisions() {

        for ( let i = 0, l = this._vehicles.allVehicles.length; i < l; i ++ ) {

            const vehicle = this._vehicles.allVehicles[ i ];

            vehicle.collisionDetected = false;
            // vehicle.drawTempStuff = [];
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

        } // else {

            // return vehiclesFound; //macht eigentlich keinen sinn, oder? verursacht eher probleme. wobei es bei z.B. 1500 vehicles einen unterschied von 4 fps macht?!

        // }

        if ( gridCell.neighbors.length > 0 ) {

            for ( let i = 0, l = gridCell.neighbors.length; i < l; i ++ ) {

                const gridCellNeighbor = gridCell.neighbors[ i ];

                if ( gridCellNeighbor.vehicles.length > 0 ) {

                    this._getVehiclesOfGridCell( gridCellNeighbor, vehiclesFound );

                }

            }

        }

        return vehiclesFound;

    }

    //---

    checkIntersections() {

        //das ist hier besser aufgehoben als in der _setCollisions methode, weil es so ingesamt weniger aufrufe von _setIntersectionCollision sind
        for ( let i = 0, l = this._vehicles.allVehicles.length; i < l; i ++ ) {

            this._setIntersectionCollision( this._vehicles.allVehicles[ i ] );

        }

    }

    checkCollisions() {

        // for ( let i = 0, l = this._grid.length; i < l; i ++ ) {
        // for ( let i = 0, l = this._grid.length; i < l; i += 2 ) {//weil alle umiegenden gridCells auf vehicles geprüft werdne könnte += 2 asureichen und eine bessere performance bieten.
        for ( let i = 0, l = this._grid.length; i < l; i += 3 ) {//vielleicht noch besser? performance ist besser, aber reicht das für eine gute collision detection? 9 gridCells durch 3 = 3...
        // for ( let i = 0, l = this._grid.length; i < l; i += 4 ) {//noch besser??

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

    //check Collision Detection only if there is a match between the next two points on the route.
    //does not yet work reliably!?
    _getControlPointsMatch( vehicle0, vehicle1 ) {
        
        if ( vehicle0.checkPoint0 === null || vehicle0.checkPoint1 === null || vehicle1.checkPoint0 === null || vehicle1.checkPoint1 === null ) {

            if ( vehicle0.checkPoint1 === null && vehicle1.checkPoint1 === null ) {

                if ( Tools.comparePoints( vehicle0.checkPoint0, vehicle1.checkPoint0 ) === false ) {

                    return false;

                }

            }

            if ( vehicle0.checkPoint1 !== null && vehicle1.checkPoint1 === null ) {

                if (

                    Tools.comparePoints( vehicle0.checkPoint0, vehicle1.checkPoint0 ) === false &&
                    Tools.comparePoints( vehicle0.checkPoint1, vehicle1.checkPoint0 ) === false 
                    
                ) {
        
                    return false;
        
                }
                
            }

            if ( vehicle0.checkPoint1 === null && vehicle1.checkPoint1 !== null ) {

                if (

                    Tools.comparePoints( vehicle0.checkPoint0, vehicle1.checkPoint0 ) === false &&
                    Tools.comparePoints( vehicle0.checkPoint0, vehicle1.checkPoint1 ) === false
                    
                ) {
        
                    return false;
        
                }
                
            }

        } else {

            if (

                Tools.comparePoints( vehicle0.checkPoint0, vehicle1.checkPoint0 ) === false &&
                Tools.comparePoints( vehicle0.checkPoint0, vehicle1.checkPoint1 ) === false &&
                Tools.comparePoints( vehicle0.checkPoint1, vehicle1.checkPoint0 ) === false &&
                Tools.comparePoints( vehicle0.checkPoint1, vehicle1.checkPoint1 ) === false 
                
            ) {
    
                return false;
    
            }

        }

        return true;

    }

    //---

    _setIntersectionCollision( vehicle ) {

        //const lookupPointId = GraphsManager.getLookupPointId( vehicle.checkPoint0 );

        //wenn das vehicle nicht in einer warteschlange steht, bzw. sich nicht an oder in einer intersection befindet
        if ( vehicle.queuePoint === null ) {

            //der nächste punkt den das vehicle erreichen wird
            const vehicleNextPoint = this._graphsManager.getPointInLookupById( 0, GraphsManager.getLookupPointId( vehicle.checkPoint0 ) );

            //console.log("SHHH")
            
            //folgende überprüfungen nur durchführen, wenn ein point in der lookup gefunden werden konnte
            if ( vehicleNextPoint !== undefined ) {

                //wenn der nächste punkt eine intersection ist
                // if ( vehicleNextPoint.neighbourPoints.length > 2 ) {
                if ( vehicleNextPoint.intersection === true ) {

                    //wenn sich das vehicle noch nicht in der warteschlange der intersection befindet
                    if ( vehicleNextPoint.vehiclesWaiting.includes( vehicle.id ) === false ) {
                    // if ( vehicleNextPoint.vehiclesWaiting.some( v => v.id === vehicle.id ) === false ) {

                        //wenn das vehicle die intersection erreicht hat
                        if ( Tools.isPositionInCircle( vehicle.position.x, vehicle.position.y, vehicleNextPoint.x, vehicleNextPoint.y, Vehicles.VEHICLE_RADIUS * CollisionDetection.COLLISION_DISTANCE ) === true ) {

                            vehicle.queuePoint = vehicleNextPoint;
                            vehicle.queuePoint.vehiclesWaiting.push( vehicle.id );
                            // vehicle.queuePoint.vehiclesWaitingRouteIndices.push( vehicle.routeIndex );
                            vehicle.queueWaiting = true;
                            vehicle.queueTimer = 1;
                            vehicle.queuePrevious = false;
                            //vehicle.queueInIntersection = true;
                            //vehicle.only2VehiclesFromSameRoute = false;

                            //vehicle.halted = true
                            
                        }

                    }

                }

            }
            
        //wenn sich das vehicle an oder in dem bereich einer intersection befindet
        } else {

            /*
            if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS * 2 * CollisionDetection.COLLISION_DISTANCE ) === true && vehicle0.routeIndex === vehicle1.routeIndex ) {

                if ( vehicle0.t > vehicle1.t ) {

                    vehicle1.collisionDetected = true;

                }

                if ( vehicle1.t > vehicle0.t ) {

                    vehicle0.collisionDetected = true;

                }

            }
            */








            // let routeIndexTest = true;

            // const vehiclesWaitingRouteIndices = vehicle.queuePoint.vehiclesWaitingRouteIndices;

            // for ( let i = 0, l = vehiclesWaitingRouteIndices.length; i < l; i ++ ) {

            //     const routeIndex = vehiclesWaitingRouteIndices[ i ];

            //     if ( routeIndex !== vehicle.routeIndex ) {

            //         routeIndexTest = false;

            //     }

            // }

            // if ( routeIndexTest === true ) {

            //     //es sind nur vehicles in der intersection auf der selben route wie vehicle

            // } else {

            //     //es sind vehicles von anderen routen in der intersection als vehicle

            // }

            //let only2VehiclesFromSameRoute = false;
            //vehicle.only2VehiclesFromSameRoute = false;

            //wird nur überprüft, wenn es auf der selben route ein vehicle vor diesem vehicle gibt
            if ( vehicle.previousVehicleOnRoute !== null ) {

                

                // if ( vehicle.queuePoint.vehiclesWaiting.length === 2 ) {

                //     //console.log("asdasdas");

                //     //vehicle.queueIndex = vehicle.queuePoint.vehiclesWaiting.findIndex( ( vId ) => vId === vehicle.id );

                //     //console.log( vehicle.queuePoint.vehiclesWaiting );

                //     //const previousVehicleOnRouteId = vehicle.queuePoint.vehiclesWaiting[ 0 ];

                //     //console.log(previousVehicleOnRoute.id, vehicle.id);

                //     //getVehicleById

                //     if ( vehicle.queuePoint.vehiclesWaiting[ 0 ] === vehicle.previousVehicleOnRoute.id || vehicle.queuePoint.vehiclesWaiting[ 1 ] === vehicle.previousVehicleOnRoute.id ) {

                //         //console.log("FOUND");

                //         vehicle.only2VehiclesFromSameRoute = true;


                //     }

                //     //console.log(vehicle.only2VehiclesFromSameRoute);

                // }

                

                //wenn das vorherige vehicle sich noch in der intersectio, oder kurz dahinter befindet
                // if ( vehicle.only2VehiclesFromSameRoute === false && Tools.isPositionInCircle( vehicle.queuePoint.x, vehicle.queuePoint.y, vehicle.previousVehicleOnRoute.position.x, vehicle.previousVehicleOnRoute.position.y, Vehicles.VEHICLE_RADIUS * 2 * CollisionDetection.COLLISION_DISTANCE ) === true ) {
                if ( Tools.isPositionInCircle( vehicle.queuePoint.x, vehicle.queuePoint.y, vehicle.previousVehicleOnRoute.position.x, vehicle.previousVehicleOnRoute.position.y, Vehicles.VEHICLE_RADIUS * 2 * CollisionDetection.COLLISION_DISTANCE ) === true ) {

                    vehicle.queueIndex = vehicle.queuePoint.vehiclesWaiting.findIndex( ( vId ) => vId === vehicle.id );

                    if ( vehicle.queueIndex !== vehicle.queuePoint.vehiclesWaiting.length - 1 ) {

                        //console.log('---> ', vehicle.id);

                        vehicle.queuePoint.vehiclesWaiting.splice( vehicle.queueIndex, 1 );
                        vehicle.queuePoint.vehiclesWaiting.push( vehicle.id );

                        // vehicle.queuePoint.vehiclesWaitingRouteIndices.splice( vehicle.queueIndex, 1 );
                        // vehicle.queuePoint.vehiclesWaitingRouteIndices.push( vehicle.routeIndex );

                    }

                    //vor diesem vehicle befindet sich ein anderes vehicle
                    vehicle.queuePrevious = true;

                    return;

                } else {

                    //vor diesem vehicle befindet sich kein anderes vehicle
                    vehicle.queuePrevious = false;

                }

            }

            


            //console.log( vehicle.queuePoint.vehiclesWaiting.length );
            //console.log( vehicle.queueTimer );

            //wenn es nur ein vehicle, also genau dieses vehicle, sich in der warteschlange der intersection befindet
            // if ( vehicle.queuePoint.vehiclesWaiting.length === 1 || vehicle.only2VehiclesFromSameRoute === true ) {
            if ( vehicle.queuePoint.vehiclesWaiting.length === 1 ) {
                
                vehicle.queueTimer = 0;
            
            //wenn die warteschlange der intersection mehrere vehicles beinhaltet, also wenn mehrere vehicles an der intersection warten
            } else {

                // vehicle.queueIndex = vehicle.queuePoint.vehiclesWaiting.findIndex( ( vId ) => vId === vehicle.id );

                // zu schauen ob die vehicle id im array auf position 0 zu finden (sich also in der warteschlange befindet) ist ist deutlich performanter als die stetige überprüfung mit findIndex, vor allem bei langen arrays
                if ( vehicle.queuePoint.vehiclesWaiting[ 0 ] === vehicle.id ) {
                // if ( vehicle.queuePoint.vehiclesWaiting[ 0 ].id === vehicle.id ) {

                    vehicle.queueIndex = 0;

                }

            }

            //wenn das vehicle in der warteschlange dran ist, also an erster position, also queueIndex === 0, aber der queueTimer noch größer 0 ist, also noch nicht runtergezählt worden ist
            if ( vehicle.queueIndex === 0 && vehicle.queueTimer > 0 ) {

                vehicle.queueTimer--;

            }

            //wenn der queueTimer vom vehicle 0 ist, also runtergezählt worden ist
            if ( vehicle.queueTimer === 0 ) {

                vehicle.queueWaiting = false;

                //wenn das vehicle die intersection wieder verlassen hat
                if ( Tools.isPositionInCircle( vehicle.position.x, vehicle.position.y, vehicle.queuePoint.x, vehicle.queuePoint.y, Vehicles.VEHICLE_RADIUS * CollisionDetection.COLLISION_DISTANCE ) === false ) {

                    // vehicle.queuePoint.vehiclesWaiting.splice( vehicle.queueIndex, 1 );
                    vehicle.queuePoint.vehiclesWaiting.shift();
                    // vehicle.queuePoint.vehiclesWaitingRouteIndices.shift();
                    vehicle.queuePoint = null;
                    vehicle.queueIndex = -1;
                    vehicle.queueTimer = 0;
                    vehicle.queuePrevious = false;
                    //vehicle.only2VehiclesFromSameRoute = false;
                    //vehicle.queueInIntersection = false;

                }

            }

        }

    }

    _setCollisions( vehicles ) {

        // for ( let i = 0, l = Math.min( vehicles.length, 500 ); i < l; i ++ ) {
        for ( let i = 0, l = vehicles.length; i < l; i ++ ) {

            const vehicle0 = vehicles[ i ];

            // this._setIntersectionCollision( vehicle0 );

            // for ( let j = i, m = Math.min( vehicles.length, 500 ); j < m; j ++ ) {
            // for ( let j = 0, m = vehicles.length; j < m; j ++ ) {   
            for ( let j = i + 1, m = vehicles.length; j < m; j ++ ) {   

                const vehicle1 = vehicles[ j ];

                if ( vehicle0.queueWaiting === true ) {

                    vehicle0.collisionDetected = true;

                }

                if ( vehicle0.collisionDetected === true && vehicle1.collisionDetected === true ) {

                    continue;

                }


                // if ( vehicle1.queueWaiting === true ) {

                //     vehicle1.collisionDetected = true;

                // } else {

                //     vehicle1.collisionDetected = false;

                // }

                // if ( vehicle0.queueWaiting === true || vehicle1.queueWaiting === true ) {

                //     continue;

                // }

                //continue;

                if ( this._getControlPointsMatch( vehicle0, vehicle1 ) === false ) {

                    continue;

                }

                //continue;

                // if ( vehicle0.queueWaiting === true ) {

                //     vehicle0.collisionDetected = true;

                // }

                // return;

                //const test = Tools.getPointByPosition( this._graphsManager.graphs[ 0 ], vehicle0.checkPoint0 );
                //const test = GraphsManager.getPointByPosition( this._graphsManager.graphs[ 0 ], vehicle0.checkPoint0 );

                //const test = this._graphsManager.getPointInLookupById( 0, GraphsManager.getLookupPointId( vehicle0.checkPoint0 ) );

                //console.log( test.neighbourPoints.length );


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
                    // if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS * CollisionDetection.COLLISION_DISTANCE ) === true ) {
                    if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS + 15 ) === true ) {
                    // if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS * 3 ) === true ) {
                    // if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS * 4 ) === true ) {//* 4 for testing

                        // vehicle0.collisionDetected = true;
                        // vehicle1.collisionDetected = true;

                        const angleFront00 = vehicle0.angle + Settings.MATH_PI_050;
                        const angleFront11 = vehicle1.angle + Settings.MATH_PI_050;

                        const sinFront0 = Math.sin( angleFront00 );
                        const cosFront0 = Math.cos( angleFront00 );
                        const sinFront1 = Math.sin( angleFront11 );
                        const cosFront1 = Math.cos( angleFront11 );
    
                        const pxFront0 = sinFront0 * Vehicles.VEHICLE_RADIUS + vehicle0.position.x;
                        const pyFront0 = -cosFront0 * Vehicles.VEHICLE_RADIUS + vehicle0.position.y;
                        const pxFront1 = sinFront1 * Vehicles.VEHICLE_RADIUS + vehicle1.position.x;
                        const pyFront1 = -cosFront1 * Vehicles.VEHICLE_RADIUS + vehicle1.position.y;

                        let collision0 = false;
                        let collision1 = false;

                        if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, pxFront0, pyFront0, Vehicles.VEHICLE_RADIUS ) === true ) {

                            vehicle0.collisionDetected = true;

                            collision0 = true;

                        }

                        if ( Tools.isPositionInCircle( vehicle0.position.x, vehicle0.position.y, pxFront1, pyFront1, Vehicles.VEHICLE_RADIUS ) === true ) {

                            vehicle1.collisionDetected = true;
                            
                            collision1 = true;

                        }

                        if ( collision0 === true && collision1 === true ) {

                            if ( vehicle0.routeIndex === vehicle1.routeIndex ) {

                                if ( vehicle0.checkPoint0.x !== vehicle1.checkPoint0.x && vehicle0.checkPoint0.y !== vehicle1.checkPoint0.y ) {

                                    vehicle0.collisionDetected = false;
                                    vehicle1.collisionDetected = false;

                                }

                            }

                        }





                        
                        continue;
                    
                        // const radius = Vehicles.VEHICLE_RADIUS * 2;

                        // const ang01 = Math.atan2( vehicle1.position.y - vehicle0.position.y, vehicle1.position.x - vehicle0.position.x ) + Settings.MATH_PI_050;
                        // const ang10 = Math.atan2( vehicle0.position.y - vehicle1.position.y, vehicle0.position.x - vehicle1.position.x ) + Settings.MATH_PI_050;

                        // const sinLeft = Math.sin( ang01 );
                        // const cosLeft = Math.cos( ang01 );
                        // const sinRight = Math.sin( ang10 );
                        // const cosRight = Math.cos( ang10 );

                        // const pxLeft = sinLeft * radius + vehicle0.position.x;
                        // const pyLeft = -cosLeft * radius + vehicle0.position.y;
                        // const pxRight = sinRight * radius + vehicle0.position.x;
                        // const pyRight = -cosRight * radius + vehicle0.position.y;


                        //continue;

                        // vehicle0.collisionDetected = true;
                        // vehicle1.collisionDetected = true;

                        // if ( vehicle0.t > vehicle1.t ) {

                        //     vehicle0.collisionDetected = false;

                        // }

                        // if ( vehicle1.t > vehicle0.t ) {

                        //     vehicle1.collisionDetected = false;

                        // }

                        // continue;

                        //---

                        /*
                        const radius = Vehicles.VEHICLE_RADIUS * 2;

                        const angleFront = vehicle.angle + Settings.MATH_PI_050;

                        const angleLeft = angleFront - Settings.MATH_PI_025;
                        const angleRight = angleFront + Settings.MATH_PI_025;

                        const sinLeft = Math.sin( angleLeft );
                        const cosLeft = Math.cos( angleLeft );
                        const sinRight = Math.sin( angleRight );
                        const cosRight = Math.cos( angleRight );

                        const pxLeft = sinLeft * radius + vehicle.position.x;
                        const pyLeft = -cosLeft * radius + vehicle.position.y;
                        const pxRight = sinRight * radius + vehicle.position.x;
                        const pyRight = -cosRight * radius + vehicle.position.y;
                        */

                        const angle01 = Math.atan2( vehicle1.position.y - vehicle0.position.y, vehicle1.position.x - vehicle0.position.x ) + Settings.MATH_PI_050;
                        const angle10 = Math.atan2( vehicle0.position.y - vehicle1.position.y, vehicle0.position.x - vehicle1.position.x ) + Settings.MATH_PI_050;

                        // let vehicle0CollisionDetected = false;
                        // let vehicle1CollisionDetected = false;

                        let vehicle00CollisionDetected = false;
                        // let vehicle01CollisionDetected = false;
                        let vehicle10CollisionDetected = false;
                        // let vehicle11CollisionDetected = false;

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


                        // vehicle0.test = {

                        //     angle: angle01,
                        //     angleFront: angleFront0,
                        //     l: angleFront0 - Settings.MATH_PI_015,
                        //     r: angleFront0 + Settings.MATH_PI_015

                        // }

                        // vehicle1.test = {

                        //     angle: angle10,
                        //     angleFront: angleFront1,
                        //     l: angleFront1 - Settings.MATH_PI_015,
                        //     r: angleFront1 + Settings.MATH_PI_015

                        // }

                        //---
                        /*
                        if ( vehicle00CollisionDetected === false || vehicle10CollisionDetected === false ) {

                            //distance um zu prüfen ob sich die vehicles annähern oder entfernen.
                            const distance = Tools.getDistance( vehicle0.position, vehicle1.position );

                            vehicle0.distanceToVehicle = distance;
                            vehicle1.distanceToVehicle = distance;

                        }

                        //---
                        
                        // const a0 = vehicle0.angle + Settings.RIGHT;
                        // const a1 = vehicle1.angle + Settings.RIGHT;

                        //---

                        if ( vehicle00CollisionDetected === false && vehicle10CollisionDetected === false ) {

                            // if ( a0 - Settings.MATH_PI_025 < angle01 && a0 + Settings.MATH_PI_025 > angle01 ) {
                            if ( Tools.isLeft( vehicle0.lastPosition, vehicle0.position, vehicle1.position ) === true && vehicle0.distanceToVehicle < vehicle0.lastDistanceToVehicle ) {

                                // vehicle0CollisionDetected = true;
                                vehicle10CollisionDetected = true;

                            }

                            // if ( a1 - Settings.MATH_PI_025 < angle10 && a1 + Settings.MATH_PI_025 > angle10 ) {
                            if ( Tools.isLeft( vehicle1.lastPosition, vehicle1.position, vehicle0.position ) === true && vehicle1.distanceToVehicle < vehicle1.lastDistanceToVehicle ) {

                                // vehicle1CollisionDetected = true;
                                vehicle11CollisionDetected = true;

                            }

                        }

                        vehicle0.lastDistanceToVehicle = vehicle0.distanceToVehicle;
                        vehicle1.lastDistanceToVehicle = vehicle1.distanceToVehicle;
                        */
                        //---

                        //wenn sich beide fahrzeuge gegenüber stehen darf eins fahren und das andere muss warten
                        /*
                        if ( vehicle00CollisionDetected === true && vehicle01CollisionDetected === false && vehicle10CollisionDetected === true && vehicle11CollisionDetected === false ) {

                            vehicle0.collisionDetected = true;
                            vehicle1.collisionDetected = false;

                            return;

                        }
                        */

                        //wenn beide fahrzeuge auf der rechten seite eine kollision habe dann können sie sich nicht mehr gegenseitig stören 
                        /*
                        if ( vehicle00CollisionDetected === false && vehicle01CollisionDetected === true && vehicle10CollisionDetected === false && vehicle11CollisionDetected === true ) {

                            vehicle0.collisionDetected = false;
                            vehicle1.collisionDetected = false;

                            return;

                        }
                        */

                        //---

                        // if ( vehicle00CollisionDetected === true || vehicle01CollisionDetected === true ) {
                        if ( vehicle00CollisionDetected === true ) {

                            vehicle0.collisionDetected = true;

                        }

                        // if ( vehicle10CollisionDetected === true || vehicle11CollisionDetected === true ) {
                        if ( vehicle10CollisionDetected === true ) {

                            vehicle1.collisionDetected = true;

                        }

                        //---

                        // if ( vehicle0.queueInIntersection === true && vehicle0.queueTimer === 0 ) {

                        //     vehicle0.collisionDetected = false;

                        // }

                        //if ( vehicle0.queueInIntersection === true ) {

                            //vehicle0.collisionDetected = false;

                        //}

                        // if ( vehicle0.queueWaiting === true ) {

                        //     vehicle0.collisionDetected = true;

                        // }

                        // if ( vehicle1.queueWaiting === true ) {

                        //     vehicle1.collisionDetected = true;

                        // }

                    }



                    // if ( Tools.isPositionInCircle( vehicle1.position.x, vehicle1.position.y, vehicle0.position.x, vehicle0.position.y, Vehicles.VEHICLE_RADIUS * 2 * CollisionDetection.COLLISION_DISTANCE ) === true && vehicle0.routeIndex === vehicle1.routeIndex ) {

                    //     if ( vehicle0.t > vehicle1.t ) {

                    //         vehicle1.collisionDetected = true;

                    //     }

                    //     if ( vehicle1.t > vehicle0.t ) {

                    //         vehicle0.collisionDetected = true;

                    //     }

                    // }

                // }

            }

        }

    }

    _getCollisionToVehicle( vehicles, vehicle ) {

        let foundCollision = false;

        for ( let i = 0, l = vehicles.length; i < l; i ++ ) {

            const v = vehicles[ i ];

            if ( vehicle.id !== v.id ) {

                if ( this._getControlPointsMatch( vehicle, v ) === false ) {

                    continue;

                }

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