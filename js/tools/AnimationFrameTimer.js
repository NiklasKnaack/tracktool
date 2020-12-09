class AnimationFrameTimer {

    constructor( callback, ms = 500 ) {

        this._callback = callback;
        this._ms = ms;
        this._time = this._ms * 2;
        this._timestamp = 0;
        this._isActive = true;

    }

    call( timestamp ) {

        if ( this._isActive === false ) {

            if ( timestamp - this._timestamp >= this._time ) {

                this._timestamp = timestamp;

            }

            return;

        }

        if ( timestamp - this._timestamp >= this._time ) {

            this._timestamp = timestamp;

            this._callback();

            /*
            if ( this._isActive === true ) {

                this._callback();

            } else {

                // this._timestamp = timestamp;

            }
            */

        }

    }

    //---

    start() {

        // this._timestamp = 0;

        this._isActive = true;

    }

    stop() {

        // this._timestamp = this._timestamp;

        this._isActive = false;

    }

    //---

    get isActive() {

        return this._isActive;

    }

}