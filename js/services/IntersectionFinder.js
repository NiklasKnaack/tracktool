class IntersectionFinder {

    constructor() {

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

        this._worker = new Worker( './js/services/workers/intersectionsearch.js' );
        this._worker.addEventListener( 'message', this.resultHandler.bind( this ), false );
        this._worker.addEventListener( 'error', this.errorHandler.bind( this ), false );

    }

    computeIntersections( graph = {}, callback = null ) {

        this._perfNow0 = performance.now();

        this.resetWorker();

        this._callback = callback;
        this._worker.postMessage( graph );

    }

    resultHandler( event ) {

        const graphPoints = event.data.points;
        const graphIntersectionsLength = event.data.intersectionsLength;

        if ( graphPoints.length === 0 || this._callback === null ) {

            return;

        }

        this._perfNow1 = performance.now();

        this._callback( graphPoints, graphIntersectionsLength, this._perfNow1 - this._perfNow0 );

    }

    errorHandler( event ) {

        //---

    }

}