class GraphsManager {

    constructor( graphs = null ) {

        if ( GraphsManager._instance ) {

            return GraphsManager._instance;

        }

        GraphsManager._instance = this;

        //---

        this._pathFinder = new PathFinder();
        this._intersectionFinder = new IntersectionFinder();

        //---

        this._graphsHolder = graphs;

        this._graphIntersectionsLength = 0;

        //---

        this._graphsLookupForPoints = [];

        this.buildLookupForPointsForAllGraphs();

    }

    clear() {

        this.clearLookupForPointsForAllGraphs();

        this._graphsHolder.forEach( ( graph, index ) => {

            graph.routes = [];
            graph.points = [];
            graph.segments = [];
            graph.streetPoints = [];
            graph.streetSegments = [];

        } );

    }

    set graphs( graphsHolder ) {

        this._graphsHolder = graphsHolder;

    }

    get graphs() {

        return this._graphsHolder;

    }

    get graphIntersectionsLength() {

        return this._graphIntersectionsLength;

    }

    // loadGraphs( url, callback ) {

        // const head = document.getElementsByTagName( 'head' )[ 0 ];

        // const script = document.createElement( 'script' );

        // script.type = 'text/javascript';
        // script.src = url;
        // script.onload = callback;

        // head.appendChild( script );

    // }

    logGraphs() {

        let output = '';

        output += '[' + '\n';

        this._graphsHolder.forEach( ( graph, index ) => {

            output += '    {' + '\n';
            output += '        id: ' + index + ',\n';
            output += '        routes: [' + '\n';

            for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

                const route = graph.routes[ i ];

                output += '            { startPoint: { x: ' + route.startPoint.x + ', y: ' + route.startPoint.y + ' }, endPoint: { x: ' + route.endPoint.x + ', y: ' + route.endPoint.y + ' }, graphSegments: [], length: 0, complete: false, color: { r: ' + route.color.r + ', g: ' + route.color.g + ', b: ' + route.color.b + ', a: ' + route.color.a + ' }' + ', newestVehicleId: ' + 'null' + ' }';

                if ( i < l ) {

                    output += ',\n';

                } else {

                    output += '\n';

                }

            }

            output += '        ],' + '\n';

            output += '        streetPoints: ' + '[],' + '\n';
            output += '        streetSegments: ' + '[],' + '\n';

            output += '        points: [' + '\n';

            for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

                const point = graph.points[ i ];

                output += '            { x: ' + point.x + ', y: ' + point.y + ', walkable: ' + point.walkable + ', cost: ' + '0' + ', parentPoint: ' + 'null' + ', visited: ' + 'false' + ', neighbourGraphsegments: ' + '[]' + ', neighbourPoints: ' + '[]' + ', vehiclesWaiting: ' + '[]' + ', vehiclesWaitingRouteIndices: ' + '[]' + ', intersection: ' + 'false' + ' }';

                if ( i < l ) {

                    output += ',\n';

                } else {

                    output += '\n';

                }

            }

            output += '        ],' + '\n';
            output += '        segments: [' + '\n';

            for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

                const graphSegment = graph.segments[ i ];

                output += '            { id: ' + graphSegment.id + ', p0: ' + '{ x: ' + graphSegment.p0.x + ', y: ' + graphSegment.p0.y + ' }' + ', p1: ' + '{ x: ' + graphSegment.p1.x + ', y: ' + graphSegment.p1.y + ' }' + ', walkable: ' +  graphSegment.walkable + ', direction: "' +  graphSegment.direction + '", centerPoint: ' + '{ x: ' + graphSegment.centerPoint.x + ', y: ' + graphSegment.centerPoint.y + ' }' + ', controlPoint: { x: ' + graphSegment.controlPoint.x + ', y: ' + graphSegment.controlPoint.y + ' }, length: ' + graphSegment.length + ' }';

                if ( i < l ) {

                    output += ',\n';

                } else {

                    output += '\n';

                }

            }

