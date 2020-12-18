class AnimationFrameTimer {

    constructor( callback, ms = 500 ) {

        this._callback = callback;
        this._ms = ms;
        this._time = this._ms;// * 2;
        this._timestamp = 0;
        this._currentTimestamp = 0;
        this._isActive = true;
        this._hasFocus = true;
        
        // window.addEventListener( 'blur', this._blurHandler.bind( this ), false );
        // window.addEventListener( 'focus', this._focusHandler.bind( this ), false );

        document.addEventListener( 'visibilitychange', this._visibilitychangeHandler.bind( this ), false );

    }

    _visibilitychangeHandler( event ) {

        if ( document.visibilityState === 'visible' ) {

            // console.log( this._timestamp, event.timeStamp );

            this._timestamp = event.timeStamp;

            // console.log( this._timestamp + '\n' );

            this._hasFocus = true;

        } else {

            this._hasFocus = false;

        }

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

        this._currentTimestamp = timestamp;

        if ( this._isActive === false || this._hasFocus === false ) {

            return;

        }

        if ( this._currentTimestamp - this._timestamp >= this._time ) {

            // console.log( timestamp, this._timestamp, ( this._currentTimestamp - this._timestamp ), this._time );

            this._timestamp = this._currentTimestamp;

            this._callback();

        }

    }

    //---

    start() {

        // console.log( ( this._currentTimestamp - this._timestamp ), this._time );

        this._timestamp = this._currentTimestamp;

        // console.log( this._timestamp + '\n' );

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