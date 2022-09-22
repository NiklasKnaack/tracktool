class AnimationFrameManager {

    static PASS_TIMESTAMP_TO_CALLBACK = true;

    constructor( callbacks = [], frames = [], autoStart = false ) {

        if ( AnimationFrameManager._instance ) {

            return AnimationFrameManager._instance;

        }

        AnimationFrameManager._instance = this;
        
        //---

        window._requestAnimationFrame = ( () => {

            return  window.requestAnimationFrame       ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame    ||
                    window.msRequestAnimationFrame
    
        } )();
    
        window._cancelAnimationFrame = ( () => {
    
            return  window.cancelAnimationFrame       ||
                    window.mozCancelAnimationFrame
    
        } )();

        //---

        this._callbackObjectHolder = [];
        this._iteration = 0;
        this._timestamp = 0;
        this._requestId = null;

        for ( let i = 0, l = callbacks.length; i < l; i ++ ) {

            const callback = callbacks[ i ];
            const frame = frames[ i ] !== undefined ? frames[ i ] : 1;

            this.addCallback( callback, frame );

        }

        //---

        if ( autoStart === true ) {

            this.start();

        }

    }

    //---

    addCallback( callback, frame = 1 ) {

        this._callbackObjectHolder.push( this._getCallbackObject( callback, frame ) );

    }

    removeCallback( callback ) {

        this._callbackObjectHolder.splice( this._callbackObjectHolder.findIndex( ( c ) => c.callback === callback ), 1 );

    }

    //---

    start() {

        if ( this._requestId === null ) {

            this._requestId = window._requestAnimationFrame( ( timestamp ) => this._update( timestamp ) );

        }

    }

    stop() {

        if ( this._requestId !== null ) {

            window._cancelAnimationFrame( this._requestId );

            this._iteration = 0;
            this._timestamp = 0;
            this._requestId = null;

        }

    }

    restart() {

        this.stop();
        this.start();

    }

    clear() {

        this.stop();

        this._callbackObjectHolder = [];

    }

    //---

    _update( timestamp ) {

        if ( this._callbackObjectHolder.length === 1 ) {

            this._applyCallback( this._callbackObjectHolder[ 0 ], timestamp );

        } else {

            for ( let i = 0, l = this._callbackObjectHolder.length; i < l; i ++ ) {

                this._applyCallback( this._callbackObjectHolder[ i ], timestamp );
    
            }

        }

        this._iteration++;
        this._timestamp = timestamp;

        this._requestId = window._requestAnimationFrame( ( timestamp ) => this._update( timestamp ) );

    }

    _applyCallback( callbackObject, timestamp = 0 ) {

        if ( callbackObject.frame === 1 ) {

            this._executeCallback( callbackObject.callback, timestamp );

        } else {

            if ( this._iteration % callbackObject.frame === 1 ) {

                this._executeCallback( callbackObject.callback, timestamp );
    
            }

        }

    }

    _executeCallback( callback, timestamp = 0 ) {

        if ( AnimationFrameManager.PASS_TIMESTAMP_TO_CALLBACK === true ) {

            callback( timestamp );

        } else {

            callback();

        }

    }

    _getCallbackObject( callback, frame = 1 ) {

        return {

            callback: callback,
            frame: frame

        };

    }

    //---

    get callbacks() {

        const callbacks = []

        for ( let i = 0, l = this._callbackObjectHolder.length; i < l; i ++ ) {

            callbacks.push( this._callbackObjectHolder[ i ].callback );

        }

        return callbacks;

    }

    get callbackObjects() {

        return this._callbackObjectHolder;

    }

    get iteration() {

        return this._iteration;

    }

    get timestamp() {

        return this._timestamp;

    }

    get requestId() {

        return this._requestId;

    }

}