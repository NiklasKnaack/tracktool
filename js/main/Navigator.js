class Navigator {

    constructor() {

        if ( Navigator._instance ) {

            return Navigator._instance;

        }

        Navigator._instance = this;
        
        //---

        this._graphsManager = new GraphsManager();
        this._graphs = this._graphsManager.graphs;

        this._background = new Background();

        this._canvasManager = new CanvasManager();

        // this._vehicles = new Vehicles();

        this._collisionDetection = new CollisionDetection();

        this._active = false;
        this._positionInit = { x: 0, y: 0 };
        this._positionTarget = { x: 0, y: 0 };
        this._angle = 0;
        this._sin = 0;
        this._cos = 0;
        this._x = 0;
        this._y = 0;
        this._borders = Tools.getFieldLimitationBorders( this._canvasManager.width, this._canvasManager.height );

    }

    get active() {

        return this._active;

    }

    set active( value ) {

        this._active = value;

    }

    get positionInit() {

        return this._positionInit;

    }

    setPositionInit( x, y ) {

        this._positionInit.x = x;
        this._positionInit.y = y;

    }

    get positionTarget() {

        return this._positionTarget;

    }

    setPositionTarget( x, y ) {

        this._positionTarget.x = x;
        this._positionTarget.y = y;

    }

    get angle() {

        return this._angle;

    }

    get sin() {

        return this._sin;

    }

    get cos() {

        return this._cos;

    }

    updateGraph() {

        this._graphs = this._graphsManager.graphs;

    }

    navigate() {

        if ( this._active === false ) {

            return;

        }

        //---

        const moveDistanceMax = 500;
        const moveDistance = Tools.getDistance( this._positionInit, this._positionTarget ) * 50;
        
        this._angle = Math.atan2( this._positionTarget.y - this._positionInit.y, this._positionTarget.x - this._positionInit.x ) + Settings.DIR_BOTTOM;

        this._sin = Math.sin( this._angle );
        this._cos = Math.cos( this._angle );

        const dx = -this._sin * ( moveDistance / moveDistanceMax );
        const dy = this._cos * ( moveDistance / moveDistanceMax );

        //---

        this.move( dx, dy );

        //---

        //this._vehicles.updateVehiclesPositions( dx, dy );
        //this._vehicles.test( dx, dy );

        //this._background.move( dx, dy );

    }

    move( dx, dy ) {

        this._x += dx;
        this._y += dy;
        
        if ( this._x > this._borders.left ) {

            this._x = this._borders.left;

            dx = 0;

        }

        if ( this._x < this._borders.right ) {

            this._x = this._borders.right;

            dx = 0;

        }

        if ( this._y > this._borders.top ) {

            this._y = this._borders.top;

            dy = 0;

        }

        if ( this._y < this._borders.bottom ) {

            this._y = this._borders.bottom;

            dy = 0;

        }

        // console.log( this._x, this._y );

        //---
        
        this._graphs.forEach( ( graph, index ) => {

            for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

                const graphSegment = graph.segments[ i ];

                graphSegment.p0.x += dx;
                graphSegment.p0.y += dy;
                graphSegment.p1.x += dx;
                graphSegment.p1.y += dy;
                graphSegment.centerPoint.x += dx;
                graphSegment.centerPoint.y += dy;
                graphSegment.controlPoint.x += dx;
                graphSegment.controlPoint.y += dy;

            }

            for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

                const point = graph.points[ i ];

                point.x += dx;
                point.y += dy;

            }

            for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

                const route = graph.routes[ i ];

                if ( route.startPoint !== null ) {

                    route.startPoint.x += dx;
                    route.startPoint.y += dy;

                }

                if ( route.endPoint !== null ) {
            
                    route.endPoint.x += dx;
                    route.endPoint.y += dy;

                }

                if ( route.graphSegments.length > 0 ) {

                    for ( let j = 0, m = route.graphSegments.length; j < m; j ++ ) {

                        const graphSegment = route.graphSegments[ j ];

                        graphSegment.p0.x += dx;
                        graphSegment.p0.y += dy;
                        graphSegment.p1.x += dx;
                        graphSegment.p1.y += dy;
                        graphSegment.controlPoint.x += dx;
                        graphSegment.controlPoint.y += dy;

                    }

                }

            }

            // for ( let i = 0, l = graph.streetSegments.length; i < l; i ++ ) {

            //     const streetSegment = graph.streetSegments[ i ];

            //     //---

            // }

        } );

        //---

        //this._vehicles.updateVehiclesPositions( dx, dy );
        //this._vehicles.test( dx, dy );

        this._background.move( dx, dy );

        this._collisionDetection.moveGrid( dx, dy );

    }

    stop() {

        this._graphs.forEach( ( graph, index ) => {

            for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

                const graphSegment = graph.segments[ i ];

                graphSegment.p0.x = Tools.unifyNumber( graphSegment.p0.x );
                graphSegment.p0.y = Tools.unifyNumber( graphSegment.p0.y );
                graphSegment.p1.x = Tools.unifyNumber( graphSegment.p1.x );
                graphSegment.p1.y = Tools.unifyNumber( graphSegment.p1.y );
                graphSegment.centerPoint.x = Tools.unifyNumber( graphSegment.centerPoint.x );
                graphSegment.centerPoint.y = Tools.unifyNumber( graphSegment.centerPoint.y );
                graphSegment.controlPoint.x = Tools.unifyNumber( graphSegment.controlPoint.x );
                graphSegment.controlPoint.y = Tools.unifyNumber( graphSegment.controlPoint.y );

            }

            for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

                const point = graph.points[ i ];

                point.x = Tools.unifyNumber( point.x );
                point.y = Tools.unifyNumber( point.y );

            }

            for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

                const route = graph.routes[ i ];

                if ( route.startPoint !== null ) {

                    route.startPoint.x = Tools.unifyNumber( route.startPoint.x );
                    route.startPoint.y = Tools.unifyNumber( route.startPoint.y );

                }

                if ( route.endPoint !== null ) {

                    route.endPoint.x = Tools.unifyNumber( route.endPoint.x );
                    route.endPoint.y = Tools.unifyNumber( route.endPoint.y );

                }

                if ( route.graphSegments.length > 0 ) {

                    for ( let j = 0, m = route.graphSegments.length; j < m; j ++ ) {

                        const graphSegment = route.graphSegments[ j ];

                        graphSegment.p0.x = Tools.unifyNumber( graphSegment.p0.x );
                        graphSegment.p0.y = Tools.unifyNumber( graphSegment.p0.y );
                        graphSegment.p1.x = Tools.unifyNumber( graphSegment.p1.x );
                        graphSegment.p1.y = Tools.unifyNumber( graphSegment.p1.y );
                        graphSegment.controlPoint.x = Tools.unifyNumber( graphSegment.controlPoint.x );
                        graphSegment.controlPoint.y = Tools.unifyNumber( graphSegment.controlPoint.y );

                    }

                }

            }

            // for ( let i = 0, l = graph.streetSegments.length; i < l; i ++ ) {

            //     const streetSegment = graph.streetSegments[ i ];

            //     //---

            // }

        } );

    }

}