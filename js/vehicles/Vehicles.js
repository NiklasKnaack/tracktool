class Vehicles {

    static INTERVAL = 500;
    static VEHICLE_RADIUS = 20;

    //---

    constructor( graphIndex, border ) {

        this._canvasManager = new CanvasManager();
        this._graphsManager = new GraphsManager();
        this._navigator = new Navigator();

        this._graphIndex = graphIndex;
        this._graph = null;
        this._border = border;

        this._vehicleSelected = null;
        this._vehiclesSimulation = true;
        this._vehiclesTimer = null;
        this._vehiclesHolder = [];
        this._vehiclesImageHolder = [];
        // this._vehiclesAngle = Math.PI * 0.50;
        this._vehiclesAngle = Math.PI * -0.50;

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

        // this.updateGraph();
        // this.startSimulation();

    }

    clear() {

        this.stopSimulation();

        this._vehiclesHolder = [];

    }

    //---

    updateGraph() {

        this._graph = this._graphsManager.graphs[ this._graphIndex ];

    }

    // update( x, y ) {

    //     for ( let i = 0, l = this._vehiclesHolder.length; i < l; i ++ ) {

    //         const vehicle = this._vehiclesHolder[ i ];

    //         vehicle.lastPosition.x += x;
    //         vehicle.lastPosition.y += y;

    //     }

    // }

    //---

    startSimulation() {

        this.stopSimulation();

        this._vehiclesTimer = setInterval( this.addVehicle.bind( this ), Vehicles.INTERVAL );

        this.addVehicle();

    }

    stopSimulation() {

        if ( this._vehiclesTimer !== null ) {

            clearInterval( this._vehiclesTimer );

            this._vehiclesTimer = null;

        }

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

                // const routePositionObject = this.getPointAndAngleOnRouteByT( 0, routeIndex, { x: 0, y: 0 } );
                const routePositionObject = this.getPointAndAngleOnRouteByT( 0, routeIndex );

                if ( routePositionObject === null ) {

                    continue;

                }

                const vehicleSpeed = ( 1 / route.length ) * 2.5;
                const vehicleImage = this._vehiclesImageHolder[ Math.floor( Math.random() * this._vehiclesImageHolder.length ) ];
                const vehicle = this.getVehicle( routePositionObject.point, routePositionObject.angle, 0, routeIndex, vehicleSpeed, vehicleImage );

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

    getVehicle( position, angle = 0, t = 0, routeIndex = 0, speed = 0.0015, image = null ) {

        const vehicle = {

            position: { x: position.x, y: position.y },
            lastPosition: { x: position.x, y: position.y },
            angle: angle,
            t: t,
            routeIndex: routeIndex,
            speed: speed,
            image: image,
            context: this._canvasManager.getContextByName( 'main' )

        }

        return vehicle;

    }

    //---

    simulate() {

        for ( let i = 0, l = this._vehiclesHolder.length; i < l; i ++ ) {

            const vehicle = this._vehiclesHolder[ i ];

            // vehicle.lastPosition = { x: 0, y: 0 };//vehicle.position;
            vehicle.lastPosition = vehicle.position;

            const route = this._graph.routes[ vehicle.routeIndex ];
            // const routePositionObject = this.getPointAndAngleOnRouteByT( vehicle.t, vehicle.routeIndex, vehicle.lastPosition );
            const routePositionObject = this.getPointAndAngleOnRouteByT( vehicle.t, vehicle.routeIndex );
            
            vehicle.position = routePositionObject.point;
            vehicle.angle = routePositionObject.angle;

            const radius = Vehicles.VEHICLE_RADIUS;

            //only draw vehicles that are visible in the viewport
            if ( vehicle.position.x + radius > this._border.left && vehicle.position.x - radius < this._border.right && vehicle.position.y + radius > this._border.top && vehicle.position.y - radius < this._border.bottom ) {

                const angleOnRoute = vehicle.angle + this._vehiclesAngle;
                const imagePosition = -radius / 2;

                vehicle.context.save();
                vehicle.context.translate( vehicle.position.x, vehicle.position.y );
                vehicle.context.rotate( angleOnRoute );
                vehicle.context.drawImage( vehicle.image, imagePosition, imagePosition, radius, radius );
                vehicle.context.rotate( -angleOnRoute );
                vehicle.context.translate( -vehicle.position.x, -vehicle.position.y );
                vehicle.context.restore();

            }

            if ( route.complete === true && this._vehiclesSimulation === true ) {

                vehicle.t += vehicle.speed;

                if ( vehicle.t > 1 ) {

                    vehicle.t = 1;

                }

            }

        }

        this._vehiclesHolder = this._vehiclesHolder.filter( ( v ) => v.t !== 1 );

    }

    //---

    getPointAndAngleOnRouteByT( t, routeIndex/*, lastPosition*/ ) {

        const route = this._graph.routes[ routeIndex ];

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
                const point1 = Tools.interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, tGraphSegment + 0.001 );
                //const point1 = lastPosition;

                output.point = point0;
                output.angle = Math.atan2( point0.y - point1.y, point0.x - point1.x );

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

                vehicle.position.x += dx;
                vehicle.position.y += dy;

                // vehicle.position.x = Tools.unifyNumber( vehicle.position.x );
                // vehicle.position.y = Tools.unifyNumber( vehicle.position.y );

                // for ( let i = 0, l = this._vehiclesHolder.length; i < l; i ++ ) {

                //     const v = this._vehiclesHolder[ i ];
        
                //     vehicle.lastPosition.x += dx;
                //     vehicle.lastPosition.y += dy;

                // }

                this._navigator.move( dx, dy );

            }

        }

    }

    stopFollowVehicle() {

        // for ( let i = 0, l = this._vehiclesHolder.length; i < l; i ++ ) {

        //     const vehicle = this._vehiclesHolder[ i ];

        //     // const dx = vehicle.lastPosition.x - vehicle.position.x;
        //     // const dy = vehicle.lastPosition.y - vehicle.position.y;

        //     // vehicle.position.x += dx;
        //     // vehicle.position.y += dy;

        //     vehicle.position.x = 0;
        //     vehicle.position.y = 0;
        //     vehicle.lastPosition.x = vehicle.position.x;
        //     vehicle.lastPosition.y = vehicle.position.y;

        // }

        this._navigator.stop();

    }

    //---

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