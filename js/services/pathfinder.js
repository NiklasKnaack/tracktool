//https://www.sitepoint.com/javascript-web-workers/
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
//https://www.html5rocks.com/de/tutorials/workers/basics/

//---

class PathFinder {

    constructor( type = 'AStar' ) {

        this._type = type;//Dijkstra

        this._callback = null;
        this._worker = null;

        this._perfNow0 = 0;
        this._perfNow1 = 0;
        
        this.resetWorker();

    }

    resetWorker() {

        if ( this._worker !== null ) {

            this._worker.terminate();
            this._worker.removeEventListener( 'message', this.resultHandler );
            this._worker.removeEventListener( 'error', this.errorHandler );
            this._worker = null;

        }

        this._worker = new Worker( './js/services/workers/pathsearch' + this._type + '.js' );
        this._worker.addEventListener( 'message', this.resultHandler.bind( this ), false );
        this._worker.addEventListener( 'error', this.errorHandler.bind( this ), false );

    }

    computeRoutes( graph = {}, callback = null ) {

        this._perfNow0 = performance.now();

        this.resetWorker();

        this._callback = callback;
        this._worker.postMessage( graph );

    }

    resultHandler( event ) {

        const graphRoutes = event.data;

        if ( graphRoutes.length === 0 || this._callback === null ) {

            return;

        }

        this._perfNow1 = performance.now();

        this._callback( graphRoutes, this._perfNow1 - this._perfNow0 );

    }

    errorHandler( event ) {

        //---

    }

}