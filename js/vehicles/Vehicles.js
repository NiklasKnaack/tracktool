class Vehicles {

    static INTERVAL = 750;//2250;//750;//250;//500;//250
    static VEHICLE_IMAGES = 49;
    static VEHICLE_RADIUS = 20;
    static VEHICLE_SPEED = 2.50;//1;//2.50;
    static VEHICLE_FOLLOW_SPEED = 6.5;

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

        // setInterval( () => {

        //     console.log( 'vehicles count: ', this._vehiclesHolder.length );

        // }, 1000 );

    }

    //---

    init() {

        for ( let i = 0, l = Vehicles.VEHICLE_IMAGES; i < l; i ++ ) {

            let fileIndex = ( i + 1 ).toString();

            while ( fileIndex.length < 3 ) { 
                
                fileIndex = '0' + fileIndex; 
            
            };

            const vehicleImage = new Image();

            vehicleImage.crossOrigin = 'anonymous';
            vehicleImage.src = './img/vehicles/car_' + fileIndex + '.png';

            this._vehiclesImageHolder.push( vehicleImage );

        }

        this.update();
        // this.startSimulation();

        this._vehiclesTimer = new AnimationFrameTimer( () => this.addVehicle(), Vehicles.INTERVAL );

    }

    clear() {

        this.stopSimulation();

        this.removeAllVehicles();

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

        //     vehicle.routePositionSegmentsLength = -1;//muss evtl aktualisiert werden wenn sich die route ändert?!
        //     vehicle.checkPointsSwitch = true;        //muss evtl aktualisiert werden wenn sich die route ändert?!

        // }

    }

    updateVehiclesPositions( x, y ) {

        for ( let i = 0, l = this._vehiclesHolder.length; i < l; i ++ ) {

            const vehicle = this._vehiclesHolder[ i ];

            vehicle.position.x += x;
            vehicle.position.y += y;
            // vehicle.followPosition.x += x;
            // vehicle.followPosition.y += y;

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

        //if ( this._vehiclesSimulation === true && this._vehiclesHolder.length < 1 ) {
        if ( this._vehiclesSimulation === true ) {

            for ( let i = 0, l = this._graph.routes.length; i < l; i ++ ) {

                const routeIndex = i;
                const route = this._graph.routes[ routeIndex ];

                if ( route.startPoint === null || route.endPoint === null || route.complete === false || route.graphSegments.length === 0 ) {

                    continue;

                }

                // const routePositionObject = this.getPointAndAngleOnRouteByT( true, 0, route, this._vehiclesInitalLastPosition );
                // //const routePositionObject = this.getPointAndAngleOnRouteByT( 0, route );

                // if ( routePositionObject === null ) {

                //     continue;

                // }

                //const vehicleSpeed = ( 1 / route.length ) * 2.5;
                const vehicleImage = this._vehiclesImageHolder[ Math.floor( Math.random() * this._vehiclesImageHolder.length ) ];
                // const vehicle = this.getVehicleObject( routePositionObject.point, routePositionObject.angle, 0, route, routeIndex, Vehicles.VEHICLE_SPEED, vehicleImage );
                const vehicle = this.getVehicleObject( { x: 0, y: 0 }, 0, 0, route, routeIndex, vehicleImage );

                this._calcVehiclePositionOnRoute( vehicle, route );
                
                //vehicle.position = this.getPositionOnRouteByT( vehicle.t, route );
                
                vehicle.gridCell = this._vehiclesInitalGridCellHolder[ routeIndex ];// this._collisionDetection.getGridCellByPosition( vehicle.position );

                //Fahrzeuge werden nur hinzugefügt wenn sie zu begin keine Kollision aufweisen
                if ( this._collisionDetection.checkCollisionsToVehicle( vehicle ) === false ) {

                    //vehicle.maxSpeed = this.getVehicleSpeed( vehicle, Vehicles.VEHICLE_SPEED );
                    vehicle.speed = 0;//this.getVehicleSpeed( vehicle, vehicle.maxSpeed );
                    vehicle.lastPosition.x = vehicle.position.x;
                    vehicle.lastPosition.y = vehicle.position.y;
                    // vehicle.followPosition.x += vehicle.position.x;
                    // vehicle.followPosition.y += vehicle.position.y;
                    
                    this._calcAngleOnRoute( vehicle );
                
                    //---

                    const vehiclePreviousOnRouteId = route.newestVehicleId;

                    if ( vehiclePreviousOnRouteId !== null ) {

                        //vehicle bekommt das vehicle vor ihm auf seiner route zugewiesen
                        vehicle.previousVehicleOnRoute  = this.getVehicleById( vehiclePreviousOnRouteId );

                    }

                    route.newestVehicleId = vehicle.id;

                    //---

                    this._vehiclesHolder.push( vehicle );

                };

            }

        }

    }

    removeVehiclesByRouteIndex( routeIndex ) {

        for ( let i = 0, l = this._vehiclesHolder.length; i < l; i ++ ) {

            const vehicle = this._vehiclesHolder[ i ];

            if ( vehicle.routeIndex === routeIndex ) {

                vehicle.t = 1;
                
                this._removeVehicleFromQueue( vehicle );

            } else if ( vehicle.routeIndex > routeIndex ) {

                vehicle.routeIndex--;

            }

        }

        this._vehiclesHolder = this._vehiclesHolder.filter( ( v ) => v.t !== 1 );

    }

    //---

    getVehicleObject( position = { x: 0, y: 0 }, angle = 0, t = 0, route = null, routeIndex = 0, image = null ) {

        const vehicle = {

            id: Tools.getUID(),
            position: { x: position.x, y: position.y },
            lastPosition: { x: position.x, y: position.y },
            // followPosition: { x: position.x, y: position.y },
            angle: angle,
            t: t,
            route: route,
            routeIndex: routeIndex,
            // routeSegmentIndex: 0,//speichert den aktuellen array graph segment index vom vehicle auf seiner route
            routePositionSegmentsLength: -1,
            speed: 0,
            // minSpeed: 0,
            // maxSpeed: 0,
            image: image,
            context: this._canvasManager.getContextByName( 'main' ),
            collisionDetected: false,
            gridCell: null,
            // drawTempStuff: [],
            // distanceToVehicle: 0,
            // lastDistanceToVehicle: 0,
            checkPoint0: null,//nur wenn checkPoint0 und/oder checkPoint1 mit einem anderen vehicle übereinstimmen sollte die collision detection greifen
            checkPoint1: null,//nur wenn checkPoint0 und/oder checkPoint1 mit einem anderen vehicle übereinstimmen sollte die collision detection greifen
            checkPointsSwitch: false,
            // collisions: [],
            queueWaiting: false,
            queueTimer: 0,
            queuePoint: null,
            queueIndex: -1,
            queuePrevious: false,
            // only2VehiclesFromSameRoute: false,
            // queueLength: 0,
            // queueInIntersection: false,
            previousVehicleOnRoute: null,//das vorherige fahrzeug auf dieser route,
            halted: false,
            //speedTween: { time: 0, duration: 0, from: 0, to: 0, change: 0, done: true },
            //speedTweenTime: -1,
            //s: 0,

        }

        return vehicle;

    }

    // getVehicleObject( position, angle = 0, t = 0, route = null, routeIndex = 0, maxSpeed = 2.50, image = null ) {

    //     const vehicle = {

    //         id: Tools.getUID(),
    //         position: { x: position.x, y: position.y },
    //         lastPosition: { x: position.x, y: position.y },
    //         angle: angle,
    //         t: t,
    //         route: route,
    //         routeIndex: routeIndex,
    //         speed: 0,
    //         minSpeed: 0,
    //         maxSpeed: maxSpeed,
    //         image: image,
    //         context: this._canvasManager.getContextByName( 'main' ),
    //         collisionDetected: false,
    //         gridCell: null,
    //         drawTempStuff: [],
    //         distanceToVehicle: 0,
    //         lastDistanceToVehicle: 0,
    //         // collisions: [],

    //     }

    //     return vehicle;

    // }

    // accelerateVehicleSpeed( vehicle, from = 0, to = 0 ) {

    //     // if ( vehicle.speed >= vehicle.maxSpeed ) {

    //     //     console.log('TWEEN END');

    //     //     vehicle.speedTween.done = true;

    //     //     return vehicle.maxSpeed;

    //     // }

    //     //speedTween: { time: 0, duration: 0, increment: 0, from: 0, to: 0, change: 0, easing: Easing.outCubic, done: true },

    //     //if ( vehicle.speedTween.done === true && vehicle.speed < vehicle.maxSpeed ) {
    //     if ( vehicle.speedTween.done === true && vehicle.speed < vehicle.maxSpeed ) {

            

    //         vehicle.speedTween.done = false;
    //         vehicle.speedTween.duration = 0.5;
    //         //vehicle.speedTween.increment = vehicle.speedTween.duration / 100;
    //         vehicle.speedTween.from = from;
    //         vehicle.speedTween.to = to;
    //         vehicle.speedTween.change = to - from;
    //         vehicle.speedTween.time = 0;

    //         //vehicle.speedTweenTime = 0;

    //         //if ( vehicle.id === 1 ) 
    //         //console.log( 'TWEEN INIT: ', vehicle.speed, vehicle.maxSpeed, ' --- ',vehicle.speedTween.from, vehicle.speedTween.to, vehicle.speedTween.change);

    //     }

    //     /*
    //     var animationTime = -1;
    //     var animationTimeSpeed = 0.0166666666666667;
    //     */

    //     //vehicle.speedTweenTime += 0.0166666666666667;


    //     //vehicle.speedTween.time = vehicle.speedTweenTime;
    //     //vehicle.speedTween.time += vehicle.speedTween.increment;
    //     //vehicle.speedTween.time += 0.0166666666666667;
    //     vehicle.speedTween.time += 0.01;

    //     //console.log( vehicle.speedTween.time, vehicle.speedTween.duration );

    //     //if ( vehicle.id === 0 ) console.log('vehicle.speedTween.time: ', vehicle.speedTween.time);

    //     //if ( vehicle.speedTween.from !== vehicle.speedTween.to && vehicle.speedTween.done === false ) {
    //     if ( vehicle.speedTween.time <= vehicle.speedTween.duration ) {
    //         //if ( vehicle.id === 0 ) console.log('vehicle.speedTween.time: ', vehicle.speedTween.time);

    //         const s = Easing.inQuad( vehicle.speedTween.time, vehicle.speedTween.from, vehicle.speedTween.change, vehicle.speedTween.duration );

    //         //console.log( vehicle.speedTween.time, vehicle.speedTween.duration, s );
    //         return s;

    //     } else {

    //         //if ( vehicle.id === 1 ) 
    //         //console.log( 'END' );

    //         vehicle.speedTween.done = true

    //         //----

    //         return Vehicles.VEHICLE_SPEED;

    //     }

    //     //     vehicle.speedTween.done = true;

    //     //     return vehicle.maxSpeed;

    //     // }

    //     // vehicle.s = Easing.outCubic( vehicle.speedTween.time, vehicle.speedTween.from, vehicle.speedTween.change, vehicle.speedTween.duration );

    // }

    // decelerateVehicleSpeed( vehicle ) {

        

    // }

    getVehicleSpeed( vehicle, speed ) {

        return ( 1 / vehicle.route.length ) * speed;

    }

    //---

    simulate() {

        this._collisionDetection.clearGridCells();
        // this._collisionDetection.clearCollisions();

        //---

        for ( let i = 0, l = this._vehiclesHolder.length; i < l; i ++ ) {

            const vehicle = this._vehiclesHolder[ i ];

            if ( this._vehiclesSimulation === true && vehicle.speed > 0 ) { 

                vehicle.lastPosition.x = vehicle.position.x;
                vehicle.lastPosition.y = vehicle.position.y;

                const route = this._graph.routes[ vehicle.routeIndex ];

                // const routePositionObject = this.getPointAndAngleOnRouteByT( vehicle.gridCell.visible, vehicle.t, route, vehicle.lastPosition );
                // //const routePositionObject = this.getPointAndAngleOnRouteByT( vehicle.t, vehicle.route, vehicle.lastPosition );
                // //const routePositionObject = this.getPointAndAngleOnRouteByT( vehicle.t, vehicle.route );
                
                // vehicle.position = routePositionObject.point;
                // vehicle.angle = routePositionObject.angle;

                this._calcVehiclePositionOnRoute( vehicle, route );// vehicle.route könnte auch eine Option sein?!
                this._calcAngleOnRoute( vehicle );

                //---

                if ( vehicle.route.complete === true && this._vehiclesSimulation === true ) {

                    vehicle.t += vehicle.speed;

                    if ( vehicle.t > 1 ) {

                        vehicle.t = 1;

                    }

                }

            }

            if ( vehicle.previousVehicleOnRoute !== null ) {

                if ( vehicle.previousVehicleOnRoute.t === 1 ) {

                    vehicle.previousVehicleOnRoute = null;

                }

            }

            //---

            if ( this._collisionDetection.isPositionInGridCell( vehicle.position, vehicle.gridCell ) === true ) {

                vehicle.gridCell.vehicles.push( vehicle );

            } else {

                vehicle.gridCell = this._collisionDetection.getNeighborGridCellByPosition( vehicle.position, vehicle.gridCell );

                if ( vehicle.gridCell === null ) {

                    vehicle.gridCell = this._collisionDetection.getGridCellByPosition( vehicle.position );

                }

                vehicle.gridCell.vehicles.push( vehicle );

            }

            //---

            // vehicle.followPosition.x += ( vehicle.position.x - vehicle.followPosition.x ) / Vehicles.VEHICLE_FOLLOW_SPEED;
            // vehicle.followPosition.y += ( vehicle.position.y - vehicle.followPosition.y ) / Vehicles.VEHICLE_FOLLOW_SPEED;

            //---

            //const radius = Vehicles.VEHICLE_RADIUS;

            //only draw vehicles that are visible in the viewport
            //if ( vehicle.position.x + radius > this._border.left && vehicle.position.x - radius < this._border.right && vehicle.position.y + radius > this._border.top && vehicle.position.y - radius < this._border.bottom ) {
            if ( vehicle.gridCell.visible === true ) {//beide if bedingungen funktionieren. performance frage? bisher keinen unterschied festgestellt

                const radius = Vehicles.VEHICLE_RADIUS;

                const angleOnRoute = vehicle.angle + this._vehiclesAngle;
                //const angleOnRoute = Math.atan2( vehicle.followPosition.y - vehicle.position.y, vehicle.followPosition.x - vehicle.position.x ) + Settings.DIR_TOP;
                //const angleOnRoute = vehicle.speed === 0 ? vehicle.angle + this._vehiclesAngle : Math.atan2( vehicle.followPosition.y - vehicle.position.y, vehicle.followPosition.x - vehicle.position.x ) + Settings.DIR_TOP;

                const imagePosition = -radius / 2;

                //vehicle.context.globalAlpha = 0.15;
                vehicle.context.save();
                vehicle.context.translate( vehicle.position.x, vehicle.position.y );
                // vehicle.context.translate( vehicle.followPosition.x, vehicle.followPosition.y );
                vehicle.context.rotate( angleOnRoute );
                vehicle.context.drawImage( vehicle.image, imagePosition, imagePosition, radius, radius );
                vehicle.context.rotate( -angleOnRoute );
                vehicle.context.translate( -vehicle.position.x, -vehicle.position.y );
                // vehicle.context.translate( -vehicle.followPosition.x, -vehicle.followPosition.y );
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

                this._removeVehicleFromQueue( vehicle );
                
                this._vehiclesHolder.splice( i, 1 );

            }

        }

    }

    //---

    _removeVehicleFromQueue( vehicle ) {

        // falls das vehicle in einer warteschlange steht muss das vehicle auch aus dieser entfernt werden
        if ( vehicle.queuePoint !== null ) {

            if ( vehicle.queuePoint.vehiclesWaiting.length > 0 ) {

                if ( vehicle.queuePoint.vehiclesWaiting.length === 1 ) {

                    vehicle.queuePoint.vehiclesWaiting.shift();

                } else {

                    vehicle.queuePoint.vehiclesWaiting.splice( vehicle.queuePoint.vehiclesWaiting.findIndex( ( vId ) => vId === vehicle.id ), 1 );

                }

            }

        }

    }

    //---

    _calcVehiclePositionOnRoute( vehicle, route ) {

        const routeLength = route.length;
        const tLength = vehicle.t * routeLength;

        let curLength = 0;
        let lastLength = 0;

        // for ( let i = vehicle.routeSegmentIndex, l = route.graphSegments.length; i < l; i ++ ) {
        for ( let i = 0, l = route.graphSegments.length; i < l; i ++ ) {

            const graphSegment = route.graphSegments[ i ];

            curLength += graphSegment.length;

            if ( tLength <= curLength ) {

                const tGraphSegment = ( tLength - lastLength ) / graphSegment.length;

                vehicle.position = Tools.interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, tGraphSegment );
                // vehicle.checkPoint0 = graphSegment.p1;
                // vehicle.checkPoint1 = i < l - 1 ? route.graphSegments[ i + 1 ].p1 : null;
                // // vehicle.checkPoint0 = graphSegment.p0;
                // // vehicle.checkPoint1 = graphSegment.p1;

                if ( lastLength !== vehicle.routePositionSegmentsLength ) {

                    vehicle.routePositionSegmentsLength = lastLength;

                    vehicle.checkPoint0 = graphSegment.p1;
                    vehicle.checkPoint1 = i < l - 1 ? route.graphSegments[ i + 1 ].p1 : null;
                    // vehicle.checkPoint0 = graphSegment.p0;
                    // vehicle.checkPoint1 = graphSegment.p1;

                    vehicle.checkPointsSwitch = true;
                    // vehicle.routeSegmentIndex = i;
    
                }

                break;

            }

            lastLength = curLength;

        }

    }

    _calcAngleOnRoute( vehicle ) {

        //drehung ist nur wichtig wenn das vehicle sichtbar, also auf einer sichtbaren gridCell unterwegs ist <--- das ist so nicht korrekt. denn angle wird permanent für die collision detection benötigt
        //if ( vehicle.gridCell.visible === true ) {

            // vehicle.angle = Math.atan2( point1.y - point0.y, point1.x - point0.x );
            vehicle.angle = Math.atan2( vehicle.position.y - vehicle.lastPosition.y, vehicle.position.x - vehicle.lastPosition.x );
            // vehicle.angle = Tools.getAtan2Normalized( vehicle.position.y - vehicle.lastPosition.y, vehicle.position.x - vehicle.lastPosition.x );
            
        //} 

    }

    /*
    getPointAndAngleOnRouteByT( visible, t, route, lastPosition ) {

        const output = {

            point: null,
            angle: 0,
            checkPoint0: null,
            checkPoint1: null,

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
                output.checkPoint0 = graphSegment.p1;
                output.checkPoint1 = i < l - 1 ? route.graphSegments[ i + 1 ].p1 : null;
                //output.test = { i: i, l: l - 1 };

                //drehung ist nur wichtig wenn das vehicle sichtbar, also auf einer sichtbaren gridCell unterwegs ist
                if ( visible === true ) {

                    // output.angle = Math.atan2( point1.y - point0.y, point1.x - point0.x );
                    output.angle = Math.atan2( point0.y - lastPosition.y, point0.x - lastPosition.x );
                    // output.angle = Tools.getAtan2Normalized( point0.y - lastPosition.y, point0.x - lastPosition.x );
                    
                } else {

                    output.angle = 0;

                }
                
                break;

            }

            lastLength = curLength;

        }

        //---

        return output;

    }
    */

    //---

    getVehicleByPosition( position ) {

        let result = null;

        for ( let i = 0, l = this._vehiclesHolder.length; i < l; i ++ ) {

            const vehicle = this._vehiclesHolder[ i ];

            if ( Tools.isPositionInCircle( position.x, position.y, vehicle.position.x, vehicle.position.y, Vehicles.VEHICLE_RADIUS ) === true ) {

                result = vehicle;

                break;

            }

        }

        return result;

    }

    getVehicleById( id ) {

        let vehicle = null;

        for ( let i = this._vehiclesHolder.length - 1, l = -1; i > l; i -- ) {

            const v = this._vehiclesHolder[ i ];

            if ( v.id === id ) {

                vehicle = v;

                break;

            }

        }

        return vehicle;

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

                // // falls das vehicle in einer warteschlange steht muss das vehicle auch aus dieser entfernt werden
                // if ( vehicle.queuePoint !== null ) {

                //     if ( vehicle.queuePoint.vehiclesWaiting.length > 0 ) {

                //         vehicle.queuePoint.vehiclesWaiting.splice( vehicle.queuePoint.vehiclesWaiting.findIndex( ( vId ) => vId === vehicle.id ), 1 );

                //     }

                // }

                this._removeVehicleFromQueue( vehicle );
                
                this._vehiclesHolder.splice( i, 1 );

            }

        }

    }

    removeAllVehicles() {

        for ( let i = this._vehiclesHolder.length - 1, l = -1; i > l; i -- ) {

            const v = this._vehiclesHolder[ i ];

            this._removeVehicleFromQueue( v );
            
            this._vehiclesHolder.splice( i, 1 );

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