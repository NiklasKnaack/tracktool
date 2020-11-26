class Pathfinder {

    constructor() {

        this.worker = null;

        this.init();

    }

    init() {

        //https://www.sitepoint.com/javascript-web-workers/
        //https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
        //https://www.html5rocks.com/de/tutorials/workers/basics/

        this.worker = new Worker( './js/services/pathsearch.js' );
        this.worker.addEventListener( 'message', this.onMsg, false );
        this.worker.addEventListener( 'error', this.onError, false );
        //this.worker.postMessage(); 

    }

    test() {

        this.worker.postMessage( 'Hello World' ); 

    }

    onMsg( event ) {

        console.log( 'pathfinder get: ', event.data );

    }

    onError( event ) {



    }

}