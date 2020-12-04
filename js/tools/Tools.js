class Tools {

    static getDistance( sv, ev ) {

        const a = sv.x - ev.x;
        const b = sv.y - ev.y;

        return Math.sqrt( a * a + b * b );

    }

    //---

    static interpolateQuadraticBezier( sv, cv, ev, t ) {

        const t1 = 1 - t;
        const t1pow = t1 * t1;
        const tpow = t * t;
        const t2 = 2 * t1 * t;

        return {

            x: t1pow * sv.x + t2 * cv.x + tpow * ev.x,
            y: t1pow * sv.y + t2 * cv.y + tpow * ev.y

        };

    }

    static interpolateLine( sv, ev, t ) {

        return {

            x: sv.x + ( ev.x - sv.x ) * t,
            y: sv.y + ( ev.y - sv.y ) * t

        };

    }

    //---

    static clamp( val, min, max ) {

        return Math.min( Math.max( min, val ), max );

    }

    //---

    static unifyNumber( numb, digits = 5 ) {

        return parseFloat( numb.toFixed( digits ) );

    }

    //---

    static getUID() {

        //https://stackoverflow.com/questions/8012002/create-a-unique-number-with-javascript-time
        //https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
        return window.crypto.getRandomValues( new Uint8Array( 10 ) ).join( '' );
      
    }

    static getUNumber() {

        return parseFloat( window.crypto.getRandomValues( new Uint8Array( 10 ) ).join( '' ) );
    
    }

}