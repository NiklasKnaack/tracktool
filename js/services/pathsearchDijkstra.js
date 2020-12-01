//---

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

    for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

        const route = graph.routes[ i ];

        if ( route.startPoint !== null && route.endPoint !== null ) {

            findPath( route );

        }

    }

    //---

    postMessage( graph.routes );

}

//---

function findPath( route ) {

    const startNode = route.startPoint;
    const endNode = getPointByPosition( route.endPoint );

    let currentNode = null;

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
        point.parentGraphSegment = null;
        point.visited = false;

    }

    //---
    //set currentNode

    currentNode = getPointByPosition( startNode );

    if ( currentNode === null ) {

        return;

    }

    currentNode.cost = 0;

    graph.openSet.insert( currentNode );

    //---
    //dijkstra algorithm

    while ( graph.openSet.length > 0 ) {

        currentNode = graph.openSet.extract();
        currentNode.visited = true;

        //---

        const neighbourGraphsegments = currentNode.neighbourGraphsegments;
        const neighbourPoints = currentNode.neighbourPoints;

        if ( neighbourGraphsegments.length > 0 ) {

            for ( let i = 0, l = neighbourGraphsegments.length; i < l; i ++ ) {

                const neighbourGraphsegment = neighbourGraphsegments[ i ];
                const neighbourPoint = getPointByPosition( neighbourPoints[ i ] );
                
                if ( neighbourPoint.visited === false && neighbourPoint.walkable === true ) {

                    const neighbourDistance = currentNode.cost + neighbourGraphsegment.length;

                    if ( neighbourDistance < neighbourPoint.cost ) {

                        neighbourPoint.parentPoint = currentNode;
                        neighbourPoint.parentGraphSegment = neighbourGraphsegment;

                        neighbourPoint.cost = neighbourDistance;

                        graph.openSet.insert( neighbourPoint );

                    }

                }

            }

        }

        //graph.openSet.splice( graph.openSet.findIndex( ( point ) => point.x === currentNode.x && point.y === currentNode.y ), 1 );

    }

    //---
    //retrace route

    if ( endNode.parentPoint !== null ) {

        // console.log( 'FOUND END' );

        route.complete = true;
        route.length = 0;
        route.graphSegments = [];

        let currentPoint = endNode;

        while ( currentPoint !== null ) {

            if ( currentPoint.parentGraphSegment !== null ) {

                route.length += currentPoint.parentGraphSegment.length;

                //---

                let newGraphSegment = {};

                newGraphSegment.controlPoint = currentPoint.parentGraphSegment.controlPoint;
                newGraphSegment.length = currentPoint.parentGraphSegment.length;
                newGraphSegment.p0 = { x: currentPoint.parentPoint.x, y: currentPoint.parentPoint.y };
                newGraphSegment.p1 = currentPoint;

                route.graphSegments.unshift( newGraphSegment );

            }

            currentPoint = currentPoint.parentPoint;

        }

    } else {

        //console.log( "FOUND NO END" );

        route.complete = false;

    }

}

//---

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