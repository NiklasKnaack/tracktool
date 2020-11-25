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
        
        let temp = this.heap.pop();      
        
        this.heap[ 0 ] = temp; 
        
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

        const temp = this.heap[ i ];

        this.heap[ i ] = this.heap[ parentIndex ];
        this.heap[ parentIndex ] = temp;

    }
    
}

/*
function selector( node ) {

	return node.cost;

}

const item01 = { name: 'item01', cost: 1 };
const item02 = { name: 'item02', cost: 2 };
const item03 = { name: 'item03', cost: 3 };
const item04 = { name: 'item04', cost: 4 };
const item05 = { name: 'item05', cost: 5 };
const item06 = { name: 'item06', cost: 6 };
const item07 = { name: 'item07', cost: 7.125 };
const item08 = { name: 'item08', cost: 7.124 };
const item09 = { name: 'item09', cost: 9 };
const item10 = { name: 'item10', cost: 10 };
const item11 = { name: 'item11', cost: 11 };
const item12 = { name: 'item12', cost: 12 };
const item13 = { name: 'item13', cost: 13 };
const item14 = { name: 'item14', cost: 14 };
const item15 = { name: 'item15', cost: 15 };

console.log("------------------------->>>>>>>>>>>>>>>>>>>>>>      HEAP");

const minHeap = new MinHeap( selector );

console.log( 'heap length: ', minHeap.length() );
console.log( 'heap data: ', minHeap.getDataCopy() );

minHeap.insert( item02 );
minHeap.insert( item14 );
minHeap.insert( item03 );
minHeap.insert( item13 );
minHeap.insert( item04 );
minHeap.insert( item07 );
minHeap.insert( item08 );
minHeap.insert( item05 );
minHeap.insert( item09 );
minHeap.insert( item06 );
minHeap.insert( item01 );
minHeap.insert( item10 );
minHeap.insert( item11 );
minHeap.insert( item12 );
minHeap.insert( item15 );

console.log( 'heap length: ', minHeap.length() );
console.log( 'heap data: ', minHeap.getDataCopy() );

console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
console.log( minHeap.remove() );
*/