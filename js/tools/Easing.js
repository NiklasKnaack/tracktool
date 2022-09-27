class Easing {

    static linear = function( t, b, c, d ) {

        return c * t / d + b;

    }

    static inQuad = function( t, b, c, d ) {

        t /= d;

        return c * t * t + b;

    }

    static outQuad = function( t, b, c, d ) {

        t /= d;

        return -c * t * ( t - 2 ) + b;

    }

    static inOutQuad = function( t, b, c, d ) {

        t /= d / 2;

        if ( t < 1 ) {

            return c / 2 * t * t + b

        }

        t--;

        return -c / 2 * ( t * ( t - 2 ) - 1 ) + b;

    }

    static inCubic = function( t, b, c, d ) {

        t /= d;

        return c * t * t * t + b;

    }

    static outCubic = function( t, b, c, d ) {

        t /= d;

        t--;

        return c * ( t * t * t + 1 ) + b;

    }

    static inOutCubic = function( t, b, c, d ) {

        t /= d / 2;

        if ( t < 1 ) {
            
            return c / 2 * t * t * t + b;

        }

        t -= 2;

        return c / 2 * ( t * t * t + 2 ) + b;

    }

    static inQuart = function( t, b, c, d ) {

        t /= d;

        return c * t * t * t * t + b;

    }

    static outQuart = function( t, b, c, d ) {

        t /= d;

        t--;

        return -c * ( t * t * t * t - 1 ) + b;

    }

    static inOutQuart = function( t, b, c, d ) {

        t /= d / 2;

        if ( t < 1 ) {
            
            return c / 2 * t * t * t * t + b;

        }

        t -= 2;

        return -c / 2 * ( t * t * t * t - 2 ) + b;

    }

    static inQuint = function( t, b, c, d ) {

        t /= d;

        return c * t * t * t * t * t + b;

    }

    static outQuint = function( t, b, c, d ) {

        t /= d;

        t--;

        return c * ( t * t * t * t * t + 1 ) + b;

    }

    static inOutQuint = function( t, b, c, d ) {

        t /= d / 2;

        if ( t < 1 ) {
            
            return c / 2 * t * t * t * t * t + b;

        }

        t -= 2;

        return c / 2 * ( t * t * t * t * t + 2 ) + b;

    }

    static inSine = function( t, b, c, d ) {

        return -c * Math.cos( t / d * ( Math.PI / 2 ) ) + c + b;

    }
    
    static outSine = function( t, b, c, d ) {

        return c * Math.sin( t / d * ( Math.PI / 2 ) ) + b;

    }

    static inOutSine = function( t, b, c, d ) {

        return -c / 2 * ( Math.cos ( Math.PI * t / d ) - 1 ) + b;

    }

}