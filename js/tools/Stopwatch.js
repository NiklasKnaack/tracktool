//https://stackoverflow.com/questions/20318822/how-to-create-a-stopwatch-using-javascript
//https://codepen.io/_Billy_Brown/pen/nLxKpO
class Stopwatch {

    constructor() {

        this._millisec = 0;
        this._sec = 0;
        this._min = 0;
        this._hour = 0;

        this._time = '00:00:00:00';

        this._intervalId = null;

    }

    reset() {

        this.stop();

        this._millisec = 0;
        this._sec = 0;
        this._min = 0;
        this._hour = 0;

        this._time = '00:00:00:00';

    }

    start() {

        if ( this._intervalId === null ) {

            this._intervalId = setInterval( () => this._step(), 10 );

        }

    }

    stop() {

        if ( this._intervalId !== null ) {

            clearInterval( this._intervalId );

            this._intervalId = null;

        }

    }

    _step() {

        this._format();
        this._calculate();

    }

    _calculate() {

        this._millisec = ++this._millisec;

        if ( this._millisec === 100 ) {

            this._millisec = 0;
            this._sec = ++this._sec;

        }

        if ( this._sec === 60 ) {

            this._min = ++this._min;
            this._sec = 0;

        }

        if ( this._min === 60 ) {

            this._min = 0;
            this._hour = ++this._hour;

        }

    }

    _format() {

        this._time = this._fix( this._hour.toString() ) + ':' + this._fix( this._min.toString() ) + ':' + this._fix( this._sec.toString() ) + ':' + this._fix( this._millisec.toString() );

    }

    _fix( input) {

        return input.length === 1 ? '0' + input : input;

    }

    get time () {

        return this._time;

    }

}