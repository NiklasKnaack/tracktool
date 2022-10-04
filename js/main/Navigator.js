class Navigator {

    constructor() {

        if ( Navigator._instance ) {

            return Navigator._instance;

        }

        Navigator._instance = this;
        
        //---

        this._savegameManager = new SavegameManager();
        this._savegamePosition = this._savegameManager.savegame.map.position;

        this._graphsManager = new GraphsManager();
        this._graphs = this._graphsManager.graphs;

        this._background = new Background();

        this._canvasManager = new CanvasManager();

        this._vehicles = new Vehicles();

        this._collisionDetection = new CollisionDetection();

        this._active = false;
        this._positionInit = { x: 0, y: 0 };
        this._positionTarget = { x: 0, y: 0 };
        this._angle = 0;
        this._sin = 0;
        this._cos = 0;
        this._x = 0;
        this._y = 0;
        this._borders = Tools.getFieldLimitationBorders( this._canvasManager.width, this._canvasManager.height, this._savegamePosition );

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

    get position() {

        return { x: this._x, y: this._y };

    }

    updateGraph() {

        this._graphs = this._graphsManager.graphs;

    }

    navigateToInitialPosition() {

        this.move( this._savegamePosition.x - this._x, this._savegamePosition.y - this._y );
        this.stop();

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

    }

    move( dx, dy ) {
        
        const distanceX = this._x + dx;
        const distanceY = this._y + dy;

        if ( distanceX > this._borders.left ) {

            // dx = dx - ( distanceX - this._borders.left );
            dx = -this._x + this._borders.left;//formel optimiert mit https://www.mathepower.com/freistell.php

        }

        if ( distanceX < this._borders.right ) {

            //dx = dx - ( distanceX - this._borders.right );
            dx = -this._x + this._borders.right;//formel optimiert mit https://www.mathepower.com/freistell.php

        }

        if ( distanceY > this._borders.top ) {

            //dy = dy - ( distanceY - this._borders.top );
            dy = -this._y + this._borders.top;//formel optimiert mit https://www.mathepower.com/freistell.php

        }

        if ( distanceY < this._borders.bottom ) {

            //dy = dy - ( distanceY - this._borders.bottom );
            dy = -this._y + this._borders.bottom;//formel optimiert mit https://www.mathepower.com/freistell.php

        }

        //---

        dx = Tools.unifyNumber( dx );//<---- vielleicht nötig um die bewegung zu präzisieren?! Muss getestet werden. Vielleicht behebt das den bug das nach movement einige vehicles stecken bleiben
        dy = Tools.unifyNumber( dy );//<---- vielleicht nötig um die bewegung zu präzisieren?! Muss getestet werden. Vielleicht behebt das den bug das nach movement einige vehicles stecken bleiben

        //---

        this._x += dx;
        this._y += dy;

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

                // const pointOldX = point.x;
                // const pointOldY = point.y;

                point.x += dx;
                point.y += dy;

                // this._graphsManager.updateLookupForPoints( index, GraphsManager.getLookupPointId( point ), point, '' + pointOldX + pointOldY );

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

        this._graphsManager.buildLookupForPointsForAllGraphs();
        // this._graphsManager.buildLookupForPoints( 0 );

        this._vehicles.updateVehiclesPositions( dx, dy );

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

        this._graphsManager.buildLookupForPointsForAllGraphs();

        //---
        //nachdem die bewegung beendet ist gibt es ohne die folgenden aufrufe das problem, dass einige vehicles ab und zu feststecken in einer collision, die es eigentlich nicht mehr gibt

        //this._collisionDetection.clearCollisions();
        // this._collisionDetection.checkIntersections();
        //this._collisionDetection.checkCollisions();

        this._collisionDetection.checkVehiclesCollisionsAfterMovement();

    }

}