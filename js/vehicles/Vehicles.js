class Vehicles {

    static INTERVAL = 500;//250;//500;//250
    static VEHICLE_RADIUS = 20;

    //---

    constructor( graphIndex, border ) {

        if ( Vehicles._instance ) {

            return Vehicles._instance;

        }

        Vehicles._instance = this;
        
        //---

        this._canvasManager = new CanvasManager();
        this._graphsManager = new GraphsManager();
        this._navigator = new Navigator();
        this._collisionDetection = new CollisionDetection();

        this._graphIndex = graphIndex;
        this._graph = this._graphsManager.graphs[ this._graphIndex ];
        this._border = border;

        this._vehicleSelected = null;
        this._vehiclesSimulation = true;
        this._vehiclesTimer = null;
        this._vehiclesHolder = [];
        this._vehiclesImageHolder = [];
        this._vehiclesInitalGridCellHolder = [];
        this._vehiclesAngle = Settings.DIR_BOTTOM;
        this._vehiclesInitalLastPosition = { x: 0, y: 0 };

        this.init();

    }

    //---

    init() {

        for ( let i = 0, l = 40; i < l; i ++ ) {

            let fileIndex = ( i + 1 ).toString();

            while ( fileIndex.length < 3 ) { 
                
                fileIndex = '0' + fileIndex; 
            
            };

            const vehicleImage = new Image();

            vehicleImage.crossOrigin = 'anonymous';
            vehicleImage.src = './img/car_' + fileIndex + '.png';

            this._vehiclesImageHolder.push( vehicleImage );

        }

        this.update();
        // this.startSimulation();

        this._vehiclesTimer = new AnimationFrameTimer( () => this.addVehicle(), Vehicles.INTERVAL );

    }

    clear() {

        this.stopSimulation();

        this._vehiclesHolder = [];

    }

    //---

    update() {

        //man könnte die beiden parts dieser method evtl separieren. es ist eigentlich nur beim laden neuer maps nötig den graph zu aktualisieren.

        this._graph = this._graphsManager.graphs[ this._graphIndex ];

        //---

        this._vehiclesInitalGridCellHolder = [];

        for ( let i = 0, l = this._graph.routes.length; i < l; i ++ ) {

            const routeIndex = i;
            const route = this._graph.routes[ routeIndex ];

            if ( route.startPoint === null ) {

                continue;

            }

            this._vehiclesInitalGridCellHolder.push( this._collisionDetection.getGridCellByPosition( route.startPoint ) );

        }

        //---

        // for ( let i = 0, l = this._vehiclesHolder.length; i < l; i ++ ) {

        //     const vehicle = this._vehiclesHolder[ i ];

        //     vehicle.route = this._graph.routes[ vehicle.routeIndex ]

        // }

    }

    updateVehiclesPositions( x, y ) {

        for ( let i = 0, l = this._vehiclesHolder.length; i < l; i ++ ) {

            const vehicle = this._vehiclesHolder[ i ];

            vehicle.position.x += x;
            vehicle.position.y += y;

        }

    }

    //---

    startSimulation() {

        //this.stopSimulation();

        //this._vehiclesTimer = setInterval( this.addVehicle.bind( this ), Vehicles.INTERVAL );
        //this._vehiclesTimer = new AnimationFrameTimer( () => this.addVehicle(), Vehicles.INTERVAL );

        //this._vehiclesTimer = new AnimationFrameTimer( () => this.addVehicle(), Vehicles.INTERVAL );

        this._vehiclesTimer.start();

        //this.addVehicle();

    }

    stopSimulation() {

        // if ( this._vehiclesTimer !== null ) {

            //clearInterval( this._vehiclesTimer );

            // this._vehiclesTimer = null;

            // this._vehiclesTimer = null;

        //}

        this._vehiclesTimer.stop();

    }

    //---

    addVehicle() {

        if ( this._vehiclesSimulation === true ) {

            for ( let i = 0, l = this._graph.routes.length; i < l; i ++ ) {

                const routeIndex = i;
                const route = this._graph.routes[ routeIndex ];

                if ( route.startPoint === null || route.endPoint === null || route.complete === false || route.graphSegments.length === 0 ) {

                    continue;

                }

                const routePositionObject = this.getPointAndAngleOnRouteByT( 0, route, this._vehiclesInitalLastPosition );
                //const routePositionObject = this.getPointAndAngleOnRouteByT( 0, route );

                if ( routePositionObject === null ) {

                    continue;

                }

                //const vehicleSpeed = ( 1 / route.length ) * 2.5;
                const vehicleImage = this._vehiclesImageHolder[ Math.floor( Math.random() * this._vehiclesImageHolder.length ) ];
                const vehicle = this.getVehicleObject( routePositionObject.point, routePositionObject.angle, 0, route, routeIndex, 2.5, vehicleImage );

                vehicle.speed = this.getVehicleSpeed( vehicle, vehicle.maxSpeed );
                vehicle.gridCell = this._vehiclesInitalGridCellHolder[ routeIndex ];// this._collisionDetection.getGridCellByPosition( vehicle.position );

                this._vehiclesHolder.push( vehicle );

            }

        }

    }

    removeVehiclesByRouteIndex( routeIndex ) {

        for ( let i = 0, l = this._vehiclesHolder.length; i < l; i ++ ) {

            const vehicle = this._vehiclesHolder[ i ];

            if ( vehicle.routeIndex === routeIndex ) {

                vehicle.t = 1;

            } else if ( vehicle.routeIndex > routeIndex ) {

                vehicle.routeIndex--;

            }

        }

        this._vehiclesHolder = this._vehiclesHolder.filter( ( v ) => v.t !== 1 );

    }

    //---

    getVehicleObject( position, angle = 0, t = 0, route = null, routeIndex = 0, maxSpeed = 2.50, image = null ) {

        const vehicle = {

            id: Tools.getUID(),
            position: { x: position.x, y: position.y },
            lastPosition: { x: position.x, y: position.y },
            angle: angle,
            t: t,
            route: route,
            routeIndex: routeIndex,
            speed: 0,
            minSpeed: 0,
            maxSpeed: maxSpeed,
            image: image,
            context: this._canvasManager.getContextByName( 'main' ),
            collisionDetected: false,
            gridCell: null

        }

        return vehicle;

    }

    getVehicleSpeed( vehicle, speed ) {

        return ( 1 / vehicle.route.length ) * speed;

    }

    //---

    simulate() {

        this._collisionDetection.clearGridCells();

        //---

        for ( let i = 0, l = this._vehiclesHolder.length; i < l; i ++ ) {

            const vehicle = this._vehiclesHolder[ i ];

            if ( this._vehiclesSimulation === true ) { 

                // if ( this._vehiclesSimulation === true ) {

                    vehicle.lastPosition = vehicle.position;
                    // vehicle.lastPosition = { x: vehicle.position.x, y: vehicle.position.y };

                // } /*else {

                    // vehicle.lastPosition = Tools.interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, tGraphSegment + 0.001 );
                    //vehicle.lastPosition = this.getPointAndAngleOnRouteByT( vehicle.t, vehicle.route, vehicle.lastPosition );

                //}*/

                const route = this._graph.routes[ vehicle.routeIndex ];
                const routePositionObject = this.getPointAndAngleOnRouteByT( vehicle.t, route, vehicle.lastPosition );
                //const routePositionObject = this.getPointAndAngleOnRouteByT( vehicle.t, vehicle.route, vehicle.lastPosition );
                //const routePositionObject = this.getPointAndAngleOnRouteByT( vehicle.t, vehicle.route );
                
                vehicle.position = routePositionObject.point;
                vehicle.angle = routePositionObject.angle;

                //---

                

                //console.log( this._collisionDetection.isPositionInGridCell( vehicle.position, vehicle.gridCell ) );

                // const gridCell = this._collisionDetection.getGridCellByPosition( vehicle.position );

                // if ( gridCell !== null ) {

                //     gridCell.vehicles.push( vehicle );

                // }

                

                // this._collisionDetection.addVehicleToGrid( vehicle );

                //---

                if ( vehicle.route.complete === true && this._vehiclesSimulation === true ) {

                    vehicle.t += vehicle.speed;

                    if ( vehicle.t > 1 ) {

                        vehicle.t = 1;

                    }

                }

            }

            //---

            //if ( vehicle.gridCell !== null ) { 

                if ( this._collisionDetection.isPositionInGridCell( vehicle.position, vehicle.gridCell ) === true ) {

                    vehicle.gridCell.vehicles.push( vehicle );

                } else {

                    vehicle.gridCell = this._collisionDetection.getNeighborGridCellByPosition( vehicle.position, vehicle.gridCell );
                    vehicle.gridCell.vehicles.push( vehicle );

                }

            //}

            //---

            const radius = Vehicles.VEHICLE_RADIUS;

            //only draw vehicles that are visible in the viewport
            if ( vehicle.position.x + radius > this._border.left && vehicle.position.x - radius < this._border.right && vehicle.position.y + radius > this._border.top && vehicle.position.y - radius < this._border.bottom ) {

                const angleOnRoute = vehicle.angle + this._vehiclesAngle;
                const imagePosition = -radius / 2;

                //vehicle.context.globalAlpha = 0.15;
                vehicle.context.save();
                vehicle.context.translate( vehicle.position.x, vehicle.position.y );
                vehicle.context.rotate( angleOnRoute );
                vehicle.context.drawImage( vehicle.image, imagePosition, imagePosition, radius, radius );
                vehicle.context.rotate( -angleOnRoute );
                vehicle.context.translate( -vehicle.position.x, -vehicle.position.y );
                vehicle.context.restore();

            }

        }

        //---

        //this._vehiclesHolder = this._vehiclesHolder.filter( ( v ) => v.t !== 1 );

        this._removeFinishedVehicles();

    }

    _removeFinishedVehicles() {

        for ( let i = this._vehiclesHolder.length - 1, l = -1; i > l; i -- ) {

            const vehicle = this._vehiclesHolder[ i ];

            if ( vehicle.t >= 1 ) {
                
                this._vehiclesHolder.splice( i, 1 );

            }

        }

    }

    //---

    getPointAndAngleOnRouteByT( t, route, lastPosition ) {

        const output = {

            point: null,
            angle: 0

        };

        const routeLength = route.length;
        const tLength = t * routeLength;

        let curLength = 0;
        let lastLength = 0;

        for ( let i = 0, l = route.graphSegments.length; i < l; i ++ ) {

            const graphSegment = route.graphSegments[ i ];

            curLength += graphSegment.length;

            if ( tLength <= curLength ) {

                const tGraphSegment = ( tLength - lastLength ) / graphSegment.length;

                const point0 = Tools.interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, tGraphSegment );
                // const point1 = Tools.interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, tGraphSegment + 0.001 );
                // const point1 = lastPosition;

                output.point = point0;
                // output.angle = Math.atan2( point1.y - point0.y, point1.x - point0.x );
                output.angle = Math.atan2( point0.y - lastPosition.y, point0.x - lastPosition.x );

                break;

            }

            lastLength = curLength;

        }

        //---

        return output;

    }

    //---

    getVehicleByPosition( position ) {

        let result = null;

        for ( let i = 0, l = this._vehiclesHolder.length; i < l; i ++ ) {

            const vehicle = this._vehiclesHolder[ i ];

            if ( Tools.positionInCircle( position.x, position.y, vehicle.position.x, vehicle.position.y, Vehicles.VEHICLE_RADIUS ) === true ) {

                result = vehicle;

                break;

            }

        }

        return result;

    }

    //---

    followVehicle( vehicle ) {

        if ( vehicle !== null ) {

            if ( vehicle.t < 1 ) {

                const dx = vehicle.lastPosition.x - vehicle.position.x;
                const dy = vehicle.lastPosition.y - vehicle.position.y;

                //vehicle.position.x += dx;
                //vehicle.position.y += dy;

                this._navigator.move( dx, dy );

            }

        }

    }

    stopFollowVehicle() {

        this._navigator.stop();

    }

    //---

    removeVehicle( vehicle ) {

        for ( let i = this._vehiclesHolder.length - 1, l = -1; i > l; i -- ) {

            const v = this._vehiclesHolder[ i ];

            if ( v.id === vehicle.id ) {
                
                this._vehiclesHolder.splice( i, 1 );

            }

        }

    }

    //---

    get vehiclesTimer() {

        return this._vehiclesTimer;

    }

    get allVehicles() {

        return this._vehiclesHolder;

    }

    get vehiclesSimulation() {

        return this._vehiclesSimulation;

    }

    set vehiclesSimulation( value ) {

        this._vehiclesSimulation = value;

    }

    get vehicleSelected() {

        return this._vehicleSelected;

    }

    set vehicleSelected( value ) {

        this._vehicleSelected = value;

    }

}