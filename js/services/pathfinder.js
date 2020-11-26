//---

//https://www.sitepoint.com/javascript-web-workers/
//https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
//https://www.html5rocks.com/de/tutorials/workers/basics/

//---

class Pathfinder {

    constructor() {

        this._callback = null;
        this._worker = null;
        
        this.init();

    }

    init() {

        this._worker = new Worker( './js/services/pathsearch.js' );
        this._worker.addEventListener( 'message', this.resultHandler.bind( this ), false );
        this._worker.addEventListener( 'error', this.errorHandler.bind( this ), false );

    }

    computeRoutes( graph = {}, callback = null ) {

        this._callback = callback;

        this._worker.postMessage( graph );

    }

    resultHandler( event ) {

        const routes = event.data;

        if ( routes.length === 0 || this._callback === null ) {

            return;

        }

        this._callback( routes );

    }

    errorHandler( event ) {

        //---

    }

}

//---