            output += '        ]' + '\n';
            output += '    },' + '\n';

        } );

        output += '];';
        output = output.replace( /"/g, "'" );

        return output;

    }

    logGraphsForSavegame() {

        let output = '';

        this._graphsHolder.forEach( ( graph, index ) => {

            output += '            {' + '\n';
            output += '                id: ' + index + ',\n';
            output += '                routes: [' + '\n';

            for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

                const route = graph.routes[ i ];

                output += '                    { startPoint: { x: ' + route.startPoint.x + ', y: ' + route.startPoint.y + ' }, endPoint: { x: ' + route.endPoint.x + ', y: ' + route.endPoint.y + ' }, graphSegments: [], length: 0, complete: false, color: { r: ' + route.color.r + ', g: ' + route.color.g + ', b: ' + route.color.b + ', a: ' + route.color.a + ' }' + ', newestVehicleId: ' + 'null' + ' }';

                if ( i < l ) {

                    output += ',\n';

                } else {

                    output += '\n';

                }

            }

            output += '                ],' + '\n';

            output += '                streetPoints: ' + '[],' + '\n';
            output += '                streetSegments: ' + '[],' + '\n';

            output += '                points: [' + '\n';

            for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

                const point = graph.points[ i ];

                output += '                    { x: ' + point.x + ', y: ' + point.y + ', walkable: ' + point.walkable + ', cost: ' + '0' + ', parentPoint: ' + 'null' + ', visited: ' + 'false' + ', neighbourGraphsegments: ' + '[]' + ', neighbourPoints: ' + '[]' + ', vehiclesWaiting: ' + '[]' + ', vehiclesWaitingRouteIndices: ' + '[]' + ', intersection: ' + 'false' + ' }';

                if ( i < l ) {

                    output += ',\n';

                } else {

                    output += '\n';

                }

            }

            output += '                ],' + '\n';
            output += '                segments: [' + '\n';

            for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

                const graphSegment = graph.segments[ i ];

                output += '                    { id: ' + graphSegment.id + ', p0: ' + '{ x: ' + graphSegment.p0.x + ', y: ' + graphSegment.p0.y + ' }' + ', p1: ' + '{ x: ' + graphSegment.p1.x + ', y: ' + graphSegment.p1.y + ' }' + ', walkable: ' +  graphSegment.walkable + ', direction: "' +  graphSegment.direction + '", centerPoint: ' + '{ x: ' + graphSegment.centerPoint.x + ', y: ' + graphSegment.centerPoint.y + ' }' + ', controlPoint: { x: ' + graphSegment.controlPoint.x + ', y: ' + graphSegment.controlPoint.y + ' }, length: ' + graphSegment.length + ' }';

                if ( i < l ) {

                    output += ',\n';

                } else {

                    output += '\n';

                }

            }

            output += '                ]' + '\n';
            output += '            },';

        } );

        output = output.replace( /"/g, "'" );

        return output;

    }

    //---

    buildLookupForPointsForAllGraphs() {

        this._graphsHolder.forEach( ( graph, index ) => {

            // this.clearLookupForPoints( index );
            this.buildLookupForPoints( index );

        } );

    }

    clearLookupForPointsForAllGraphs() {

        this._graphsHolder.forEach( ( graph, index ) => {

            this.clearLookupForPoints( index );

        } );

    }

    buildLookupForPoints( graphIndex = 0 ) {

        this._graphsLookupForPoints[ graphIndex ] = {};

        const graph = this._graphsHolder[ graphIndex ];
        const lookup = this._graphsLookupForPoints[ graphIndex ];

        for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

            const point = graph.points[ i ];

            lookup[ GraphsManager.getLookupPointId( point ) ] = point;

        }

    }

    updateLookupForPoints( graphIndex = 0, id, point, oldId ) {

        this.addPointForLookupForPoints( graphIndex, id, point );
        this.removePointFromLookupForPoints( graphIndex, oldId );

    }

    addPointForLookupForPoints( graphIndex = 0, id, point ) {

        this._graphsLookupForPoints[ graphIndex ][ id ] = point;

    }

    removePointFromLookupForPoints( graphIndex = 0, id ) {

        delete this._graphsLookupForPoints[ graphIndex ][ id ];

    }

    clearLookupForPoints( graphIndex = 0 ) {

        delete this._graphsLookupForPoints[ graphIndex ];

        this._graphsLookupForPoints[ graphIndex ] = {};

    }

    getPointInLookupById( graphIndex = 0, id ) {

        return this._graphsLookupForPoints[ graphIndex ][ id ];

    }

    static getLookupPointId( point ) {

        return '' + point.x + point.y;

    }

    //---

    computeGraphRoutesAndIntersections( graphIndex = 0, computeRoutes = true, computeIntersections = true, updateLookup = false ) {

        if ( computeRoutes === true ) {
            // console.log( '------------ graphsmanager ------------' );
            // console.log( this._graphsHolder[ graphIndex ].segments[ 14 ] );
            // console.log( this._graphsHolder[ graphIndex ].segments[ 14 ].controlPoint.x, this._graphsHolder[ graphIndex ].segments[ 14 ].controlPoint.y, this._graphsHolder[ graphIndex ].segments[ 14 ].length );
            // console.log( this._graphsHolder[ graphIndex ].routes[ 5 ].graphSegments[ 4 ] );
            // //console.log( this._graphsHolder[ graphIndex ].routes[ 5 ].graphSegments[ 4 ].controlPoint.x, this._graphsHolder[ graphIndex ].routes[ 5 ].graphSegments[ 4 ].controlPoint.y, this._graphsHolder[ graphIndex ].routes[ 5 ].graphSegments[ 4 ].length );
            // console.log( '------------ graphsmanager ------------' );

            this._pathFinder.computeRoutes( this._graphsHolder[ graphIndex ], ( routes, time ) => {

                this._graphsHolder[ graphIndex ].routes = routes;

                console.log( 'Der Aufruf von computeRoutes dauerte ' + time + ' Millisekunden.' );
                
                if ( computeIntersections === true ) {
    
                    this._intersectionFinder.computeIntersections( this._graphsHolder[ graphIndex ], ( points, intersectionsLength, time ) => {
    
                        this._graphsHolder[ graphIndex ].points = points;
                        this._graphIntersectionsLength = intersectionsLength;

                        this.setAllGraphSegmentPointNeighbours( graphIndex );

                        if ( updateLookup === true ) {

                            // vehicles.vehiclesSimulation = false;
                            // vehicles.stopSimulation();
        
                            this.clearLookupForPointsForAllGraphs();
                            this.buildLookupForPointsForAllGraphs();
        
                            // vehicles.vehiclesSimulation = true;
                            // vehicles.startSimulation();

                        }
    
                        console.log( 'Der Aufruf von computeIntersections dauerte ' + time + ' Millisekunden.' );
            
                    } );
    
                }
    
            } );

        }
        
    }

    //---

    setAllGraphSegmentPointNeighbours( graphIndex = 0 ) {

        const graph = this._graphsHolder[ graphIndex ];

        //---

        for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

            const point = graph.points[ i ];

            this.setGraphSegmentPointNeighbours( graphIndex, point );

        }

    }

    setGraphSegmentPointNeighbours( graphIndex = 0, point ) {

        const graph = this._graphsHolder[ graphIndex ];

        //---

        const neighbourGraphSegments = GraphsManager.getNextGraphSegmentsByPoint( point, graph.segments );

        if ( neighbourGraphSegments.length > 0 ) {

            const neighbourPoints = GraphsManager.getNextPointsByPointAndGraphSegments( point, neighbourGraphSegments );

            point.neighbourGraphsegments = neighbourGraphSegments;
            point.neighbourPoints = neighbourPoints;

        }

    }

    // getGraphSegmentByPoints( graphIndex = 0, p0, p1 ) {

    //     const graph = this._graphsHolder[ graphIndex ];

    //     //---

    //     let result = null;

    //     for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

    //         const graphSegment = graph.segments[ i ];

    //         let p0Found = false;
    //         let p1Found = false;

    //         if ( graphSegment.p0.x === p0.x && graphSegment.p0.y === p0.y || graphSegment.p1.x === p0.x && graphSegment.p1.y === p0.y ) {

    //             p0Found = true;

    //         }

    //         if ( graphSegment.p0.x === p1.x && graphSegment.p0.y === p1.y || graphSegment.p1.x === p1.x && graphSegment.p1.y === p1.y ) {

    //             p1Found = true;

    //         }

    //         if ( p0Found === true && p1Found === true ) {

    //             result = graphSegment;

    //         }

    //     }

    //     return result;

    // }

    //---

    static getNextGraphSegmentsByPoint( point, graphSegments ) {

        const graphSegmentsFound = [];

        for ( let i = 0, l = graphSegments.length; i < l; i ++ ) {

            const graphSegment = graphSegments[ i ];

            if ( graphSegment.walkable === true ) {

                if ( point.x === graphSegment.p0.x && point.y === graphSegment.p0.y ) {

                    graphSegmentsFound.push( graphSegment );

                } else if ( point.x === graphSegment.p1.x && point.y === graphSegment.p1.y ) {

                    graphSegmentsFound.push( graphSegment );

                }

            }

        }

        return graphSegmentsFound;

    }

    static getNextPointsByPointAndGraphSegments( point, nextGraphSegments ) {

        const pointsFound = [];

        for ( let i = 0, l = nextGraphSegments.length; i < l; i ++ ) {

            const nextGraphSegment = nextGraphSegments[ i ];

            if ( point.x === nextGraphSegment.p0.x && point.y === nextGraphSegment.p0.y ) {

                if ( nextGraphSegment.direction === '><' || nextGraphSegment.direction === '>' ) {

                    pointsFound.push( nextGraphSegment.p1 );

                }

            } else if ( point.x === nextGraphSegment.p1.x && point.y === nextGraphSegment.p1.y ) {

                if ( nextGraphSegment.direction === '><' || nextGraphSegment.direction === '<' ) {

                    pointsFound.push( nextGraphSegment.p0 );

                }

            }

        }

        return pointsFound;

    }

    static getGraphSegmentPoint( position, walkable = true, cost = 0, parentPoint = null, visited = false, neighbourGraphsegments = [], neighbourPoints = [], vehiclesWaiting = [] ) {

        const point = {

            x: position.x,
            y: position.y,
            walkable: walkable,
            gCost: 0,
            hCost: 0,
            cost: cost,
            parentPoint: parentPoint,
            parentGraphSegment: null,
            visited: visited,
            neighbourGraphsegments: neighbourGraphsegments,
            neighbourPoints: neighbourPoints,
            vehiclesWaiting: vehiclesWaiting,

        };

        return point;

    }

    static getPointByPosition( graph, position ) {

        let point = null;

        for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

            const p = graph.points[ i ];

            if ( p.x === position.x && p.y === position.y ) {

                point = p;

                break;

            }

        }

        return point;

    }

    static getClosestGraphSegmentByAngle( graphSegment, graphSegments ) {

        const graphSegmentAngle = Tools.getAngleInDegrees( GraphsManager.getGraphSegmentAngle( graphSegment ) );

        let currentGraphSegment = graphSegments[ 0 ];
        let difference = 360;

        const deg = ( graphSegmentAngle / 360 > 1 ? graphSegmentAngle - ( Math.floor( graphSegmentAngle / 360 ) * 360 ) : graphSegmentAngle );
        
        for ( let i = 0; i < graphSegments.length; i++ ) {

            const gS = graphSegments[ i ];
            const gSAngle = Tools.getAngleInDegrees( GraphsManager.getGraphSegmentAngle( gS ) );
        
            const diff = Math.min( Math.abs( gSAngle - deg ), 360 - Math.abs( gSAngle - deg ) );

            if ( diff <= difference ) {

                difference = diff;
                currentGraphSegment = gS;

            }

        }
        
        return currentGraphSegment;
        
    }
        
    static getGraphSegmentAngle( graphSegment ) {
        
        return Math.atan2( graphSegment.p1.y - graphSegment.p0.y, graphSegment.p1.y - graphSegment.p0.x ) - Settings.MATH_PI_050;
        
    }

}