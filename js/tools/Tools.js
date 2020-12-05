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

    //---

    static getFieldLimitationRect( width, height ) {

        return { 
            
            x: -Settings.FIELD_SIZE.width / 2, 
            y: -Settings.FIELD_SIZE.height / 2, 
            width: width + Settings.FIELD_SIZE.width, 
            height: height + Settings.FIELD_SIZE.height 
        
        };

    }

    static getFieldLimitationBorders() {

        return {

            left: Settings.FIELD_SIZE.width / 2, 
            top: Settings.FIELD_SIZE.height / 2, 
            right: -Settings.FIELD_SIZE.width / 2, 
            bottom: -Settings.FIELD_SIZE.height / 2

        };

    }

    //---

    static getRandomColorRGBA() {

        const rgb = Math.round( Math.random() * 0xffffff );

        return {

            r: rgb >> 16,
            g: rgb >> 8 & 255,
            b: rgb & 255,
            a: 255

        }

    }

    //---

    static getRouteColorRGBA( index ) {

        if ( index < Settings.ROUTE_COLORS.length ) {

            return Settings.ROUTE_COLORS[ index ];

        } else {

            return Tools.getRandomColorRGBA();

        }

    }

}