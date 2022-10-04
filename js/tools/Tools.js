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

    static getTimeStamp() {

        return Date.now();

    }

    //---

    static getAngleInDegrees( angle ) {

        return angle * 180 / Math.PI;

    }

    //---

    static getFieldLimitationRect( width, height, diff = { x: 0, y: 0 } ) {

        return { 
            
            x: -( Settings.FIELD_SIZE.width - width ) / 2 + diff.x,
            y: -( Settings.FIELD_SIZE.height - height ) / 2 + diff.y,
            width: Settings.FIELD_SIZE.width - diff.x / 2, 
            height: Settings.FIELD_SIZE.height - diff.y / 2
        
        };

    }

    static getFieldGridBorders( width, height, diff = { x: 0, y: 0 } ) {

        return { 
            
            left: -( Settings.FIELD_SIZE.width - width ) / 2 + diff.x,
            top: -( Settings.FIELD_SIZE.height - height ) / 2 + diff.y,
            right: Settings.FIELD_SIZE.width - diff.x / 2, 
            bottom: Settings.FIELD_SIZE.height - diff.y / 2
        
        };

    }

    static getFieldLimitationBorders( width, height, diff = { x: 0, y: 0 } ) {

        return {

            left: Settings.FIELD_SIZE.width / 2 - width / 2 - diff.x, 
            top: Settings.FIELD_SIZE.height / 2 - height / 2 - diff.y, 
            right: -Settings.FIELD_SIZE.width / 2 + width / 2 - diff.x, 
            bottom: -Settings.FIELD_SIZE.height / 2 + height / 2 - diff.y

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

    static getRouteColorRGBA( index ) {

        if ( index < Settings.ROUTE_COLORS.length ) {

            return Settings.ROUTE_COLORS[ index ];

        } else {

            return Tools.getRandomColorRGBA();

        }

    }

    //---

    static isPositionInCircle( x, y, cx, cy, radius ) {

        const a = x - cx;
        const b = y - cy;

        return a * a + b * b <= radius * radius;

    }

    //---

    //https://stackoverflow.com/questions/13937782/calculating-the-point-of-intersection-of-two-lines
    static getLinesIntersectionPoint( x1, y1, x2, y2, x3, y3, x4, y4 ) {

        const denominator = ( y4 - y3 ) * ( x2 - x1 ) - ( x4 - x3 ) * ( y2 - y1 );
        
        if ( denominator === 0 ) {
        
            return null;
        
        }
        
        const ua = ( ( x4 - x3 ) * ( y1 - y3 ) - ( y4 - y3 ) * ( x1 - x3 ) ) / denominator;
        //const ub = ( ( x2 - x1 ) * ( y1 - y3 ) - ( y2 - y1 ) * ( x1 - x3 ) ) / denominator;
        
        return { 

            x: x1 + ua * ( x2 - x1 ),
            y: y1 + ua * ( y2 - y1 )

        }
        
    }

    //---

    //https://stackoverflow.com/questions/10343448/javascript-atan2-function-not-giving-expected-results
    static getAtan2Normalized( y, x ) {

        return Math.atan2( -y, -x ) + Math.PI;

    }

    //---

    //https://stackoverflow.com/questions/12234574/calculating-if-an-angle-is-between-two-angles
    static isInsideAngle( a0, a1 ) {

        return Math.acos( Math.cos( a0 ) * Math.cos( a1 ) + Math.sin( a0 ) * Math.sin( a1 ) ) <= Math.PI / 4;

    }

    //---

    //https://stackoverflow.com/questions/1560492/how-to-tell-whether-a-point-is-to-the-right-or-left-side-of-a-line
    static isLeft( a, b, c ) {

        return ( b.x - a.x ) * ( c.y - a.y ) > ( b.y - a.y ) * ( c.x - a.x );

    }

    //---

    static normalizeAngle( angle ) {

        return Math.atan2( Math.sin( angle ), Math.cos( angle ) );
        
    }

    //---

    static comparePoints( p0, p1 ) {

        return p0.x === p1.x && p0.y === p1.y;

    }

    //---

    // static getNewPosXYObj( x = 0, y = 0 ) {

    //     return { x: x, y: y };

    // }

    // static getNewPosXYZObj( x = 0, y = 0, z = 0 ) {

    //     return { x: x, y: y, z: 0 };

    // }

    // static getNewColRGBObj( r = 255, g = 255, b = 255 ) {

    //     return { r: r, g: g, b: b };

    // }

    // static getNewColRGBAObj( r = 255, g = 255, b = 255, a = 255 ) {

    //     return { r: r, g: g, b: b, a: a };

    // }

}