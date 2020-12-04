class GraphsManager {

    constructor() {

        if ( GraphsManager._instance ) {

            return GraphsManager._instance;

        }

        GraphsManager._instance = this;

        //---

        this._graphsHolder = graphsHolderDefault;

    }

    clear() {

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

    loadGraphs( url, callback ) {

        // const head = document.getElementsByTagName( 'head' )[ 0 ];

        // const script = document.createElement( 'script' );

        // script.type = 'text/javascript';
        // script.src = url;
        // script.onload = callback;

        // head.appendChild( script );

    }

    logGraphs() {

        let output = '';

        output += '[' + '\n';

        this._graphsHolder.forEach( ( graph, index ) => {

            output += '    {' + '\n';
            output += '        id: ' + index + ',\n';
            output += '        routes: [' + '\n';

            for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

                const route = graph.routes[ i ];

                output += '            { startPoint: { x: ' + route.startPoint.x + ', y: ' + route.startPoint.y + ' }, endPoint: { x: ' + route.endPoint.x + ', y: ' + route.endPoint.y + ' }, graphSegments: [], length: 0, complete: false }';

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

                output += '            { x: ' + point.x + ', y: ' + point.y + ', walkable: ' + point.walkable + ', cost: ' + '0' + ', parentPoint: ' + 'null' + ', visited: ' + 'false' + ', neighbourGraphsegments: ' + '[]' + ', neighbourPoints: ' + '[]' + ' }';

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

}