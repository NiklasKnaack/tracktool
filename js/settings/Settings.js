class Settings {

    static NAME = 'TRAFFIC MANAGER';
    static VERSION = '0.11';

    static FIELD_SIZE = { width: 25000, height: 25000 };
    // static FIELD_SIZE = { width: 1040, height: 932 };
    // static FIELD_SIZE = { width: 3000, height: 3000 };

    static CANVASES_TO_BUILD = [ 
        
        { name: 'clear', add: false },
        { name: 'background', add: true },
        { name: 'bottom', add: true },
        { name: 'main', add: true },
        { name: 'level1', add: true },
        { name: 'level2', add: true },
        { name: 'level3', add: true },
        { name: 'debug', add: true },
    
    ];

    static ROUTE_COLORS = [

        { r: 255, g: 213, b:   0, a: 255 },
        { r: 255, g:  85, b:   0, a: 255 },
        { r:   0, g: 170, b: 255, a: 255 },
        { r:   0, g: 255, b: 213, a: 255 },
        { r:   0, g: 255, b:  86, a: 255 },
        { r: 255, g:   0, b: 169, a: 255 },
        { r: 214, g:   0, b: 255, a: 255 },
        { r: 169, g: 255, b:   0, a: 255 },
        { r:   0, g:  41, b: 255, a: 255 },
        { r: 255, g:   0, b:  41, a: 255 },
        { r: 254, g:  74, b:  73, a: 255 },
        { r:  42, g: 183, b: 202, a: 255 },
        { r: 254, g: 215, b: 102, a: 255 },
        { r: 244, g: 244, b: 248, a: 255 },
        { r: 246, g: 171, b: 182, a: 255 },
        { r: 238, g: 201, b: 210, a: 255 },
        { r: 179, g: 205, b: 224, a: 255 },
        { r: 100, g: 151, b: 177, a: 255 },
        { r: 222, g: 195, b: 195, a: 255 },
        { r:  14, g: 154, b: 167, a: 255 },
        { r:  61, g: 164, b: 171, a: 255 },
        { r: 246, g: 205, b:  97, a: 255 },
        { r: 254, g: 138, b: 113, a: 255 },
        { r: 131, g: 208, b: 201, a: 255 },
        { r: 253, g: 244, b: 152, a: 255 },
        { r: 123, g: 192, b:  67, a: 255 },
        { r: 255, g:   0, b:   0, a: 255 },
        { r:   0, g: 255, b:   0, a: 255 },
        { r:   0, g:   0, b: 255, a: 255 },

    ];

    static DIR_LEFT = Math.PI * 1.00;
    static DIR_TOP = Math.PI * 1.50;
    static DIR_RIGHT = Math.PI * 0.00;
    static DIR_BOTTOM = Math.PI * 0.50;

    // static DIR_LEFT_TOP = Math.PI * 1.25;
    // static DIR_RIGHT_TOP = Math.PI * 1.75;
    // static DIR_LEFT_BOTTOM = Math.PI * 0.75;
    // static DIR_RIGHT_BOTTOM = Math.PI * 0.25;

    static MATH_PI_015 = Math.PI * 0.15;
    static MATH_PI_025 = Math.PI * 0.25;
    static MATH_PI_050 = Math.PI * 0.50;
    static MATH_PI_075 = Math.PI * 0.75;

}