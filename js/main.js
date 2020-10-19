document.addEventListener( 'DOMContentLoaded', () => {

    //---

    console.clear();
    console.log( 'Track Tool' );

    //---

    let debugMode = true;
    let debugElements = [];

    const MATHPI2 = Math.PI * 2;

    const SNAP_TO_DISTANCE = 25;

    const EDITOR_MODE_ENUM = Object.freeze( {

        addPathSegment: 'addPathSegment',
        removePathSegment: 'removePathSegment',
        bendPathSegment: 'bendPathSegment',
        straightenPathSegment: 'straightenPathSegment',
        togglePathWalkable: 'togglePathWalkable',
        togglePathDirections: 'togglePathDirections',
        addStartPoint: 'addStartPoint',
        addEndPoint: 'addEndPoint',
        removeStartEndPoints: 'removeStartEndPoints',
        getPathSegment: 'getPathSegment',
        togglePointWalkable: 'togglePointWalkable',
        movePoint: 'movePoint',
        findPath: 'findPath'

    } );

    const PATH_DIRECTIONS = [ '><', '>', '<' ];
    const PATH_SEGMENT_CURVE_ACCURACY = 5;

    const PATH_COLORS = [
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
        { r: 123, g: 192, b:  67, a: 255 }
    ];

    let editorMode = EDITOR_MODE_ENUM.addPathSegment;

    let width = 1024;
    let height = 512;

    const canvas = document.createElement( 'canvas' );
    const context = canvas.getContext( '2d' );

    let animationFrame = null;

    let imageData = null;
    let data = null;

    const border = { left: 1, top: 1, right: width, bottom: height };

    let mouseDown = false;
    let mousePos = { x: 0, y: 0 };
    // let mousePosStart = { x: 0, y: 0 };
    // let mousePosEnd = { x: 0, y: 0 };
    const mouseCursor = { diameter: 9, color: { r: 255, g: 255, b: 255, a: 255 }, position: { x: 0, y: 0 } };

    let currentPathSegment = null;
    let selectedPathSegments = [];

    let tempPathSegments = [];

    let pathHolder = [
        {
            id: 0,
            routes: [
                { startPoint: { x: 60, y: 218 }, endPoint: { x: 785, y: 877 }, pathSegments: [] },
                { startPoint: { x: 170, y: 835 }, endPoint: { x: 715, y: 51 }, pathSegments: [] },
            ],
            currentPoint: { x: 0, y: 0 },
            points: [
                { x: 170, y: 835, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 180, y: 716, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 153, y: 584, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 203, y: 427, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 170, y: 263, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 191, y: 70, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 347, y: 63, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 362, y: 232, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 363, y: 325, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 383, y: 418, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 370, y: 567, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 396, y: 689, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 385, y: 798, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 413, y: 890, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 578, y: 898, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 578, y: 757, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 568, y: 646, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 578, y: 501, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 562, y: 369, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 593, y: 249, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 548, y: 127, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 606, y: 41, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 715, y: 51, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 725, y: 147, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 722, y: 271, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 753, y: 390, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 745, y: 547, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 801, y: 683, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 758, y: 766, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 785, y: 877, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 868, y: 784, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 60, y: 218, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 57, y: 582, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 91, y: 741, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 952, y: 416, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 645, y: 341, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 270, y: 465, walkable: true, cost: 0, parentPoint: null, visited: false },
            ],
            openSet: [],
            closedSet: [],
            segments: [
                { id: 0, p0: { x: 170, y: 835 }, p1: { x: 180, y: 716 }, walkable: true, direction: '><', centerPoint: { x: 175, y: 775.5 }, controlPoint: { x: 175, y: 775.5 }, length: 119.41942890501528 },
                { id: 1, p0: { x: 180, y: 716 }, p1: { x: 153, y: 584 }, walkable: true, direction: '><', centerPoint: { x: 166.5, y: 650 }, controlPoint: { x: 166.5, y: 650 }, length: 134.73306943731373 },
                { id: 2, p0: { x: 153, y: 584 }, p1: { x: 203, y: 427 }, walkable: true, direction: '><', centerPoint: { x: 178, y: 505.5 }, controlPoint: { x: 178, y: 505.5 }, length: 164.76953601925328 },
                { id: 3, p0: { x: 203, y: 427 }, p1: { x: 170, y: 263 }, walkable: true, direction: '><', centerPoint: { x: 186.5, y: 345 }, controlPoint: { x: 186.5, y: 345 }, length: 167.28717822953436 },
                { id: 4, p0: { x: 170, y: 263 }, p1: { x: 191, y: 70 }, walkable: true, direction: '><', centerPoint: { x: 180.5, y: 166.5 }, controlPoint: { x: 180.5, y: 166.5 }, length: 194.1391253714717 },
                { id: 5, p0: { x: 347, y: 63 }, p1: { x: 362, y: 232 }, walkable: true, direction: '><', centerPoint: { x: 354.5, y: 147.5 }, controlPoint: { x: 354.5, y: 147.5 }, length: 169.66437457521835 },
                { id: 6, p0: { x: 362, y: 232 }, p1: { x: 363, y: 325 }, walkable: true, direction: '><', centerPoint: { x: 362.5, y: 278.5 }, controlPoint: { x: 362.5, y: 278.5 }, length: 93.00537618869137 },
                { id: 7, p0: { x: 363, y: 325 }, p1: { x: 383, y: 418 }, walkable: true, direction: '><', centerPoint: { x: 373, y: 371.5 }, controlPoint: { x: 373, y: 371.5 }, length: 95.12623192369179 },
                { id: 8, p0: { x: 383, y: 418 }, p1: { x: 370, y: 567 }, walkable: true, direction: '><', centerPoint: { x: 376.5, y: 492.5 }, controlPoint: { x: 376.5, y: 492.5 }, length: 149.56603892595405 },
                { id: 9, p0: { x: 370, y: 567 }, p1: { x: 396, y: 689 }, walkable: true, direction: '><', centerPoint: { x: 383, y: 628 }, controlPoint: { x: 383, y: 628 }, length: 124.73972903610141 },
                { id: 10, p0: { x: 396, y: 689 }, p1: { x: 385, y: 798 }, walkable: true, direction: '><', centerPoint: { x: 390.5, y: 743.5 }, controlPoint: { x: 390.5, y: 743.5 }, length: 109.55363982999378 },
                { id: 11, p0: { x: 385, y: 798 }, p1: { x: 413, y: 890 }, walkable: true, direction: '><', centerPoint: { x: 399, y: 844 }, controlPoint: { x: 399, y: 844 }, length: 96.16652224137046 },
                { id: 12, p0: { x: 578, y: 898 }, p1: { x: 578, y: 757 }, walkable: true, direction: '><', centerPoint: { x: 578, y: 827.5 }, controlPoint: { x: 578, y: 827.5 }, length: 141 },
                { id: 13, p0: { x: 578, y: 757 }, p1: { x: 568, y: 646 }, walkable: true, direction: '><', centerPoint: { x: 573, y: 701.5 }, controlPoint: { x: 573, y: 701.5 }, length: 111.44954015158609 },
                { id: 14, p0: { x: 568, y: 646 }, p1: { x: 578, y: 501 }, walkable: true, direction: '><', centerPoint: { x: 573, y: 573.5 }, controlPoint: { x: 573, y: 573.5 }, length: 145.34441853748632 },
                { id: 15, p0: { x: 578, y: 501 }, p1: { x: 562, y: 369 }, walkable: true, direction: '><', centerPoint: { x: 570, y: 435 }, controlPoint: { x: 570, y: 435 }, length: 132.9661611087573 },
                { id: 16, p0: { x: 562, y: 369 }, p1: { x: 593, y: 249 }, walkable: true, direction: '><', centerPoint: { x: 577.5, y: 309 }, controlPoint: { x: 577.5, y: 309 }, length: 123.9395013706284 },
                { id: 17, p0: { x: 593, y: 249 }, p1: { x: 548, y: 127 }, walkable: true, direction: '><', centerPoint: { x: 570.5, y: 188 }, controlPoint: { x: 570.5, y: 188 }, length: 130.034610777285 },
                { id: 18, p0: { x: 548, y: 127 }, p1: { x: 606, y: 41 }, walkable: true, direction: '><', centerPoint: { x: 577, y: 84 }, controlPoint: { x: 577, y: 84 }, length: 103.73041983911952 },
                { id: 19, p0: { x: 715, y: 51 }, p1: { x: 725, y: 147 }, walkable: true, direction: '><', centerPoint: { x: 720, y: 99 }, controlPoint: { x: 720, y: 99 }, length: 96.51942809610924 },
                { id: 20, p0: { x: 725, y: 147 }, p1: { x: 722, y: 271 }, walkable: true, direction: '><', centerPoint: { x: 723.5, y: 209 }, controlPoint: { x: 723.5, y: 209 }, length: 124.03628501370073 },
                { id: 21, p0: { x: 722, y: 271 }, p1: { x: 753, y: 390 }, walkable: true, direction: '><', centerPoint: { x: 737.5, y: 330.5 }, controlPoint: { x: 737.5, y: 330.5 }, length: 122.97154142320898 },
                { id: 22, p0: { x: 753, y: 390 }, p1: { x: 745, y: 547 }, walkable: true, direction: '><', centerPoint: { x: 749, y: 468.5 }, controlPoint: { x: 749, y: 468.5 }, length: 157.20368952413298 },
                { id: 23, p0: { x: 745, y: 547 }, p1: { x: 801, y: 683 }, walkable: true, direction: '><', centerPoint: { x: 773, y: 615 }, controlPoint: { x: 773, y: 615 }, length: 147.07821048680188 },
                { id: 24, p0: { x: 801, y: 683 }, p1: { x: 758, y: 766 }, walkable: true, direction: '><', centerPoint: { x: 779.5, y: 724.5 }, controlPoint: { x: 779.5, y: 724.5 }, length: 93.47726996441435 },
                { id: 25, p0: { x: 758, y: 766 }, p1: { x: 785, y: 877 }, walkable: true, direction: '><', centerPoint: { x: 771.5, y: 821.5 }, controlPoint: { x: 771.5, y: 821.5 }, length: 114.23659658795863 },
                { id: 26, p0: { x: 868, y: 784 }, p1: { x: 758, y: 766 }, walkable: true, direction: '><', centerPoint: { x: 813, y: 775 }, controlPoint: { x: 813, y: 775 }, length: 111.46299834474219 },
                { id: 27, p0: { x: 758, y: 766 }, p1: { x: 578, y: 757 }, walkable: true, direction: '><', centerPoint: { x: 668, y: 761.5 }, controlPoint: { x: 668, y: 761.5 }, length: 180.22485955050706 },
                { id: 28, p0: { x: 578, y: 757 }, p1: { x: 385, y: 798 }, walkable: true, direction: '><', centerPoint: { x: 481.5, y: 777.5 }, controlPoint: { x: 481.5, y: 777.5 }, length: 197.3068675946177 },
                { id: 29, p0: { x: 385, y: 798 }, p1: { x: 180, y: 716 }, walkable: true, direction: '><', centerPoint: { x: 282.5, y: 757 }, controlPoint: { x: 282.5, y: 757 }, length: 220.79175709251467 },
                { id: 30, p0: { x: 153, y: 584 }, p1: { x: 370, y: 567 }, walkable: true, direction: '><', centerPoint: { x: 261.5, y: 575.5 }, controlPoint: { x: 261.5, y: 575.5 }, length: 217.66488003350472 },
                { id: 31, p0: { x: 370, y: 567 }, p1: { x: 578, y: 501 }, walkable: true, direction: '><', centerPoint: { x: 474, y: 534 }, controlPoint: { x: 474, y: 534 }, length: 218.22007240398395 },
                { id: 32, p0: { x: 578, y: 501 }, p1: { x: 753, y: 390 }, walkable: true, direction: '><', centerPoint: { x: 665.5, y: 445.5 }, controlPoint: { x: 665.5, y: 445.5 }, length: 207.23416706711276 },
                { id: 33, p0: { x: 725, y: 147 }, p1: { x: 548, y: 127 }, walkable: true, direction: '><', centerPoint: { x: 636.5, y: 137 }, controlPoint: { x: 636.5, y: 137 }, length: 178.12635964393365 },
                { id: 34, p0: { x: 548, y: 127 }, p1: { x: 362, y: 232 }, walkable: true, direction: '><', centerPoint: { x: 455, y: 179.5 }, controlPoint: { x: 455, y: 179.5 }, length: 213.59073013593076 },
                { id: 35, p0: { x: 362, y: 232 }, p1: { x: 170, y: 263 }, walkable: true, direction: '><', centerPoint: { x: 266, y: 247.5 }, controlPoint: { x: 266, y: 247.5 }, length: 194.48650338776724 },
                { id: 36, p0: { x: 170, y: 263 }, p1: { x: 60, y: 218 }, walkable: true, direction: '><', centerPoint: { x: 115, y: 240.5 }, controlPoint: { x: 115, y: 240.5 }, length: 118.84864324004712 },
                { id: 37, p0: { x: 153, y: 584 }, p1: { x: 57, y: 582 }, walkable: true, direction: '><', centerPoint: { x: 105, y: 583 }, controlPoint: { x: 105, y: 583 }, length: 96.02083107326243 },
                { id: 38, p0: { x: 180, y: 716 }, p1: { x: 91, y: 741 }, walkable: true, direction: '><', centerPoint: { x: 135.5, y: 728.5 }, controlPoint: { x: 135.5, y: 728.5 }, length: 92.44457799135652 },
                { id: 39, p0: { x: 753, y: 390 }, p1: { x: 952, y: 416 }, walkable: true, direction: '><', centerPoint: { x: 852.5, y: 403 }, controlPoint: { x: 852.5, y: 403 }, length: 200.6913052426537 },
                { id: 40, p0: { x: 725, y: 147 }, p1: { x: 645, y: 341 }, walkable: true, direction: '><', centerPoint: { x: 685, y: 244 }, controlPoint: { x: 685, y: 244 }, length: 209.84756372185979 },
                { id: 41, p0: { x: 645, y: 341 }, p1: { x: 578, y: 501 }, walkable: true, direction: '><', centerPoint: { x: 611.5, y: 421 }, controlPoint: { x: 611.5, y: 421 }, length: 173.46181135915768 },
                { id: 42, p0: { x: 153, y: 584 }, p1: { x: 385, y: 798 }, walkable: true, direction: '><', centerPoint: { x: 269, y: 691 }, controlPoint: { x: 269, y: 691 }, length: 315.6263613832026 },
                { id: 43, p0: { x: 170, y: 263 }, p1: { x: 270, y: 465 }, walkable: true, direction: '><', centerPoint: { x: 220, y: 364 }, controlPoint: { x: 220, y: 364 }, length: 225.39742678211746 },
                { id: 44, p0: { x: 270, y: 465 }, p1: { x: 370, y: 567 }, walkable: true, direction: '><', centerPoint: { x: 320, y: 516 }, controlPoint: { x: 320, y: 516 }, length: 142.84257068535277 },
            ]
        }
    ];

    if ( debugMode === true ) {

        rebuildDebugElements();

    }

    //---

    function initGUI() {
    
        const _addPathSegment = () => {
        
            editorMode = EDITOR_MODE_ENUM.addPathSegment;
        
        }

        const _removePathSegment = () => {

            editorMode = EDITOR_MODE_ENUM.removePathSegment;

        }

        const _bendPathSegment = () => {

            editorMode = EDITOR_MODE_ENUM.bendPathSegment;

        }

        const _straightenPathSegment = () => {

            editorMode = EDITOR_MODE_ENUM.straightenPathSegment;

        }

        const _togglePathWalkable = () => {

            editorMode = EDITOR_MODE_ENUM.togglePathWalkable;

        }

        const _togglePathDirections = () => {

            editorMode = EDITOR_MODE_ENUM.togglePathDirections;

        }

        const _movePoint = () => {
        
            editorMode = EDITOR_MODE_ENUM.movePoint;
        
        }
        
        const _addStartPoint = () => {
        
            editorMode = EDITOR_MODE_ENUM.addStartPoint;
        
        }
        
        const _addEndPoint = () => {
        
            editorMode = EDITOR_MODE_ENUM.addEndPoint;
        
        }

        const _removeStartEndPoints = () => {
        
            editorMode = EDITOR_MODE_ENUM.removeStartEndPoints;
        
        }

        const _setToggleWalkable = () => {
        
            editorMode = EDITOR_MODE_ENUM.togglePointWalkable;
        
        }

        const _getPathSegment = () => {

            editorMode = EDITOR_MODE_ENUM.getPathSegment;

        }
        
        const _clearAll = () => {

            const pathIndex = 0;

            pathHolder[ pathIndex ] = { 
                id: pathIndex,
                routes: [],
                currentPoint: null,
                points: [],
                openSet: [],
                closedSet: [],
                segments: []
            }

            tempPathSegments = [];

            currentPathSegment = null;
            selectedPathSegments = [];

            removeDebugElements();
        
        }

        const _logPath = () => {

            const pathIndex = 0;

            const path = pathHolder[ pathIndex ];

            let output = '';

            output += 'id: ' + pathIndex + ',\n';
            output += 'routes: [' + '\n';

            for ( let i = 0, l = path.routes.length; i < l; i ++ ) {

                const route = path.routes[ i ];

                output += '    { startPoint: { x: ' + route.startPoint.x + ', y: ' + route.startPoint.y + ' }, endPoint: { x: ' + route.endPoint.x + ', y: ' + route.endPoint.y + ' }, pathSegments: [] }';

                if ( i < l ) {

                    output += ',\n';

                } else {

                    output += '\n';

                }

            }

            output += '],' + '\n';

            //output += 'currentPoint: ' + '{ x: ' + path.currentPoint.x + ', y: ' + path.currentPoint.y + ' },' + '\n';
            output += 'currentPoint: ' + '{ x: 0, y: 0 },' + '\n';
            output += 'points: [' + '\n';

            for ( let i = 0, l = path.points.length; i < l; i ++ ) {

                const point = path.points[ i ];

                output += '    { x: ' + point.x + ', y: ' + point.y + ', walkable: ' + point.walkable + ', cost: ' + '0' + ', parentPoint: ' + 'null' + ', visited: ' + 'false' + ' }';

                if ( i < l ) {

                    output += ',\n';

                } else {

                    output += '\n';

                }

            }

            output += '],' + '\n';
            output += 'openSet: [],' + '\n';
            output += 'closedSet: [],' + '\n';
            output += 'segments: [' + '\n';

            for ( let i = 0, l = path.segments.length; i < l; i ++ ) {

                const pathSegment = path.segments[ i ];

                output += '    { id: ' + pathSegment.id + ', p0: ' + '{ x: ' + pathSegment.p0.x + ', y: ' + pathSegment.p0.y + ' }' + ', p1: ' + '{ x: ' + pathSegment.p1.x + ', y: ' + pathSegment.p1.y + ' }' + ', walkable: ' +  pathSegment.walkable + ', direction: "' +  pathSegment.direction + '", centerPoint: ' + '{ x: ' + pathSegment.centerPoint.x + ', y: ' + pathSegment.centerPoint.y + ' }' + ', controlPoint: { x: ' + pathSegment.controlPoint.x + ', y: ' + pathSegment.controlPoint.y + ' }, length: ' + pathSegment.length + ' }';

                if ( i < l ) {

                    output += ',\n';

                } else {

                    output += '\n';

                }

            }

            output += ']' + '\n';

            output = output.replace( /"/g, "'" );

            console.log( '-------------------------------------------------------------------------------------------------------------------------------\n' );
            console.log( output );
            console.log( '-------------------------------------------------------------------------------------------------------------------------------\n' );

        }

        const _findPath = () => {

            editorMode = EDITOR_MODE_ENUM.findPath;
        
        }

        const _toggleDebugMode = () => {
            
            debugMode = !debugMode;

            if ( debugMode === true ) {

                rebuildDebugElements();

            } else {

                removeDebugElements();

            }
        
        }
        
        const _linkTo = () => {
        
            window.open( 'https://twitter.com/niklaswebdev', '_blank' );
        
        }

        //---
        
        const guiSetting = {
                
            'Add Path Segment': _addPathSegment,
            'Remove Path Segment': _removePathSegment,
            'Bend Path Segment': _bendPathSegment,
            'Straighten Path Segment': _straightenPathSegment,
            'Toggle Path Walkable': _togglePathWalkable,
            'Toggle Path Directions': _togglePathDirections,
            'Move Point': _movePoint,
            'Add Start Point': _addStartPoint,
            'Add End Point': _addEndPoint,
            'Remove Start & End Points': _removeStartEndPoints,
            'Toggle Walkable Point': _setToggleWalkable,
            'Clear All': _clearAll,
            'Get PathSegment': _getPathSegment,
            'Log Path': _logPath,
            'Find Path': _findPath,
            'Toggle Debug Mode': _toggleDebugMode,
            '@niklaswebdev': _linkTo
            
        }

        const gui = new dat.GUI();

        const folderEdit = gui.addFolder( 'Edit' );

        folderEdit.open();
        folderEdit.add( guiSetting, 'Add Path Segment' );
        folderEdit.add( guiSetting, 'Remove Path Segment' );
        folderEdit.add( guiSetting, 'Bend Path Segment' );
        folderEdit.add( guiSetting, 'Straighten Path Segment' );
        folderEdit.add( guiSetting, 'Toggle Path Walkable' );
        folderEdit.add( guiSetting, 'Toggle Path Directions' );
        folderEdit.add( guiSetting, 'Move Point' );
        folderEdit.add( guiSetting, 'Add Start Point' );
        folderEdit.add( guiSetting, 'Add End Point' );
        folderEdit.add( guiSetting, 'Remove Start & End Points' );
        folderEdit.add( guiSetting, 'Toggle Walkable Point' );
        folderEdit.add( guiSetting, 'Clear All' );

        const folderAnalyze = gui.addFolder( 'Analyze' );

        folderAnalyze.open();
        folderAnalyze.add( guiSetting, 'Get PathSegment' );
        folderAnalyze.add( guiSetting, 'Log Path' );
        folderAnalyze.add( guiSetting, 'Find Path' );
        folderAnalyze.add( guiSetting, 'Toggle Debug Mode' );

        const folderContact = gui.addFolder( 'Contact' );

        //folderContact.open();
        folderContact.add( guiSetting, '@niklaswebdev' );

        //gui.close();

    }

    //---

    function init() {
        
        canvas.addEventListener( 'mousedown', mouseDownHandler, false );
        canvas.addEventListener( 'mouseup', mouseUpHandler, false );
        canvas.addEventListener( 'mousemove', mouseMoveHandler, false );

        document.body.appendChild( canvas );

        window.addEventListener( 'resize', onResize, false );

        restart();

    }

    function onResize( event ) {
        
        restart();

    }

    function restart() {

        width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

        canvas.width = width;
        canvas.height = height;

        imageData = context.getImageData( 0, 0, width, height );
        data = imageData.data;
        
        //---

        border.right = width;
        border.bottom = height;

        //---
        
        if ( animationFrame !== null ) {
        
            cancelAnimFrame( animationFrame );
        
        }
        
        animationFrame = requestAnimFrame( render );

    }

    //---

    function findPath( position ) {

        console.log( '\n\n\n\n\n\n\nfindPath()' );

        tempPathSegments = [];

        //---

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        //---

        path.openSet = [];
        path.closedSet = [];
        path.segmentsStartToEnd = [];

        for ( let i = 0, l = path.points.length; i < l; i ++ ) {

            const point = path.points[ i ];

            point.cost = Infinity;
            point.parentPoint = null;
            point.visited = false;

        }

        //---

        path.currentPoint = null;

        let routeIndex = 0;
        let routeColor = null;

        const pointFound = getPointByPosition( position );

        if ( pointFound === null ) {

            return;

        }

        for ( let i = 0, l = path.routes.length; i < l; i ++ ) {

            const route = path.routes[ i ];

            if ( route.startPoint === null || route.endPoint === null ) {

                continue;

            }

            if ( route.startPoint.x === pointFound.x && route.startPoint.y === pointFound.y || route.endPoint.x === pointFound.x && route.endPoint.y === pointFound.y ) {

                path.currentPoint = getPointByPosition( route.startPoint );

                routeIndex = i;
                routeColor = PATH_COLORS[ i ];

            } 

        }

        if ( path.currentPoint === null ) {

            return;

        }

        path.currentPoint.cost = 0;

        path.openSet.push( path.currentPoint );

        //---

        while ( path.openSet.length > 0 ) {

            // console.log( '______________________________________', path.openSet.length );

            path.currentPoint = path.openSet.find( point => point.cost === Math.min( ...path.openSet.map( nextPoint => nextPoint.cost ) ) );
            path.currentPoint.visited = true;

            // for ( let i = 0, l = path.openSet.length; i < l; i ++ ) {

            //     console.log( '--->>> ', path.openSet[ i ].x, path.openSet[ i ].y, path.openSet[ i ].visited, path.openSet[ i ].cost);

            // }

            // console.log( path.currentPoint );
            // console.log( 'path.currentPoint: ', path.currentPoint.x, path.currentPoint.y, path.currentPoint.visited );
            // console.log( path.endPoint );

            //---

            const nextPathSegments = getNextPathSegmentsByPoint( path.currentPoint, path.segments );

            if ( nextPathSegments.length > 0 ) {

                const nextPoints = getNextPointsByPointAndPathSegments( path.currentPoint, nextPathSegments );

                // console.log( '--_>>> ', nextPoints.length );

                for ( let i = 0, l = nextPoints.length; i < l; i ++ ) {

                    const nextPoint = getPointByPosition( nextPoints[ i ] );

                    if ( nextPoint.visited === false && nextPoint.walkable === true ) {

                        const nextDistance = path.currentPoint.cost + getDistance( nextPoint, path.currentPoint );

                        if ( nextDistance < nextPoint.cost ) {

                            nextPoint.parentPoint = path.currentPoint;

                            nextPoint.cost = nextDistance;

                        } 

                        path.openSet.push( nextPoint );

                    }

                }

            } 

            path.openSet.splice( path.openSet.findIndex( ( point ) => point.x === path.currentPoint.x && point.y === path.currentPoint.y ), 1 );

        }

        //---

        const routeEndPoint = getPointByPosition( path.routes[ routeIndex ].endPoint );

        if ( routeEndPoint.parentPoint !== null ) {

            console.log( 'FOUND END' );

            const pathToEnd = [];

            let currentPoint = routeEndPoint;

            while ( currentPoint !== null ) {

                pathToEnd.push( currentPoint );

                currentPoint = currentPoint.parentPoint;

            }

            pathToEnd.reverse();

            path.routes[ routeIndex ].pathSegments = [];

            for ( let i = 0, l = pathToEnd.length - 1; i < l; i ++ ) {

                const point0 = pathToEnd[ i ];
                const point1 = pathToEnd[ i + 1 ];

                const pathSegment = getPathSegmentByPoints( point0, point1 );

                path.routes[ routeIndex ].pathSegments.push( pathSegment );

                console.log( path.routes[ routeIndex ].pathSegments[ path.routes[ routeIndex ].pathSegments.length - 1 ] );

                //tempPathSegments.push( { type: 'line', p0: { x: point0.x, y: point0.y }, p1: { x: point1.x, y: point1.y }, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );
                tempPathSegments.push( { type: 'bezier', p0: { x: point0.x, y: point0.y }, controlPoint: { x: pathSegment.controlPoint.x, y: pathSegment.controlPoint.y }, p1: { x: point1.x, y: point1.y }, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );
                tempPathSegments.push( { type: 'circ', position: { x: point0.x, y: point0.y }, diameter: 15, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );
                tempPathSegments.push( { type: 'circ', position: { x: point1.x, y: point1.y }, diameter: 15, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );

            }

        }

    }

    //---

    function getPathSegmentByPoints( p0, p1 ) {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        let result = null;

        for ( let i = 0, l = path.segments.length; i < l; i ++ ) {

            const pathSegment = path.segments[ i ];

            let p0Found = false;
            let p1Found = false;

            if ( pathSegment.p0.x === p0.x && pathSegment.p0.y === p0.y || pathSegment.p1.x === p0.x && pathSegment.p1.y === p0.y ) {

                p0Found = true;

            }

            if ( pathSegment.p0.x === p1.x && pathSegment.p0.y === p1.y || pathSegment.p1.x === p1.x && pathSegment.p1.y === p1.y ) {

                p1Found = true;

            }

            if ( p0Found === true && p1Found === true ) {

                result = pathSegment;

            }

        }

        return result;

    }

    function getPathSegmentPoint( position, walkable = true, cost = 0, parentPoint = null, visited = false ) {

        const point = {

            x: position.x,
            y: position.y,
            walkable: walkable,
            cost: cost,
            parentPoint: parentPoint,
            visited: visited

        };

        return point;

    }

    function getNextPathSegmentsByPoint( point, pathSegments ) {

        const pathSegmentsFound = [];

        for ( let i = 0, l = pathSegments.length; i < l; i ++ ) {

            const pathSegment = pathSegments[ i ];

            if ( pathSegment.walkable === true ) {

                if ( point.x === pathSegment.p0.x && point.y === pathSegment.p0.y ) {

                    pathSegmentsFound.push( pathSegment );

                } else if ( point.x === pathSegment.p1.x && point.y === pathSegment.p1.y ) {

                    pathSegmentsFound.push( pathSegment );

                }

            }

        }

        return pathSegmentsFound;

    }

    function getNextPointsByPointAndPathSegments( point, nextPathSegments ) {

        const pointsFound = [];

        for ( let i = 0, l = nextPathSegments.length; i < l; i ++ ) {

            const nextPathSegment = nextPathSegments[ i ];

            if ( point.x === nextPathSegment.p0.x && point.y === nextPathSegment.p0.y ) {

                if ( nextPathSegment.direction === '><' || nextPathSegment.direction === '>' ) {

                    pointsFound.push( nextPathSegment.p1 );

                }

            } else if ( point.x === nextPathSegment.p1.x && point.y === nextPathSegment.p1.y ) {

                if ( nextPathSegment.direction === '><' || nextPathSegment.direction === '<' ) {

                    pointsFound.push( nextPathSegment.p0 );

                }

            }

        }

        return pointsFound;

    }

    function getPointByPosition( position ) {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        let point = null;

        for ( let i = 0, l = path.points.length; i < l; i ++ ) {

            const p = path.points[ i ];

            if ( p.x === position.x && p.y === position.y ) {

                point = p;

            }
        }

        return point;

    }

    //---

    function addPathSegment( position ) {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];
        
        if ( currentPathSegment === null ) {

            const pathSegmentPointNew = getPathSegmentPoint( position );
            const pathSegmentPointArray = path.points.find( ( point ) => point.x === position.x && point.y === position.y );

            let pathSegmentPoint = pathSegmentPointArray;

            if ( typeof pathSegmentPoint === 'undefined' ) {

                pathSegmentPoint = pathSegmentPointNew;

                path.points.push( pathSegmentPoint );

            }

            currentPathSegment = {};
            currentPathSegment.id = path.segments.length;
            currentPathSegment.p0 = { x: pathSegmentPoint.x, y: pathSegmentPoint.y };
            currentPathSegment.p1 = null;

            path.segments.push( currentPathSegment );

            if ( debugMode === true ) {

                addDebugElement( position.x, position.y, position.x.toString() + ', ' + position.y.toString(), 'white', 0, 9, null );

            } 
        
        } else {

            const pathSegmentPointNew = getPathSegmentPoint( position );
            const pathSegmentPointArray = path.points.find( ( point ) => point.x === position.x && point.y === position.y );

            let pathSegmentPoint = pathSegmentPointArray;

            if ( typeof pathSegmentPoint === 'undefined' ) {

                pathSegmentPoint = pathSegmentPointNew;

                path.points.push( pathSegmentPoint );

            }

            currentPathSegment.p1 = { x: pathSegmentPoint.x, y: pathSegmentPoint.y };
            currentPathSegment.centerPoint = getPathSegmentCenter( currentPathSegment );
            currentPathSegment.controlPoint = getPathSegmentCenter( currentPathSegment );
            currentPathSegment.length = getPathSegmentLength( currentPathSegment.p0, currentPathSegment.p1, currentPathSegment.controlPoint ); //getDistance( currentPathSegment.p0, currentPathSegment.p1 );
            currentPathSegment.walkable = true;
            currentPathSegment.direction = '><';

            if ( debugMode === true ) {

                addDebugElement( position.x, position.y, position.x.toString() + ', ' + position.y.toString(), 'white', 0, 9, null );
                addDebugElement( currentPathSegment.centerPoint.x, currentPathSegment.centerPoint.y, currentPathSegment.id.toString(), 'white', -4, -6, null );
                
                addDebugElement( currentPathSegment.centerPoint.x, currentPathSegment.centerPoint.y, currentPathSegment.length.toFixed( 2 ).toString(), 'grey', 10, -5, null );

            } 

            currentPathSegment = null;
        
        }

    }

    function removePathSegment( position ) {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        const pathSegment = getPathSegmentByPosition( position );

        if ( pathSegment !== null ) {

            let p0Found = getPointByPosition( pathSegment.p0 );
            let p1Found = getPointByPosition( pathSegment.p1 );

            for ( let i = 0, l = path.segments.length; i < l; i ++ ) {

                const pS = path.segments[ i ];

                if ( pS.id !== pathSegment.id ) {

                    if ( pathSegment.p0.x === pS.p0.x && pathSegment.p0.y === pS.p0.y || pathSegment.p0.x === pS.p1.x && pathSegment.p0.y === pS.p1.y ) {

                        p0Found = null;

                    }

                    if ( pathSegment.p1.x === pS.p0.x && pathSegment.p1.y === pS.p0.y || pathSegment.p1.x === pS.p1.x && pathSegment.p1.y === pS.p1.y ) {

                        p1Found = null;

                    }

                }

            }

            path.segments.splice( path.segments.findIndex( ( pS ) => pS.id === pathSegment.id ), 1 );

            if ( p0Found !== null ) {

                path.points.splice( path.points.findIndex( ( point ) => point.x === p0Found.x && point.y === p0Found.y ), 1 );

            }

            if ( p1Found !== null ) {

                path.points.splice( path.points.findIndex( ( point ) => point.x === p1Found.x && point.y === p1Found.y ), 1 );

            }

            for ( let i = 0, l = path.segments.length; i < l; i ++ ) {

                path.segments[ i ].id = i;

            }

        }

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

        tempPathSegments = [];

    }

    function bendPathSegment( position ) {

        const pathSegment = currentPathSegment;

        if ( pathSegment !== null ) {

            pathSegment.controlPoint.x = position.x;
            pathSegment.controlPoint.y = position.y;

            pathSegment.centerPoint = interpolateQuadraticBezier( pathSegment.p0, pathSegment.controlPoint, pathSegment.p1, 0.50 );

            pathSegment.length = getPathSegmentLength( pathSegment.p0, pathSegment.p1, pathSegment.controlPoint );

        }

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

        tempPathSegments = [];

        tempPathSegments.push( { type: 'line', p0: { x: pathSegment.p0.x, y: pathSegment.p0.y }, p1: { x: pathSegment.controlPoint.x, y: pathSegment.controlPoint.y }, color: { r: 230, g: 29, b: 95, a: 255 } } );
        tempPathSegments.push( { type: 'line', p0: { x: pathSegment.p1.x, y: pathSegment.p1.y }, p1: { x: pathSegment.controlPoint.x, y: pathSegment.controlPoint.y }, color: { r: 230, g: 29, b: 95, a: 255 } } );
        tempPathSegments.push( { type: 'circfill', position: { x: pathSegment.controlPoint.x, y: pathSegment.controlPoint.y }, diameter: 3, color: { r: 230, g: 29, b: 95, a: 255 } } );
        tempPathSegments.push( { type: 'bezier', p0: { x: pathSegment.p0.x, y: pathSegment.p0.y }, controlPoint: { x: pathSegment.controlPoint.x, y: pathSegment.controlPoint.y }, p1: { x: pathSegment.p1.x, y: pathSegment.p1.y }, color: { r: 255, g: 255, b: 255, a: 255 } } );

    }

    function straightenPathSegment( position ) {

        const pathSegment = getPathSegmentByPosition( position );

        if ( pathSegment !== null ) {

            const centerPoint = getPathSegmentCenter( pathSegment );

            pathSegment.centerPoint = centerPoint;
            pathSegment.controlPoint = centerPoint;

            pathSegment.length = getPathSegmentLength( pathSegment.p0, pathSegment.p1, pathSegment.controlPoint );

        }

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

        tempPathSegments = [];

    }

    //---

    function addStartPointToPath( position ) {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        //---

        const route = { startPoint: null, endPoint: null, pathSegments: [] };

        const startPoint = getPointByPosition( position );

        if ( startPoint !== null ) {

            route.startPoint = { 

                x: startPoint.x,
                y: startPoint.y

            };

            path.routes.push( route );

        }

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

    }

    function addEndPointToPath( position ) {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        //---

        let routeIndex = 0;

        for ( let i = 0, l = path.routes.length; i < l; i ++ ) {

            const route = path.routes[ i ];

            if ( route.endPoint === null ) {

                routeIndex = i;

                break;

            }

        }

        const route = path.routes[ routeIndex ];

        const endPoint = getPointByPosition( position );

        if ( endPoint !== null ) {

            route.endPoint = { 

                x: endPoint.x,
                y: endPoint.y
            };

        }

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

    }

    function removeStartEndPoints( position ) {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        //---

        let routeIndex = 0;

        for ( let i = 0, l = path.routes.length; i < l; i ++ ) {

            const route = path.routes[ i ];

            if ( route.startPoint.x === position.x && route.startPoint.y === position.y ) {

                routeIndex = i;

                break;

            }

            if ( route.endPoint !== null ) {

                if ( route.endPoint.x === position.x && route.endPoint.y === position.y ) {

                    routeIndex = i;

                    break;

                }

            }

        }

        path.routes.splice( routeIndex, 1 );

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

    }

    function addCurrentPointToPath( position ) {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        const point = getPointByPosition( position );

        if ( point !== null ) {

            path.currentPoint = point;

        }

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

    }

    function addSelectedPathSegments( position ) {

        selectedPathSegments = [];

        //---

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        for ( let i = 0, l = path.segments.length; i < l; i ++ ) {

            const pathSegment = path.segments[ i ];

            if ( pathSegment.p0.x === position.x && pathSegment.p0.y === position.y ) {

                selectedPathSegments.push( pathSegment );

            } else if ( pathSegment.p1.x === position.x && pathSegment.p1.y === position.y ) {

                selectedPathSegments.push( pathSegment );

            }

        }

    }

    function removeSelectedPathSegments( position ) {

        selectedPathSegments = [];

    }

    function movePoint( position ) {

        tempPathSegments = [];

        //---

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        const point = path.currentPoint;

        if ( point !== null ) {

            const pointOldX = point.x;
            const pointOldY = point.y;

            point.x = position.x;
            point.y = position.y;

            for ( let i = 0, l = path.routes.length; i < l; i ++ ) {

                const route = path.routes[ i ];

                if ( route.startPoint.x === pointOldX && route.startPoint.y === pointOldY ) {

                    route.startPoint.x = point.x;
                    route.startPoint.y = point.y;

                }

                if ( route.endPoint.x === pointOldX && route.endPoint.y === pointOldY ) {

                    route.endPoint.x = point.x;
                    route.endPoint.y = point.y;

                }

            }

            for ( let i = 0, l = selectedPathSegments.length; i < l; i ++ ) {

                const pathSegment = selectedPathSegments[ i ];

                let diffX = 0;
                let diffY = 0;

                if ( pathSegment.p0.x === pointOldX && pathSegment.p0.y === pointOldY ) {

                    diffX = point.x - pathSegment.p0.x;
                    diffY = point.y - pathSegment.p0.y;

                    pathSegment.p0.x = point.x;
                    pathSegment.p0.y = point.y;

                } else if ( pathSegment.p1.x === pointOldX && pathSegment.p1.y === pointOldY ) {

                    diffX = point.x - pathSegment.p1.x;
                    diffY = point.y - pathSegment.p1.y;

                    pathSegment.p1.x = point.x;
                    pathSegment.p1.y = point.y;

                }

                pathSegment.length = getPathSegmentLength( pathSegment.p0, pathSegment.p1, pathSegment.controlPoint );// getDistance( pathSegment.p0, pathSegment.p1 );
                //pathSegment.centerPoint = getPathSegmentCenter( pathSegment );
                pathSegment.centerPoint = interpolateQuadraticBezier( pathSegment.p0, pathSegment.controlPoint, pathSegment.p1, 0.50 );

                pathSegment.controlPoint.x += diffX / 2;
                pathSegment.controlPoint.y += diffY / 2;

                //tempPathSegments.push( { type: 'circfill', position: { x: pathSegment.controlPoint.x, y: pathSegment.controlPoint.y }, diameter: 3, color: { r: 230, g: 29, b: 95, a: 255 } } );

                getPathSegmentsIntersectionPoints( pathSegment, 25 );
                //getPathSegmentsIntersectionPoints( pathSegment, 5 );

            }

            //---

            if ( debugMode === true ) {

                rebuildDebugElements();

            }

            //tempPathSegments = [];

        }

    }

    function togglePointWalkable( position ) {

        tempPathSegments = [];

        //---

        //const pathIndex = 0;

        //const path = pathHolder[ pathIndex ];

        const point = getPointByPosition( position );

        if ( point !== null ) {

            point.walkable = !point.walkable;

        }

    }

    function togglePathWalkable( position ) {

        tempPathSegments = [];

        //---

        //const pathIndex = 0;

        //const path = pathHolder[ pathIndex ];

        const pathSegment = getPathSegmentByPosition( position );

        if ( pathSegment !== null ) {

            pathSegment.walkable = !pathSegment.walkable;

        }

    }

    function togglePathDirections( position ) {

        tempPathSegments = [];

        //---

        //const pathIndex = 0;

        //const path = pathHolder[ pathIndex ];

        const pathSegment = getPathSegmentByPosition( position );

        if ( pathSegment !== null ) {

            let pathDirectionIndex = PATH_DIRECTIONS.findIndex( ( direction ) => direction === pathSegment.direction );

            pathDirectionIndex += 1;

            if ( pathDirectionIndex > PATH_DIRECTIONS.length - 1 ) {

                pathDirectionIndex = 0;

            }

            pathSegment.direction = PATH_DIRECTIONS[ pathDirectionIndex ];

        }

    }

    function getPathSegmentByPosition( position ) {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        let distanceTotal = Infinity;
        let indexSave = -1;

        for ( let i = 0, l = path.segments.length; i < l; i ++ ) {

            const pathSegment = path.segments[ i ];

            //const distanceToPathSegment = signedDistanceToLine( position, pathSegment.p0.x, pathSegment.p0.y, pathSegment.p1.x, pathSegment.p1.y );
            const distanceToPathSegment = signedDistanceToQuadraticBezier( position, pathSegment.p0, pathSegment.p1, pathSegment.controlPoint );

            if ( distanceToPathSegment < distanceTotal ) {

                distanceTotal = distanceToPathSegment;

                indexSave = i;

            }

        }

        if ( indexSave > -1 && distanceTotal <= SNAP_TO_DISTANCE ) {

            return path.segments[ indexSave ];

        }

        return null;

    }

    //---

    function rebuildDebugElements() {

        removeDebugElements();

        //---

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        //---

        for ( let i = 0, l = path.routes.length; i < l; i ++ ) {

            const route = path.routes[ i ];
            const routeColor = PATH_COLORS[ i ];

            if ( route.startPoint !== null ) {

                addDebugElement( route.startPoint.x, route.startPoint.y, 'START ' + ( i + 1 ).toString(), 'white', -15, -25, null );

            }

            if ( route.endPoint !== null ) {

                addDebugElement( route.endPoint.x, route.endPoint.y, 'END ' + ( i + 1 ).toString(), 'white', -15, -25, null );

            }

        }

        //---

        path.segments.forEach( ( pathSegment, index ) => {

            if ( index < path.segments.length - 1 ) {

                addDebugElement( pathSegment.p0.x, pathSegment.p0.y, pathSegment.p0.x.toString() + ', ' + pathSegment.p0.y.toString(), 'white', 0, 9, null );
                addDebugElement( pathSegment.p1.x, pathSegment.p1.y, pathSegment.p1.x.toString() + ', ' + pathSegment.p1.y.toString(), 'white', 0, 9, null );

            } else {

                addDebugElement( pathSegment.p0.x, pathSegment.p0.y, pathSegment.p0.x.toString() + ', ' + pathSegment.p0.y.toString(), 'white', 0, 9, null );
                addDebugElement( pathSegment.p1.x, pathSegment.p1.y, pathSegment.p1.x.toString() + ', ' + pathSegment.p1.y.toString(), 'white', 0, 9, null );

            }

            addDebugElement( pathSegment.centerPoint.x, pathSegment.centerPoint.y, pathSegment.id.toString(), 'white', -4, -6, null );
            addDebugElement( pathSegment.centerPoint.x, pathSegment.centerPoint.y, pathSegment.length.toFixed( 2 ).toString(), 'grey', 10, -5, null );

        } );

    }

    function removeDebugElements() {

        debugElements.forEach( ( debugElement, index ) => {

            document.body.removeChild( debugElement );

        } );

        debugElements = [];

    }

    function addDebugElement( x, y, message, color = 'white', offsetX = 0, offsetY = 0, className = null ) {

        const debugElement = document.createElement( 'div' );

        debugElement.style.position = 'absolute';
        debugElement.style.left = ( x + offsetX ).toString() + 'px';
        debugElement.style.top = ( y + offsetY ).toString() + 'px';
        debugElement.style.color = color;
        debugElement.style.fontSize = '8pt';
        debugElement.style.pointerEvents = 'none';

        if ( className === null ) {

            debugElement.className = 'debug-' + ( new Date().getTime() + debugElements.length ).toString();

        } else {

            debugElement.className = 'debug-' + className.toString();

        }

        debugElement.innerHTML = message;

        document.body.appendChild( debugElement );

        debugElements.push( debugElement );

    }

    //---

    function getDistance( p0, p1 ) {

        const a = p0.x - p1.x;
        const b = p0.y - p1.y;

        return Math.sqrt( a * a + b * b );
    
    }

    function getPathSegmentLength( p0, p1, controlPoint ) {

        //return getDistance( p0, p1 );

        //---

        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        
        const cx = ( dx === 0 ) ? 0 : ( controlPoint.x - p0.x ) / dx;
        const cy = ( dy === 0 ) ? 0 : ( controlPoint.y - p0.y ) / dy;
        
		let d = 0;
		var p = p0;
		var np = null;

		for ( let i = 1; i < PATH_SEGMENT_CURVE_ACCURACY; i++ ) {

			const t = i / PATH_SEGMENT_CURVE_ACCURACY;
			const f1 = 2 * t * ( 1 - t );
            const f2 = t * t;
            
			np = { x: p0.x + dx * ( f1 * cx + f2 ), y: p0.y + dy * ( f1 * cy + f2 ) };
			d += getDistance( p, np );
            p = np;
            
        }
        
		return d + getDistance( p, p1 );

    }

    function getPathSegmentCenter( pathSegment ) {

        const x = ( pathSegment.p0.x + pathSegment.p1.x ) / 2;
        const y = ( pathSegment.p0.y + pathSegment.p1.y ) / 2;
    
        return { x: x, y: y };
    
    }

    function getLinesIntersectionPoint( x1, y1, x2, y2, x3, y3, x4, y4 ) {

        // Check if none of the lines are of length 0
        if ( ( x1 === x2 && y1 === y2 ) || ( x3 === x4 && y3 === y4 ) ) {

            return null;

        }

        const denominator = ( ( y4 - y3 ) * ( x2 - x1 ) - ( x4 - x3 ) * ( y2 - y1 ) );

        // Lines are parallel
        if ( denominator === 0 ) {

            return null;

        }

        const ua = ( ( x4 - x3 ) * ( y1 - y3 ) - ( y4 - y3 ) * ( x1 - x3 ) ) / denominator;
        const ub = ( ( x2 - x1 ) * ( y1 - y3 ) - ( y2 - y1 ) * ( x1 - x3 ) ) / denominator;

        // is the intersection along the segments
        if ( ua < 0 || ua > 1 || ub < 0 || ub > 1 ) {

            return null

        }

        // Return a object with the x and y coordinates of the intersection
        return { 
            x: x1 + ua * ( x2 - x1 ), 
            y: y1 + ua * ( y2 - y1 ) 
        };
        
    }

    function getPathSegmentsIntersectionPoints( inputPathSegment, precision = 25 ) {

        //tempPathSegments = [];

        //---

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        //---

        const intersectionPoints = [];

        for ( let iI = 0, iIStep = 1 / precision; iI < 1 + iIStep; iI += iIStep ) {

            if ( iI > 0 ) {

                const tempInputPathSegment = {};

                tempInputPathSegment.id = inputPathSegment.id;
                tempInputPathSegment.p0 = interpolateQuadraticBezier( inputPathSegment.p0, inputPathSegment.controlPoint, inputPathSegment.p1, iI - iIStep );
                tempInputPathSegment.p1 = interpolateQuadraticBezier( inputPathSegment.p0, inputPathSegment.controlPoint, inputPathSegment.p1, iI );

                //tempPathSegments.push( { type: 'line', p0: { x: tempInputPathSegment.p0.x | 0, y: tempInputPathSegment.p0.y | 0 }, p1: { x: tempInputPathSegment.p1.x | 0, y: tempInputPathSegment.p1.y | 0 }, color: { r: 255, g: 0, b: 0, a: 255 } } );
                //tempPathSegments.push( { type: 'circfill', position: { x: tempInputPathSegment.p0.x | 0, y: tempInputPathSegment.p0.y | 0 }, diameter: 9, color: { r: 255, g: 0, b: 0, a: 255 } } );
                
                for ( let i = 0, l = path.segments.length; i < l; i ++ ) {

                    const comparePathSegment = path.segments[ i ];

                    for ( let iC = 0, iCStep = 1 / precision; iC < 1 + iCStep; iC += iCStep ) {

                        if ( iC > 0 ) {
            
                            const tempComparePathSegment = {};
            
                            tempComparePathSegment.id = comparePathSegment.id;
                            tempComparePathSegment.p0 = interpolateQuadraticBezier( comparePathSegment.p0, comparePathSegment.controlPoint, comparePathSegment.p1, iC - iCStep );
                            tempComparePathSegment.p1 = interpolateQuadraticBezier( comparePathSegment.p0, comparePathSegment.controlPoint, comparePathSegment.p1, iC );

                            if ( tempInputPathSegment.id !== tempComparePathSegment.id ) {

                                //tempPathSegments.push( { type: 'line', p0: { x: tempComparePathSegment.p0.x | 0, y: tempComparePathSegment.p0.y | 0 }, p1: { x: tempComparePathSegment.p1.x | 0, y: tempComparePathSegment.p1.y | 0 }, color: { r: 255, g: 0, b: 0, a: 255 } } );

                                const intersectionPoint = getLinesIntersectionPoint( tempInputPathSegment.p0.x, tempInputPathSegment.p0.y, tempInputPathSegment.p1.x, tempInputPathSegment.p1.y, tempComparePathSegment.p0.x, tempComparePathSegment.p0.y, tempComparePathSegment.p1.x, tempComparePathSegment.p1.y );

                                if ( intersectionPoint !== null ) {

                                    if ( intersectionPoint.x !== tempComparePathSegment.p0.x && intersectionPoint.y !== tempComparePathSegment.p0.y || intersectionPoint.x !== tempComparePathSegment.p1.x && intersectionPoint.y !== tempComparePathSegment.p1.y ) {

                                        //console.log( intersectionPoint );

                                        tempPathSegments.push( { type: 'circfill', position: { x: intersectionPoint.x, y: intersectionPoint.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );


                                    }

                                    
                                }

                            }

                        }

                    }

                }
                


                
                //drawLine( c1.x | 0, c1.y | 0, c2.x | 0, c2.y | 0, r, g, b, a );

                // for ( let i = 0, l = path.segments.length; i < l; i ++ ) {

                //     const pathSegment = path.segments[ i ];

            }

        }

    }

    // function signedDistanceToLine( p, p0X, p0Y, p1X, p1Y ) {

    //     const p0p1X = p0X - p1X;
    //     const p0p1Y = p0Y - p1Y;

    //     const l2 = p0p1X * p0p1X + p0p1Y * p0p1Y;

    //     const pp0X = p.x - p0X;
    //     const pp0Y = p.y - p0Y;

    //     if ( l2 === 0 ) {

    //         return pp0X * pp0X + pp0Y * pp0Y;

    //     }

    //     const p1p0X = p1X - p0X;
    //     const p1p0Y = p1Y - p0Y;

    //     const t = clamp( ( pp0X * p1p0X + pp0Y * p1p0Y ) / l2, 0, 1 );

    //     const ptX = p0X + t * p1p0X;
    //     const ptY = p0Y + t * p1p0Y;

    //     const pX = p.x - ptX;
    //     const pY = p.y - ptY;

    //     return Math.sqrt( pX * pX + pY * pY );

    // }

    function signedDistanceToQuadraticBezier( p, p0, p1, pControl, precision = 25 ) {

        let distance = Infinity;

        for ( let i = 0, l = 1 / precision; i < 1 + l; i += l ) {

            const pOnBezier = interpolateQuadraticBezier( p0, pControl, p1, i );

            const d = getDistance( p, pOnBezier );

            if ( distance > d ) {

                distance = d;

            }

        }

        return distance;

    }

    //---

    function clamp( val, min, max ) {

        return Math.min( Math.max( min, val ), max );

    }
    
    // function interpolateLine( a, b, frac ) {

    //     const nx = a.x + ( b.x - a.x ) * frac;
    //     const ny = a.y + ( b.y - a.y ) * frac;

    //     return { x: nx,  y: ny };

    // }

    function interpolateQuadraticBezier( sv, cv, ev, t ) {

        const t1 = 1 - t;
        const t1pow = t1 * t1;
        const tpow = t * t;
        const t2 = 2 * t1 * t;
            
        return {

            x: t1pow * sv.x + t2 * cv.x + tpow * ev.x,
            y: t1pow * sv.y + t2 * cv.y + tpow * ev.y

        };

    }

    //---






    //---

    function mouseDownHandler( event ) {

        mouseDown = true;

        //---

        if ( editorMode === EDITOR_MODE_ENUM.addPathSegment ) {

            addPathSegment( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.addStartPoint ) {

            addStartPointToPath( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.addEndPoint ) {

            addEndPointToPath( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.getPathSegment ) {

            //---

        } else if ( editorMode === EDITOR_MODE_ENUM.togglePointWalkable ) {

            togglePointWalkable( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.removePathSegment ) {

            removePathSegment( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.movePoint ) {

            addCurrentPointToPath( mouseCursor.position );
            addSelectedPathSegments( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.togglePathWalkable ) {

            togglePathWalkable( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.togglePathDirections ) {

            togglePathDirections( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.findPath ) {

            //---

        } else if ( editorMode === EDITOR_MODE_ENUM.removeStartEndPoints ) {

            removeStartEndPoints( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.bendPathSegment ) {

            currentPathSegment = getPathSegmentByPosition( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.straightenPathSegment ) {

            straightenPathSegment( mouseCursor.position );

        }

    }

    function mouseUpHandler( event ) {

        mouseDown = false;

        //---

        if ( editorMode === EDITOR_MODE_ENUM.bendPathSegment ) {

            currentPathSegment = null;

            tempPathSegments = [];

        } else if ( editorMode === EDITOR_MODE_ENUM.movePoint ) {

            removeSelectedPathSegments();

        }

    }

    function mouseMoveHandler( event ) {

        mousePos = getMousePos( canvas, event );

        //---

        if ( editorMode === EDITOR_MODE_ENUM.getPathSegment || 
             editorMode === EDITOR_MODE_ENUM.removePathSegment || 
             editorMode === EDITOR_MODE_ENUM.togglePathWalkable || 
             editorMode === EDITOR_MODE_ENUM.togglePathDirections || 
             ( editorMode === EDITOR_MODE_ENUM.bendPathSegment && mouseDown === false ) ||
             editorMode === EDITOR_MODE_ENUM.straightenPathSegment ) {

            tempPathSegments = [];

            //---

            const pathSegment = getPathSegmentByPosition( mousePos );

            if ( pathSegment !== null ) {

                //tempPathSegments.push( { type: 'line', p0: { x: pathSegment.p0.x, y: pathSegment.p0.y }, p1: { x: pathSegment.p1.x, y: pathSegment.p1.y  }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                tempPathSegments.push( { type: 'bezier', p0: { x: pathSegment.p0.x, y: pathSegment.p0.y }, controlPoint: { x: pathSegment.controlPoint.x, y: pathSegment.controlPoint.y }, p1: { x: pathSegment.p1.x, y: pathSegment.p1.y }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                tempPathSegments.push( { type: 'circ', position: { x: pathSegment.p0.x, y: pathSegment.p0.y }, diameter: 12, color: { r: 255, g: 0, b: 255, a: 255 }  } );
                tempPathSegments.push( { type: 'circ', position: { x: pathSegment.p1.x, y: pathSegment.p1.y }, diameter: 12, color: { r: 0, g: 255, b: 255, a: 255 }  } );

            }

        } else if ( editorMode === EDITOR_MODE_ENUM.movePoint ) {

            if ( mouseDown === true ) { 

                movePoint( mousePos );

            }

        } else if ( editorMode === EDITOR_MODE_ENUM.findPath ) {

            findPath( mouseCursor.position );

        } 
        
        if ( editorMode === EDITOR_MODE_ENUM.bendPathSegment ) {

            if ( mouseDown === true ) { 

                bendPathSegment( mousePos );

            }

        }

    }

    function getMousePos( canvas, event ) {

        const rect = canvas.getBoundingClientRect();

        return { x: event.clientX - rect.left, y: event.clientY - rect.top };

    }

    //---

    function clearImageData() {

        for ( let i = 0, l = data.length; i < l; i += 4 ) {

            data[ i ] = 0;
            data[ i + 1 ] = 0;
            data[ i + 2 ] = 0;
            data[ i + 3 ] = 0;

        }

    }

    function setPixel( x, y, r, g, b, a ) {

        const i = ( x + y * imageData.width ) * 4;

        data[ i ] = r;
        data[ i + 1 ] = g;
        data[ i + 2 ] = b;
        data[ i + 3 ] = a;

    }

    //---

    function drawLine( x1, y1, x2, y2, r, g, b, a ) {

        const dx = Math.abs( x2 - x1 );
        const dy = Math.abs( y2 - y1 );

        const sx = ( x1 < x2 ) ? 1 : -1;
        const sy = ( y1 < y2 ) ? 1 : -1;

        let err = dx - dy;

        let lx = x1;
        let ly = y1;    

        while ( true ) {

            if ( lx > 0 && lx < width && ly > 0 && ly < height ) {

                setPixel( lx, ly, r, g, b, a );

            }

            if ( ( lx === x2 ) && ( ly === y2 ) ) {
            
                break;
            
            }

            const e2 = 2 * err;

            if ( e2 > -dx ) { 

                err -= dy; 
                lx += sx; 

            }

            if ( e2 < dy ) { 

                err += dx; 
                ly += sy; 

            }

        }

    }

    function drawCircle( vector, radius, r, g, b, a ) {
        
        const radius2 = radius * radius;

        if ( radius === 1 ) {

            if ( vector.x > border.left && vector.x < border.right && vector.y > border.top && vector.y < border.bottom ) {

                setPixel( vector.x2d | 0, vector.y2d | 0, r, g, b, a );

            }

            return;

        }
        
        if ( vector.x + radius < border.left || vector.x - radius > border.right || vector.y + radius < border.top || vector.y - radius > border.bottom ) {

            return;
        
        }

        for ( let tx = -radius; tx < radius; tx ++ ) {

            for ( let ty = -radius; ty < radius; ty ++ ) {

                if ( tx * tx + ty * ty <= radius2 ) {
                
                    const x2d = vector.x + tx;
                    const y2d = vector.y + ty;

                    if ( x2d > border.left && x2d < border.right && y2d > border.top && y2d < border.bottom ) {

                        setPixel( x2d | 0, y2d | 0, r, g, b, a  );

                    }

                }

            }

        }

    }

    function drawCircleOutline( vector, radius, r, g, b, a, step = 0.05 ) {

        if ( radius === 1 ) {

            if ( vector.x > border.left && vector.x < border.right && vector.y > border.top && vector.y < border.bottom ) {

                setPixel( vector.x2d | 0, vector.y2d | 0, r, g, b, a );

            }

            return;

        }
        
        if ( vector.x + radius < border.left || vector.x - radius > border.right || vector.y + radius < border.top || vector.y - radius > border.bottom ) {

            return;
        
        }

        let lx = vector.x + radius * Math.cos( MATHPI2 );
        let ly = vector.y + radius * Math.sin( MATHPI2 );
        
        for ( let theta = 0; theta < MATHPI2 + step; theta += step ) { 

            const x = vector.x + radius * Math.cos( theta );
            const y = vector.y + radius * Math.sin( theta );
            
            drawLine( lx | 0, ly | 0, x | 0, y | 0, r, g, b, a );
            
            lx = x;
            ly = y;

        }

    }

    /*
    function drawBox( vector, width, height, r, g, b, a ) {

        if ( vector.x + width / 2 < border.left || vector.x - width / 2 > border.right || vector.y + height / 2 < border.top || vector.y - height / 2 > border.bottom ) {

            return;
        
        }
        
        for ( let y2d = vector.y - height / 2, y2dE = vector.y + height / 2; y2d < y2dE; y2d ++ ) {
        
            for ( let x2d = vector.x - width / 2, x2dE = vector.x + width / 2; x2d < x2dE; x2d ++ ) {
            
                if ( x2d > border.left && x2d < border.right && y2d > border.top && y2d < border.bottom ) {
                
                    setPixel( x2d | 0, y2d | 0, r, g, b, a );
                
                }
            
            }

        }

    }

    function drawBoxOutline( vector, width, height, r, g, b, a ) {

        if ( vector.x + width / 2 < border.left || vector.x - width / 2 > border.right || vector.y + height / 2 < border.top || vector.y - height / 2 > border.bottom ) {

            return;
        
        }

        const topLeftX = vector.x - width / 2;
        const topLeftY = vector.y - height / 2;
        const topRightX = vector.x + width / 2;
        const topRightY = vector.y - height / 2;
        const bottomLeftX = vector.x - width / 2;
        const bottomLeftY = vector.y + height / 2;
        const bottomRightX = vector.x + width / 2;
        const bottomRightY = vector.y + height / 2;
        
        drawLine( topLeftX | 0, topLeftY | 0, topRightX | 0, topRightY | 0, r, g, b, a );
        drawLine( topRightX | 0, topRightY | 0, bottomRightX | 0, bottomRightY | 0, r, g, b, a );
        drawLine( bottomRightX | 0, bottomRightY | 0, bottomLeftX | 0, bottomLeftY | 0, r, g, b, a );
        drawLine( bottomLeftX | 0, bottomLeftY | 0, topLeftX | 0, topLeftY | 0, r, g, b, a );

    }
    */

    function drawQuadraticBezier( sv, cv, ev, segments, r, g, b, a ) {

        for ( let i = 0, l = 1 / segments; i < 1 + l; i += l ) {

            if ( i > 0 ) {

                const c1 = interpolateQuadraticBezier( sv, cv, ev, i - l );
                const c2 = interpolateQuadraticBezier( sv, cv, ev, i );
                
                drawLine( c1.x | 0, c1.y | 0, c2.x | 0, c2.y | 0, r, g, b, a );

            }

        }

    }

    //---








    function draw() {

        mouseCursor.position.x = mousePos.x;
        mouseCursor.position.y = mousePos.y;
        mouseCursor.color = { r: 255, g: 255, b: 255, a: 255 };
        
        pathHolder.forEach( ( path, index ) => {
        
            for ( let i = 0, l = path.segments.length; i < l; i ++ ) {

                const pathSegment = path.segments[ i ];

                if ( pathSegment.p0 !== null && pathSegment.p1 !== null ) {

                    const distancep0 = getDistance( mousePos, pathSegment.p0 );
                    const distancep1 = getDistance( mousePos, pathSegment.p1 );

                    if ( distancep0 <= SNAP_TO_DISTANCE ) {

                        mouseCursor.position.x = pathSegment.p0.x;
                        mouseCursor.position.y = pathSegment.p0.y;
                        mouseCursor.color = { r: 0, g: 255, b: 0, a: 255 };
                        
                        //console.log( 'p0: ', pathSegment.p0.x, pathSegment.p0.y, mousePos.x, mousePos.y );

                    } else if ( distancep1 <= SNAP_TO_DISTANCE ) {

                        mouseCursor.position.x = pathSegment.p1.x;
                        mouseCursor.position.y = pathSegment.p1.y;
                        mouseCursor.color = { r: 0, g: 255, b: 0, a: 255 };

                        //console.log( 'p1: ', pathSegment.p1.x, pathSegment.p1.y, mousePos.x, mousePos.y );

                    }

                }

            }

            //---

            for ( let i = 0, l = path.segments.length; i < l; i ++ ) {
    
                const pathSegment = path.segments[ i ];

                if ( pathSegment.p0 !== null ) {

                    if ( pathSegment.p1 === null && i === l - 1 ) {

                        drawLine( pathSegment.p0.x | 0, pathSegment.p0.y | 0, mouseCursor.position.x | 0, mouseCursor.position.y | 0, 80, 80, 80, 255 );

                    }

                }

                if ( pathSegment.p1 !== null ) {

                    let pathSegmentLineColor = { r: 0, g: 0, b: 0, a: 0 };
                    
                    if ( pathSegment.walkable === true ) {

                        // drawLine( pathSegment.p0.x | 0, pathSegment.p0.y | 0, pathSegment.p1.x | 0, pathSegment.p1.y | 0, 60, 120, 0, 255 );

                        pathSegmentLineColor.r = 60;
                        pathSegmentLineColor.g = 120;
                        pathSegmentLineColor.b = 0;
                        pathSegmentLineColor.a = 255;

                        drawCircle( pathSegment.centerPoint, 7, 60, 120, 0, 255 );
                        // drawCircle( pathSegment.controlPoint, 5, 60, 120, 0, 255 );

                    } else {

                        // drawLine( pathSegment.p0.x | 0, pathSegment.p0.y | 0, pathSegment.p1.x | 0, pathSegment.p1.y | 0, 178, 34, 34, 255 );

                        pathSegmentLineColor.r = 178;
                        pathSegmentLineColor.g = 34;
                        pathSegmentLineColor.b = 34;
                        pathSegmentLineColor.a = 255;

                        drawCircle( pathSegment.centerPoint, 7, 178, 34, 34, 255 );
                        // drawCircle( pathSegment.controlPoint, 5, 178, 34, 34, 255 );

                    }

                    //drawLine( pathSegment.p0.x | 0, pathSegment.p0.y | 0, pathSegment.p1.x | 0, pathSegment.p1.y | 0, pathSegmentLineColor.r, pathSegmentLineColor.g, pathSegmentLineColor.b, pathSegmentLineColor.a );

                    drawQuadraticBezier( pathSegment.p0, pathSegment.controlPoint, pathSegment.p1, 25, pathSegmentLineColor.r, pathSegmentLineColor.g, pathSegmentLineColor.b, pathSegmentLineColor.a );

                    //---
                    //draw debug pathSegment direction stuff

                    //get point on pathSegment depending on percentage value
                    //const interpolationPoint = interpolate( pathSegment.p0, pathSegment.p1, 0.50 );

                    //const cX = interpolationPoint.x;
                    //const cY = interpolationPoint.y;

                    //center x & y
                    const cX = pathSegment.centerPoint.x;// ( ( pathSegment.p0.x + pathSegment.p1.x ) / 2 );
                    const cY = pathSegment.centerPoint.y;// ( ( pathSegment.p0.y + pathSegment.p1.y ) / 2 );

                    //pathSegment angle
                    const angle = Math.atan2( pathSegment.p1.y - pathSegment.p0.y, pathSegment.p1.x - pathSegment.p0.x );
                    
                    const length = 10;
                    
                    const sinA = Math.sin( angle );
                    const cosA = Math.cos( angle );
                    
                    //drawLine( ( sinA * length + cX ) | 0, ( -cosA * length + cY ) | 0, ( -sinA * length + cX ) | 0, ( cosA * length + cY ) | 0, 100, 100, 100, 255 );

                    //---

                    const angle2 = angle + Math.PI * 0.5;

                    const length2 = 20;

                    const sinA2 = Math.sin( angle2 );
                    const cosA2 = Math.cos( angle2 );

                    //drawLine( ( sinA2 * length2 + cX ) | 0, ( -cosA2 * length2 + cY ) | 0, ( -sinA2 * length2 + cX ) | 0, ( cosA2 * length2 + cY ) | 0, 255, 255, 255, 255 );

                    const pSSX = sinA2 * length2 + cX;
                    const pSSY = -cosA2 * length2 + cY;

                    const pSEX = -sinA2 * length2 + cX;
                    const pSEY = cosA2 * length2 + cY;

                    //drawLine( pSSX | 0, pSSY | 0, cX | 0, cY | 0, 255, 255, 255, 255 );
                    //drawLine( cX | 0, cY | 0, pSEX | 0, pSEY | 0, 255, 255, 255, 255 );

                    //---

                    if ( pathSegment.direction === '><' ) {

                        drawLine( ( sinA * length + pSSX ) | 0, ( -cosA * length + pSSY ) | 0, cX | 0, cY | 0, pathSegmentLineColor.r, pathSegmentLineColor.g, pathSegmentLineColor.b, pathSegmentLineColor.a );
                        drawLine( ( -sinA * length + pSSX ) | 0, ( cosA * length + pSSY ) | 0, cX | 0, cY | 0, pathSegmentLineColor.r, pathSegmentLineColor.g, pathSegmentLineColor.b, pathSegmentLineColor.a );

                        drawLine( ( sinA * length + pSEX ) | 0, ( -cosA * length + pSEY ) | 0, cX | 0, cY | 0, pathSegmentLineColor.r, pathSegmentLineColor.g, pathSegmentLineColor.b, pathSegmentLineColor.a );
                        drawLine( ( -sinA * length + pSEX ) | 0, ( cosA * length + pSEY ) | 0, cX | 0, cY | 0, pathSegmentLineColor.r, pathSegmentLineColor.g, pathSegmentLineColor.b, pathSegmentLineColor.a );

                    } else if ( pathSegment.direction === '>' ) {

                        drawLine( ( sinA * length + pSEX ) | 0, ( -cosA * length + pSEY ) | 0, cX | 0, cY | 0, pathSegmentLineColor.r, pathSegmentLineColor.g, pathSegmentLineColor.b, pathSegmentLineColor.a );
                        drawLine( ( -sinA * length + pSEX ) | 0, ( cosA * length + pSEY ) | 0, cX | 0, cY | 0, pathSegmentLineColor.r, pathSegmentLineColor.g, pathSegmentLineColor.b, pathSegmentLineColor.a );

                    } else if ( pathSegment.direction === '<' ) {

                        drawLine( ( sinA * length + pSSX ) | 0, ( -cosA * length + pSSY ) | 0, cX | 0, cY | 0, pathSegmentLineColor.r, pathSegmentLineColor.g, pathSegmentLineColor.b, pathSegmentLineColor.a );
                        drawLine( ( -sinA * length + pSSX ) | 0, ( cosA * length + pSSY ) | 0, cX | 0, cY | 0, pathSegmentLineColor.r, pathSegmentLineColor.g, pathSegmentLineColor.b, pathSegmentLineColor.a );

                    }

                }

            }

            for ( let i = 0, l = path.points.length; i < l; i ++ ) {

                const point = path.points[ i ];

                if ( getPointByPosition( point ).walkable === true ) {

                    drawCircle( point, 3, 124, 252, 0, 255 );

                    drawCircleOutline( point, 6, 124, 252, 0, 255 );

                } else {

                    drawCircle( point, 3, 178, 34, 34, 255 );

                    drawCircleOutline( point, 6, 178, 34, 34, 255 );

                }
            
            }

            for ( let i = 0, l = path.routes.length; i < l; i ++ ) {

                const route = path.routes[ i ];
                const routeColor = PATH_COLORS[ i ];

                if ( route.startPoint !== null ) {

                    drawCircle( route.startPoint, 5, routeColor.r, routeColor.g, routeColor.b, routeColor.a );
                    drawCircleOutline( route.startPoint, 9, routeColor.r, routeColor.g, routeColor.b, routeColor.a );

                }

                if ( route.endPoint !== null ) {

                    drawCircle( route.endPoint, 5, routeColor.r, routeColor.g, routeColor.b, routeColor.a );
                    drawCircleOutline( route.endPoint, 9, routeColor.r, routeColor.g, routeColor.b, routeColor.a );

                }

            }
        
        } );
        
        //---

        drawCircleOutline( mouseCursor.position, mouseCursor.diameter, mouseCursor.color.r, mouseCursor.color.g, mouseCursor.color.b, mouseCursor.color.a );

        //---

        //drawBox( rectangle.position, rectangle.dimensions.width, rectangle.dimensions.height, 15, 15, 15, 255 );

        //---

        for ( let i = 0, l = tempPathSegments.length; i < l; i ++ ) {
    
            const tempPathSegment = tempPathSegments[ i ];

            if ( tempPathSegment.type === 'line' ) {

                drawLine( tempPathSegment.p0.x | 0, tempPathSegment.p0.y | 0, tempPathSegment.p1.x | 0, tempPathSegment.p1.y | 0, tempPathSegment.color.r, tempPathSegment.color.g, tempPathSegment.color.b, tempPathSegment.color.a );

            } else if ( tempPathSegment.type === 'circ' ) {

                drawCircleOutline( tempPathSegment.position, tempPathSegment.diameter, tempPathSegment.color.r, tempPathSegment.color.g, tempPathSegment.color.b, tempPathSegment.color.a );

            } else if ( tempPathSegment.type === 'circfill' ) {

                drawCircle( tempPathSegment.position, tempPathSegment.diameter, tempPathSegment.color.r, tempPathSegment.color.g, tempPathSegment.color.b, tempPathSegment.color.a );

            } else if ( tempPathSegment.type === 'bezier' ) {

                drawQuadraticBezier( tempPathSegment.p0, tempPathSegment.controlPoint, tempPathSegment.p1, 25, tempPathSegment.color.r, tempPathSegment.color.g, tempPathSegment.color.b, tempPathSegment.color.a );

            }

        }

    }

    //---

    function render( timestamp ) {

        clearImageData();

        //---

        draw();

        //---

        context.putImageData( imageData, 0, 0 );

        //---

        animationFrame = requestAnimFrame( render );

    }

    window.requestAnimFrame = ( function() {

        return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.msRequestAnimationFrame     ||
                function( callback ) {
                    window.setTimeout( callback, 1000 / 60 );
                };

    } )();

    window.cancelAnimFrame = ( function() {

        return  window.cancelAnimationFrame       ||
                window.mozCancelAnimationFrame;

    } )();

    //---

    init();
    initGUI();

    //---

} );