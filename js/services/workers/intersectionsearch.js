this.addEventListener( 'message', init, false );

//---

let graph = null;

//---

function init( event ) {

    graph = event.data;

    if ( graph.hasOwnProperty( 'routes' ) === false || graph.hasOwnProperty( 'points' ) === false ) {

        return;

    }

    if ( graph.routes.length === 0 || graph.points.length < 2 ) {

        return;

    }

    //---

    let graphSegmentsPoints = [];
    let graphSegmentsPointsIntersecting = [];
    let graphSegmentsPointsIntersections = 0;

    for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

        const route = graph.routes[ i ];

        if ( route.graphSegments.length > 0 ) {

            graphSegmentsPoints.push( ...getGraphSegmentsPoints( route.graphSegments ) );

        }

    }


    //diese variante ist minimal schneller
    //graphSegmentsPointsIntersecting = getDuplicates( graphSegmentsPoints );

    for ( let i = 0, l = graphSegmentsPoints.length; i < l; i ++ ) {

        const p0 = graphSegmentsPoints[ i ];

        //for ( let j = 0, m = graphSegmentsPoints.length; j < m; j ++ ) {
        for ( let j = i + 1, m = graphSegmentsPoints.length; j < m; j ++ ) {   

            const p1 = graphSegmentsPoints[ j ];

            //if ( i !== j ) {

                if ( p0.x === p1.x && p0.y === p1.y ) {

                    if ( isPointInArray( graphSegmentsPointsIntersecting, p0 ) === false ) {

                        graphSegmentsPointsIntersecting.push( p0 );

                    }

                }

            //}

        }

    }

    graphSegmentsPointsIntersections = graphSegmentsPointsIntersecting.length;
    
    // console.log( '------------------------------------------' );
    // console.log( 'Found intersections: ', graphSegmentsPointsIntersecting.length );
    // for ( let j = graphSegmentsPointsIntersecting.length - 1, m = -1; j > m; j -- ) {

    //     console.log( 'Point intersection: ', graphSegmentsPointsIntersecting[ j ].x , graphSegmentsPointsIntersecting[ j ].y );
    // }
    // console.log( '------------------------------------------' );

    //---

    for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

        const point = graph.points[ i ];

        point.vehiclesWaiting = [];
        point.intersection = false;

        for ( let j = graphSegmentsPointsIntersecting.length - 1, m = -1; j > m; j -- ) {

            const pointIntersection = graphSegmentsPointsIntersecting[ j ];

            if ( point.x === pointIntersection.x && point.y === pointIntersection.y && point.neighbourPoints.length > 2 ) {

                point.intersection = true;

                graphSegmentsPointsIntersecting.splice( j, 1 );

                continue;

            }

        }

        if ( graphSegmentsPointsIntersecting.length === 0 ) {

            break;

        }

    }

    //---

    postMessage( { points: graph.points, intersectionsLength: graphSegmentsPointsIntersections } );

}

function getGraphSegmentsPoints( graphSegments ) {

    const graphSegmentsPoints = [];

    for ( let i = 0, l = graphSegments.length; i < l; i ++ ) {

        const graphSegment = graphSegments[ i ];

        graphSegmentsPoints.push( graphSegment.p0 );

        if ( i === l - 1 ) {

            graphSegmentsPoints.push( graphSegment.p1 );

        }

    }

    return graphSegmentsPoints;

}

function isPointInArray( array, point ) {

    let found = false;

    for ( let i = 0, l = array.length; i < l; i ++ ) {

        const p = array[ i ];

        if ( p.x === point.x && p.y === point.y ) {

            found = true

            break;

        }

    }

    return found;

}

// function getDuplicates( array ) {

//     let uniqueElements = new Map();
//     let repeatedElements = [];

//     for ( let i = 0, l = array.length; i < l; i ++ ) {
        
//         const data = array[ i ];
//         const dataKey = '' + data.x + data.y;

//         if ( uniqueElements.has( dataKey ) ) {

//             repeatedElements.push( data );

//         } else {

//             uniqueElements.set( dataKey, data );

//         }

//     }

//     return repeatedElements;

// }