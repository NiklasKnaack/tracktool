//https://codepen.io/_Billy_Brown/pen/nLxKpO
class Stopwatch {

    constructor() {

        this.time = null;

        this.reset();
        this.start();

    }
    
    reset() {

        this.times = [ 0, 0, 0 ];

    }
    
    start() {

        if ( this.time === null ) {
            
            this.time = performance.now();

        }

    }
    
    stop() {

        this.time = null;

    }
    
    step( timestamp ) {

        this.calculate( timestamp );
        this.time = timestamp;
        //this.print();

        //requestAnimationFrame(this.step.bind(this));

        return this.format( this.times );

    }
    
    calculate( timestamp ) {

        const diff = timestamp - this.time;
        // Hundredths of a second are 100 ms
        this.times[ 2 ] += diff / 10;
        // Seconds are 100 hundredths of a second
        if ( this.times[ 2 ] >= 100 ) {

            this.times[ 1 ] += 1;
            this.times[ 2 ] -= 100;

        }

        // Minutes are 60 seconds
        if ( this.times[ 1 ] >= 60 ) {

            this.times[ 0 ] += 1;
            this.times[ 1 ] -= 60;

        }

    }
    
    // print() {

    //     this.display.innerText = this.format( this.times );

    // }

    pad0( value, count ) {

        let result = value.toString();

        for (; result.length < count; --count)
            result = '0' + result;

        return result;

    }
    
    format( times ) {
        return `\
            ${this.pad0(times[0], 2)}:\
            ${this.pad0(times[1], 2)}:\
            ${this.pad0(Math.floor(times[2]), 2)}`;
    }
}