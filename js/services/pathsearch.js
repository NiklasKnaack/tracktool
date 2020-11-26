//---

this.addEventListener( 'message', init, false );

//---

let graph = null;

//---

function init( event ) {

    graph = event.data;

    console.log( 'worker get: ', graph );

    if ( graph.hasOwnProperty( 'routes' ) === false || graph.hasOwnProperty( 'points' ) === false ) {

        return;

    }

    if ( graph.routes.length === 0 || graph.points.length < 2 ) {

        return;

    }

    //---

    for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

        const route = graph.routes[ i ];

        if ( route.startPoint !== null && route.endPoint !== null ) {

            findPath( route );

        }

    }

    //---

    console.log( 'graph.routes: ', graph.routes );

    postMessage( graph.routes );

}

//---

function findPath( route ) {

    tempPathSegments = [];

    //---
    //get cost value function for MinHeap Sort

    const getCost = ( node ) => {

        return node.cost;
    
    }

    //---
    //create new MinHeap

    graph.openSet = new MinHeap( getCost );

    //---
    //reset all points

    for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

        const point = graph.points[ i ];

        point.cost = Infinity;
        point.parentPoint = null;
        point.visited = false;

    }

    //---
    
    graph.currentPoint = getPointByPosition( route.startPoint );

    if ( graph.currentPoint === null ) {

        return;

    }

    graph.currentPoint.cost = 0;

    graph.openSet.insert( graph.currentPoint );

    //---

    while ( graph.openSet.length > 0 ) {

        //console.log( '______________________________________', graph.openSet.length, graph.openSet.length() );

        // graph.currentPoint = graph.openSet.find( point => point.cost === Math.min( ...graph.openSet.map( nextPoint => nextPoint.cost ) ) );
        graph.currentPoint = graph.openSet.extract();
        graph.currentPoint.visited = true;

        // for ( let i = 0, l = graph.openSet.length; i < l; i ++ ) {

        //     console.log( '--->>> ', graph.openSet[ i ].x, graph.openSet[ i ].y, graph.openSet[ i ].visited, graph.openSet[ i ].cost);

        // }

        //---

        const neighbourPathsegments = graph.currentPoint.neighbourPathsegments;
        const neighbourPoints = graph.currentPoint.neighbourPoints;

        if ( neighbourPathsegments.length > 0 ) {

            for ( let i = 0, l = neighbourPathsegments.length; i < l; i ++ ) {

                const neighbourPathsegment = neighbourPathsegments[ i ];
                const neighbourPoint = getPointByPosition( neighbourPoints[ i ] );
                
                if ( neighbourPoint.visited === false && neighbourPoint.walkable === true ) {

                    const neighbourDistance = graph.currentPoint.cost + neighbourPathsegment.length;

                    if ( neighbourDistance < neighbourPoint.cost ) {

                        neighbourPoint.parentPoint = graph.currentPoint;

                        neighbourPoint.cost = neighbourDistance;

                    }

                    graph.openSet.insert( neighbourPoint );

                }

            }

        }

        //graph.openSet.splice( graph.openSet.findIndex( ( point ) => point.x === graph.currentPoint.x && point.y === graph.currentPoint.y ), 1 );

    }

    //---

    const routeEndPoint = getPointByPosition( route.endPoint );

    if ( routeEndPoint.parentPoint !== null ) {

        // console.log( 'FOUND END' );

        const pathToEnd = [];

        let currentPoint = routeEndPoint;

        while ( currentPoint !== null ) {

            pathToEnd.unshift( currentPoint );

            currentPoint = currentPoint.parentPoint;

        }

        route.complete = true;
        route.length = 0;
        route.pathSegments = [];

        for ( let i = 0, l = pathToEnd.length - 1; i < l; i ++ ) {

            const point0 = pathToEnd[ i ];
            const point1 = pathToEnd[ i + 1 ];

            const pathSegment = getPathSegmentByPoints( point0, point1 );

            //---

            route.length += pathSegment.length;

            //---

            let newPathSegment = {};

            //newPathSegment.id = pathSegment.id;
            newPathSegment.controlPoint = pathSegment.controlPoint;
            newPathSegment.length = pathSegment.length;
            newPathSegment.p0 = null;
            newPathSegment.p1 = null;

            if ( i === 0 ) {

                if ( pathSegment.p0.x === route.startPoint.x && pathSegment.p0.y === route.startPoint.y ) {

                    newPathSegment.p0 = pathSegment.p0;
                    newPathSegment.p1 = pathSegment.p1;

                } else {

                    newPathSegment.p0 = pathSegment.p1;
                    newPathSegment.p1 = pathSegment.p0;

                }

            } else {

                const predecessorNewPathSegment = route.pathSegments[ route.pathSegments.length - 1 ];

                if ( pathSegment.p0.x === predecessorNewPathSegment.p1.x && pathSegment.p0.y === predecessorNewPathSegment.p1.y ) {

                    newPathSegment.p0 = pathSegment.p0;
                    newPathSegment.p1 = pathSegment.p1;

                } else {

                    newPathSegment.p0 = pathSegment.p1;
                    newPathSegment.p1 = pathSegment.p0;

                }

            }

            route.pathSegments.push( newPathSegment );

        }

    } else {

        //console.log( "FOUND NO END" );

        route.complete = false;

    }

}

