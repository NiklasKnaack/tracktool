class AnimationFrameTimer {

    constructor( callback, ms = 500 ) {

        this._callback = callback;
        this._ms = ms;
        this._time = this._ms;// * 2;
        this._timestamp = 0;
        this._isActive = true;
        this._hasFocus = true;

        // window.addEventListener( 'blur', this._blurHandler.bind( this ), false );
        // window.addEventListener( 'focus', this._focusHandler.bind( this ), false );

        document.addEventListener( 'visibilitychange', this._visibilitychangeHandler.bind( this ), false );

    }

    _visibilitychangeHandler( event ) {

        if ( document.visibilityState === 'visible' ) {

            this._timestamp = event.timeStamp;

            this._hasFocus = true;

        } else {

            this._hasFocus = false;

        }

        console.log( 'this._hasFocus: ', this._hasFocus );

    }

    // _blurHandler( event ) {

    //     console.log( '_blurHandler', event );

    //     this._hasFocus = false;

    // }

    // _focusHandler( event ) {

    //     console.log( '_focusHandler', this._hasFocus, event );

    //     this._hasFocus = true;

    // }

    call( timestamp ) {

        if ( this._isActive === false || this._hasFocus === false ) {

            return;

        }

        if ( timestamp - this._timestamp >= this._time ) {

            // console.log( timestamp, this._timestamp, ( timestamp - this._timestamp ), this._time );

            this._timestamp = timestamp;

            this._callback();

        }

    }

    //---

    start() {

        this._isActive = true;

    }

    stop() {

        this._isActive = false;

    }

    //---

    get isActive() {

        return this._isActive;

    }

    get hasFocus() {

        return this._hasFocus;

    }

}