//---

function getPathSegmentByPoints( p0, p1 ) {

    let result = null;

    for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

        const pathSegment = graph.segments[ i ];

        let p0Found = false;
        let p1Found = false;

        if ( pathSegment.p0.x === p0.x && pathSegment.p0.y === p0.y || pathSegment.p1.x === p0.x && pathSegment.p1.y === p0.y ) {

            p0Found = true;

        }

        if ( pathSegment.p0.x === p1.x && pathSegment.p0.y === p1.y || pathSegment.p1.x === p1.x && pathSegment.p1.y === p1.y ) {

            p1Found = true;

        }

        if ( p0Found === true && p1Found === true ) {

            result = pathSegment;

        }

    }

    return result;

}

function getPointByPosition( position ) {

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

//---

class MinHeap {   

    constructor( selector, data = [] ) {

        this.selector = selector;

        if ( data.length === 0 ) {

            this.heap = data;

        } else {

            this.heap = [];

            for ( let i = 0, l = data.length; i < l; i ++ ) {

                this.insert( data[ i ] );

            }

        }

    }

    get length() {

        return this.heap.length;

    }

    insert( node ) {      
        
        let i = this.heap.length;      
        
        this.heap.push( node );

        let parentIndex = Math.floor( ( i + 1 ) / 2 - 1 );

        if ( parentIndex < 0 ) {
            
            parentIndex = 0;

        }

        let parentVal = this.selector( this.heap[ parentIndex ] );      
        
        const pushedVal = this.selector( this.heap[ i ] );

        while ( i > 0 && parentVal > pushedVal ) {         
            
            parentIndex = Math.floor( ( i + 1 ) / 2 - 1 );

            this.swap( i, parentIndex );
            
            i = parentIndex;
            
            parentVal = this.selector( this.heap[ Math.max( i, 0 ) ] );
            
        }   
        
    }

    extract() {

        if ( this.heap.length === 0 ) {

            return null;

        }
        
        if ( this.heap.length <= 1 ) {
            
            return this.heap.pop();
            
        }
        
        const result = this.heap[ 0 ];

        this.heap[ 0 ] = this.heap.pop();   
        
        let i = 0;

        while ( true ) {
            
            const childIndex = ( i + 1 ) * 2;
            
            let rightChildIndex = childIndex;         
            let leftChildIndex = childIndex - 1;         
            
            let lowest = rightChildIndex;

            if ( leftChildIndex >= this.heap.length && rightChildIndex >= this.heap.length ) {

                break;

            }
            
            if ( leftChildIndex >= this.heap.length ) {
                
                lowest = rightChildIndex;

            }
            
            if ( rightChildIndex >= this.heap.length ) {
                
                lowest = leftChildIndex;

            }
            
            if ( leftChildIndex >= this.heap.length === false && rightChildIndex >= this.heap.length === false ) {         
                
                lowest = this.selector( this.heap[ rightChildIndex ] ) < this.selector( this.heap[ leftChildIndex ]) ? rightChildIndex : leftChildIndex;         
                
            }     

            if ( this.selector( this.heap[ i ] ) > this.selector( this.heap[ lowest ] ) ) {         
                
                this.swap( i, lowest );         
                
                i = lowest;         
                
            } else {
                
                break;
                
            }
            
        }
        
        return result;   
        
    }

    swap( i, parentIndex ) {

        let temp = this.heap[ i ];

        this.heap[ i ] = this.heap[ parentIndex ];
        this.heap[ parentIndex ] = temp;

        temp = null;

    }
    
}