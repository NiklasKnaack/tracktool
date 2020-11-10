document.addEventListener( 'DOMContentLoaded', () => {

    //--- ------------------------------------------------------------------------------------------------------------------------------

    console.clear();
    console.log( 'Track Tool' );

    //--- ------------------------------------------------------------------------------------------------------------------------------

    let stats = null;

    let debugMode = true;
    let debugElements = [];

    const MATHPI2 = Math.PI * 2;

    const SNAP_TO_DISTANCE = 25;

    const EDITOR_MODE_ENUM = Object.freeze( {

        addPathSegment: 'addPathSegment',
        removePathSegment: 'removePathSegment',
        bendPathSegment: 'bendPathSegment',
        straightenPathSegment: 'straightenPathSegment',
        splitPathSegment: 'splitPathSegment',
        splitPathSegmentAt: 'splitPathSegmentAt',
        togglePathWalkable: 'togglePathWalkable',
        togglePathDirections: 'togglePathDirections',
        addStartPoint: 'addStartPoint',
        addEndPoint: 'addEndPoint',
        removeStartEndPoints: 'removeStartEndPoints',
        getPathSegment: 'getPathSegment',
        togglePointWalkable: 'togglePointWalkable',
        movePoint: 'movePoint',
        showRoute: 'showRoute',
        addStreetSegment: 'addStreetSegment'

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

    const VEHICLE_INTERVAL = 500;

    let vehiclesHolder = [];
    let vehicleTimer = null;
    let vehcileImageHolder = [];

    let width = 1024;
    let height = 512;

    const canvas = document.createElement( 'canvas' );
    const context = canvas.getContext( '2d' );

    let animationFrame = null;

    let imageData = null;
    let data = null;

    const border = { left: 1, top: 1, right: width, bottom: height };
    // const center = { x: width / 2, y: height / 2 };

    let mouseDown = false;
    let mousePos = { x: 0, y: 0 };
    // let mousePosStart = { x: 0, y: 0 };
    // let mousePosEnd = { x: 0, y: 0 };
    const mouseCursor = { diameter: 9, color: { r: 255, g: 255, b: 255, a: 255 }, position: { x: 0, y: 0 } };

    let simulationRuns = true;

    let currentPathSegment = null;
    let selectedPathSegments = [];
    // let allowPathSegmentSplitting = true;
    let tempPathSegments = [];

    let currentStreetSegment = null;

    let pathHolder = [
        {
            id: 0,
            routes: [
                { startPoint: { x: 60, y: 218 }, endPoint: { x: 785, y: 877 }, pathSegments: [], length: 0, complete: true },
                { startPoint: { x: 170, y: 835 }, endPoint: { x: 715, y: 51 }, pathSegments: [], length: 0, complete: true },
                { startPoint: { x: 906, y: 57 }, endPoint: { x: 868, y: 784 }, pathSegments: [], length: 0, complete: true },
            ],
            currentPoint: { x: 0, y: 0 },
            streetPoints: [],
            streetSegments: [],
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
                { x: 266, y: 915, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 867, y: 157, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 906, y: 57, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 874, y: 547, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 938, y: 757, walkable: true, cost: 0, parentPoint: null, visited: false },
                { x: 122, y: 426, walkable: true, cost: 0, parentPoint: null, visited: false },
            ],
            openSet: [],
            closedSet: [],
            segments: [
                { id: 0, p0: { x: 170, y: 835 }, p1: { x: 180, y: 716 }, walkable: true, direction: '><', centerPoint: { x: 200.5, y: 764.75 }, controlPoint: { x: 226, y: 754 }, length: 132.12833065410595 },
                { id: 1, p0: { x: 180, y: 716 }, p1: { x: 153, y: 584 }, walkable: true, direction: '><', centerPoint: { x: 116.25, y: 634 }, controlPoint: { x: 66, y: 618 }, length: 172.63169979347268 },
                { id: 2, p0: { x: 153, y: 584 }, p1: { x: 203, y: 427 }, walkable: true, direction: '><', centerPoint: { x: 178, y: 505.5 }, controlPoint: { x: 178, y: 505.5 }, length: 164.76953601925328 },
                { id: 3, p0: { x: 203, y: 427 }, p1: { x: 170, y: 263 }, walkable: true, direction: '><', centerPoint: { x: 186.5, y: 345 }, controlPoint: { x: 186.5, y: 345 }, length: 167.28717822953436 },
                { id: 4, p0: { x: 170, y: 263 }, p1: { x: 191, y: 70 }, walkable: true, direction: '><', centerPoint: { x: 180.5, y: 166.5 }, controlPoint: { x: 180.5, y: 166.5 }, length: 194.1391253714717 },
                { id: 5, p0: { x: 347, y: 63 }, p1: { x: 362, y: 232 }, walkable: true, direction: '><', centerPoint: { x: 354.5, y: 147.5 }, controlPoint: { x: 354.5, y: 147.5 }, length: 169.66437457521835 },
                { id: 6, p0: { x: 362, y: 232 }, p1: { x: 363, y: 325 }, walkable: true, direction: '><', centerPoint: { x: 362.5, y: 278.5 }, controlPoint: { x: 362.5, y: 278.5 }, length: 93.00537618869137 },
                { id: 7, p0: { x: 363, y: 325 }, p1: { x: 383, y: 418 }, walkable: true, direction: '><', centerPoint: { x: 373, y: 371.5 }, controlPoint: { x: 373, y: 371.5 }, length: 95.12623192369179 },
                { id: 8, p0: { x: 383, y: 418 }, p1: { x: 370, y: 567 }, walkable: true, direction: '><', centerPoint: { x: 376.5, y: 492.5 }, controlPoint: { x: 376.5, y: 492.5 }, length: 149.56603892595405 },
                { id: 9, p0: { x: 370, y: 567 }, p1: { x: 396, y: 689 }, walkable: true, direction: '><', centerPoint: { x: 454.5, y: 605 }, controlPoint: { x: 526, y: 582 }, length: 202.36587650554344 },
                { id: 10, p0: { x: 396, y: 689 }, p1: { x: 385, y: 798 }, walkable: true, direction: '><', centerPoint: { x: 353.25, y: 770.75 }, controlPoint: { x: 316, y: 798 }, length: 141.0039299212495 },
                { id: 11, p0: { x: 385, y: 798 }, p1: { x: 413, y: 890 }, walkable: true, direction: '><', centerPoint: { x: 399, y: 844 }, controlPoint: { x: 399, y: 844 }, length: 96.16652224137046 },
                { id: 12, p0: { x: 578, y: 898 }, p1: { x: 578, y: 757 }, walkable: true, direction: '><', centerPoint: { x: 578, y: 827.5 }, controlPoint: { x: 578, y: 827.5 }, length: 141 },
                { id: 13, p0: { x: 578, y: 757 }, p1: { x: 568, y: 646 }, walkable: true, direction: '><', centerPoint: { x: 573, y: 701.5 }, controlPoint: { x: 573, y: 701.5 }, length: 111.44954015158609 },
                { id: 14, p0: { x: 568, y: 646 }, p1: { x: 578, y: 501 }, walkable: true, direction: '><', centerPoint: { x: 573, y: 573.5 }, controlPoint: { x: 573, y: 573.5 }, length: 145.34441853748632 },
                { id: 15, p0: { x: 578, y: 501 }, p1: { x: 562, y: 369 }, walkable: true, direction: '><', centerPoint: { x: 570, y: 435 }, controlPoint: { x: 570, y: 435 }, length: 132.9661611087573 },
                { id: 16, p0: { x: 562, y: 369 }, p1: { x: 593, y: 249 }, walkable: true, direction: '><', centerPoint: { x: 577.5, y: 309 }, controlPoint: { x: 577.5, y: 309 }, length: 123.9395013706284 },
                { id: 17, p0: { x: 593, y: 249 }, p1: { x: 548, y: 127 }, walkable: true, direction: '><', centerPoint: { x: 570.5, y: 188 }, controlPoint: { x: 570.5, y: 188 }, length: 130.034610777285 },
                { id: 18, p0: { x: 548, y: 127 }, p1: { x: 606, y: 41 }, walkable: true, direction: '><', centerPoint: { x: 577, y: 84 }, controlPoint: { x: 577, y: 84 }, length: 103.73041983911952 },
                { id: 19, p0: { x: 715, y: 51 }, p1: { x: 725, y: 147 }, walkable: true, direction: '><', centerPoint: { x: 735.5, y: 99 }, controlPoint: { x: 751, y: 99 }, length: 102.52190685098208 },
                { id: 20, p0: { x: 725, y: 147 }, p1: { x: 722, y: 271 }, walkable: true, direction: '><', centerPoint: { x: 723.5, y: 209 }, controlPoint: { x: 723.5, y: 209 }, length: 124.03628501370073 },
                { id: 21, p0: { x: 722, y: 271 }, p1: { x: 753, y: 390 }, walkable: true, direction: '><', centerPoint: { x: 737.5, y: 330.5 }, controlPoint: { x: 737.5, y: 330.5 }, length: 122.97154142320898 },
                { id: 22, p0: { x: 753, y: 390 }, p1: { x: 745, y: 547 }, walkable: true, direction: '><', centerPoint: { x: 749, y: 468.5 }, controlPoint: { x: 749, y: 468.5 }, length: 157.20368952413298 },
                { id: 23, p0: { x: 745, y: 547 }, p1: { x: 801, y: 683 }, walkable: true, direction: '><', centerPoint: { x: 773, y: 615 }, controlPoint: { x: 773, y: 615 }, length: 147.07821048680188 },
                { id: 24, p0: { x: 801, y: 683 }, p1: { x: 758, y: 766 }, walkable: true, direction: '><', centerPoint: { x: 779.5, y: 724.5 }, controlPoint: { x: 779.5, y: 724.5 }, length: 93.47726996441435 },
                { id: 25, p0: { x: 758, y: 766 }, p1: { x: 785, y: 877 }, walkable: true, direction: '><', centerPoint: { x: 787.25, y: 821.25 }, controlPoint: { x: 803, y: 821 }, length: 119.36777422738726 },
                { id: 26, p0: { x: 868, y: 784 }, p1: { x: 758, y: 766 }, walkable: true, direction: '><', centerPoint: { x: 813, y: 775 }, controlPoint: { x: 813, y: 775 }, length: 111.46299834474219 },
                { id: 27, p0: { x: 758, y: 766 }, p1: { x: 578, y: 757 }, walkable: true, direction: '><', centerPoint: { x: 680, y: 735.75 }, controlPoint: { x: 692, y: 710 }, length: 189.8810076738418 },
                { id: 28, p0: { x: 578, y: 757 }, p1: { x: 385, y: 798 }, walkable: true, direction: '><', centerPoint: { x: 489.25, y: 783.75 }, controlPoint: { x: 497, y: 790 }, length: 198.0851248248224 },
                { id: 29, p0: { x: 385, y: 798 }, p1: { x: 180, y: 716 }, walkable: true, direction: '><', centerPoint: { x: 315.25, y: 801 }, controlPoint: { x: 348, y: 845 }, length: 234.1480208493167 },
                { id: 30, p0: { x: 153, y: 584 }, p1: { x: 370, y: 567 }, walkable: true, direction: '><', centerPoint: { x: 256.25, y: 566.25 }, controlPoint: { x: 251, y: 557 }, length: 218.75535666362188 },
                { id: 31, p0: { x: 370, y: 567 }, p1: { x: 578, y: 501 }, walkable: true, direction: '><', centerPoint: { x: 477.5, y: 546 }, controlPoint: { x: 481, y: 558 }, length: 220.0392352919533 },
                { id: 32, p0: { x: 578, y: 501 }, p1: { x: 753, y: 390 }, walkable: true, direction: '><', centerPoint: { x: 665.5, y: 445.5 }, controlPoint: { x: 665.5, y: 445.5 }, length: 207.23416706711276 },
                { id: 33, p0: { x: 725, y: 147 }, p1: { x: 548, y: 127 }, walkable: true, direction: '><', centerPoint: { x: 636.5, y: 137 }, controlPoint: { x: 636.5, y: 137 }, length: 178.12635964393365 },
                { id: 34, p0: { x: 548, y: 127 }, p1: { x: 362, y: 232 }, walkable: true, direction: '><', centerPoint: { x: 455, y: 179.5 }, controlPoint: { x: 455, y: 179.5 }, length: 213.59073013593076 },
                { id: 35, p0: { x: 362, y: 232 }, p1: { x: 170, y: 263 }, walkable: true, direction: '><', centerPoint: { x: 266, y: 247.5 }, controlPoint: { x: 266, y: 247.5 }, length: 194.48650338776724 },
                { id: 36, p0: { x: 170, y: 263 }, p1: { x: 60, y: 218 }, walkable: true, direction: '><', centerPoint: { x: 115, y: 240.5 }, controlPoint: { x: 115, y: 240.5 }, length: 118.84864324004712 },
                { id: 37, p0: { x: 153, y: 584 }, p1: { x: 57, y: 582 }, walkable: true, direction: '><', centerPoint: { x: 105, y: 583 }, controlPoint: { x: 105, y: 583 }, length: 96.02083107326243 },
                { id: 38, p0: { x: 180, y: 716 }, p1: { x: 91, y: 741 }, walkable: true, direction: '><', centerPoint: { x: 135.5, y: 728.5 }, controlPoint: { x: 135.5, y: 728.5 }, length: 92.44457799135652 },
                { id: 39, p0: { x: 753, y: 390 }, p1: { x: 952, y: 416 }, walkable: true, direction: '><', centerPoint: { x: 852.5, y: 403 }, controlPoint: { x: 852.5, y: 403 }, length: 200.6913052426537 },
                { id: 40, p0: { x: 725, y: 147 }, p1: { x: 645, y: 341 }, walkable: true, direction: '><', centerPoint: { x: 670.5, y: 242 }, controlPoint: { x: 656, y: 240 }, length: 212.27855795506213 },
                { id: 41, p0: { x: 645, y: 341 }, p1: { x: 578, y: 501 }, walkable: true, direction: '><', centerPoint: { x: 625.75, y: 441 }, controlPoint: { x: 640, y: 461 }, length: 179.9662239981235 },
                { id: 42, p0: { x: 170, y: 263 }, p1: { x: 270, y: 465 }, walkable: true, direction: '><', centerPoint: { x: 229, y: 325 }, controlPoint: { x: 238, y: 286 }, length: 233.68522295677627 },
                { id: 43, p0: { x: 270, y: 465 }, p1: { x: 370, y: 567 }, walkable: true, direction: '><', centerPoint: { x: 308.5, y: 536 }, controlPoint: { x: 297, y: 556 }, length: 151.37623926012898 },
                { id: 44, p0: { x: 266, y: 915 }, p1: { x: 413, y: 890 }, walkable: true, direction: '><', centerPoint: { x: 339.5, y: 902.5 }, controlPoint: { x: 339.5, y: 902.5 }, length: 149.11069713471264 },
                { id: 45, p0: { x: 266, y: 915 }, p1: { x: 170, y: 835 }, walkable: true, direction: '><', centerPoint: { x: 218, y: 875 }, controlPoint: { x: 218, y: 875 }, length: 124.96399481450648 },
                { id: 46, p0: { x: 413, y: 890 }, p1: { x: 578, y: 898 }, walkable: true, direction: '><', centerPoint: { x: 495.5, y: 894 }, controlPoint: { x: 495.5, y: 894 }, length: 165.1938255504727 },
                { id: 47, p0: { x: 952, y: 416 }, p1: { x: 867, y: 157 }, walkable: true, direction: '><', centerPoint: { x: 909.5, y: 286.5 }, controlPoint: { x: 909.5, y: 286.5 }, length: 272.5912691191704 },
                { id: 48, p0: { x: 867, y: 157 }, p1: { x: 725, y: 147 }, walkable: true, direction: '><', centerPoint: { x: 796, y: 152 }, controlPoint: { x: 796, y: 152 }, length: 142.35167719419397 },
                { id: 49, p0: { x: 867, y: 157 }, p1: { x: 906, y: 57 }, walkable: true, direction: '><', centerPoint: { x: 864.25, y: 98.5 }, controlPoint: { x: 842, y: 90 }, length: 119.68479395158667 },
                { id: 50, p0: { x: 952, y: 416 }, p1: { x: 874, y: 547 }, walkable: true, direction: '><', centerPoint: { x: 974, y: 559.75 }, controlPoint: { x: 1035, y: 638 }, length: 256.45209604670714 },
                { id: 51, p0: { x: 874, y: 547 }, p1: { x: 938, y: 757 }, walkable: true, direction: '><', centerPoint: { x: 809.5, y: 563 }, controlPoint: { x: 713, y: 474 }, length: 324.4999260528535 },
                { id: 52, p0: { x: 938, y: 757 }, p1: { x: 868, y: 784 }, walkable: true, direction: '><', centerPoint: { x: 934.5, y: 792.25 }, controlPoint: { x: 966, y: 814 }, length: 107.58727858984204 },
                { id: 53, p0: { x: 191, y: 70 }, p1: { x: 347, y: 63 }, walkable: true, direction: '><', centerPoint: { x: 269, y: 66.5 }, controlPoint: { x: 269, y: 66.5 }, length: 156.1569723067145 },
                { id: 54, p0: { x: 347, y: 63 }, p1: { x: 548, y: 127 }, walkable: true, direction: '><', centerPoint: { x: 447.5, y: 95 }, controlPoint: { x: 447.5, y: 95 }, length: 210.94312029549576 },
                { id: 55, p0: { x: 60, y: 218 }, p1: { x: 191, y: 70 }, walkable: true, direction: '><', centerPoint: { x: 125.5, y: 144 }, controlPoint: { x: 125.5, y: 144 }, length: 197.6486782146544 },
                { id: 56, p0: { x: 60, y: 218 }, p1: { x: 57, y: 582 }, walkable: true, direction: '><', centerPoint: { x: 58.5, y: 400 }, controlPoint: { x: 58.5, y: 400 }, length: 364.0123624274318 },
                { id: 57, p0: { x: 57, y: 582 }, p1: { x: 91, y: 741 }, walkable: true, direction: '><', centerPoint: { x: 74, y: 661.5 }, controlPoint: { x: 74, y: 661.5 }, length: 162.5945878558078 },
                { id: 58, p0: { x: 57, y: 582 }, p1: { x: 122, y: 426 }, walkable: true, direction: '><', centerPoint: { x: 89.5, y: 504 }, controlPoint: { x: 89.5, y: 504 }, length: 169 },
                { id: 59, p0: { x: 122, y: 426 }, p1: { x: 203, y: 427 }, walkable: true, direction: '><', centerPoint: { x: 162.5, y: 426.5 }, controlPoint: { x: 162.5, y: 426.5 }, length: 81.00617260431454 },
            ]
        }
    ];

    for ( let i = 0, l = pathHolder[ 0 ].routes.length; i < l; i ++ ) {

        const route = pathHolder[ 0 ].routes[ i ];

        const startPoint = route.startPoint;
        const endPoint = route.endPoint;

        if ( startPoint !== null && endPoint !== null ) {

            findPath( startPoint );

        }

    }

    if ( debugMode === true ) {

        rebuildDebugElements();

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function initGUI() {


        const _addStreetSegment = () => {

            editorMode = EDITOR_MODE_ENUM.addStreetSegment;

        }

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

        const _splitPathSegment = () => {

            editorMode = EDITOR_MODE_ENUM.splitPathSegment;

        }

        const _splitPathSegmentAt = () => {

            editorMode = EDITOR_MODE_ENUM.splitPathSegmentAt;

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
                segments: [],
                streetSegments: []
            }

            tempPathSegments = [];

            currentPathSegment = null;
            currentStreetSegment = null;
            selectedPathSegments = [];

            vehiclesHolder = [];

            stopVehicleSimulation();

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

                output += '    { startPoint: { x: ' + route.startPoint.x + ', y: ' + route.startPoint.y + ' }, endPoint: { x: ' + route.endPoint.x + ', y: ' + route.endPoint.y + ' }, pathSegments: [], length: 0, complete: true }';

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

        const _showRoute = () => {

            editorMode = EDITOR_MODE_ENUM.showRoute;

        }

        const _toggleDebugMode = () => {

            debugMode = !debugMode;

            if ( debugMode === true ) {

                rebuildDebugElements();

            } else {

                removeDebugElements();

            }

        }

        const _playPauseSimulation = () => {

            simulationRuns = !simulationRuns;

        }

        const _linkTo = () => {

            window.open( 'https://twitter.com/niklaswebdev', '_blank' );

        }

        //---

        const guiSetting = {

            'Add Street Segment': _addStreetSegment,
            'Add Path Segment': _addPathSegment,
            // 'Allow Path Segment Splitting': allowPathSegmentSplitting,
            'Remove Path Segment': _removePathSegment,
            'Bend Path Segment': _bendPathSegment,
            'Straighten Path Segment': _straightenPathSegment,
            'Split Path Segment': _splitPathSegment,
            'Split Path Segment At': _splitPathSegmentAt,
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
            'Show Route': _showRoute,
            'Toggle Debug Mode': _toggleDebugMode,
            'Play/Pause Simulation': _playPauseSimulation,
            '@niklaswebdev': _linkTo

        }

        const gui = new dat.GUI();

        const folderEdit = gui.addFolder( 'Edit' );

        folderEdit.open();
        folderEdit.add( guiSetting, 'Add Street Segment' );
        folderEdit.add( guiSetting, 'Add Path Segment' );
        // folderEdit.add( guiSetting, 'Allow Path Segment Splitting' ).onChange( () => { allowPathSegmentSplitting = guiSetting[ 'Allow Path Segment Splitting' ]; } );
        folderEdit.add( guiSetting, 'Remove Path Segment' );
        folderEdit.add( guiSetting, 'Bend Path Segment' );
        folderEdit.add( guiSetting, 'Straighten Path Segment' );
        folderEdit.add( guiSetting, 'Split Path Segment' );
        folderEdit.add( guiSetting, 'Split Path Segment At' );
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
        folderAnalyze.add( guiSetting, 'Show Route' );
        folderAnalyze.add( guiSetting, 'Toggle Debug Mode' );

        const folderSimulation = gui.addFolder( 'Simulation' );

        folderSimulation.open();
        folderSimulation.add( guiSetting, 'Play/Pause Simulation' );

        const folderContact = gui.addFolder( 'Contact' );

        //folderContact.open();
        folderContact.add( guiSetting, '@niklaswebdev' );

        //gui.close();

        //---

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';

        document.body.appendChild( stats.domElement );

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

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

        // center.x = width / 2;
        // center.y = height / 2;

        //---

        if ( animationFrame !== null ) {

            cancelAnimFrame( animationFrame );

        }

        animationFrame = requestAnimFrame( render );

        //---

        drawStreetSegmentTexture();
        initVehicles();

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

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

            path.routes[ routeIndex ].complete = true;
            path.routes[ routeIndex ].length = 0;
            path.routes[ routeIndex ].pathSegments = [];

            for ( let i = 0, l = pathToEnd.length - 1; i < l; i ++ ) {

                const point0 = pathToEnd[ i ];
                const point1 = pathToEnd[ i + 1 ];

                const pathSegment = getPathSegmentByPoints( point0, point1 );

                //---

                path.routes[ routeIndex ].length += pathSegment.length;

                //---

                let newPathSegment = {};

                //newPathSegment.id = pathSegment.id;
                newPathSegment.controlPoint = { x: pathSegment.controlPoint.x, y: pathSegment.controlPoint.y };
                newPathSegment.length = pathSegment.length;

                if ( i === 0 ) {

                    if ( pathSegment.p0.x === path.routes[ routeIndex ].startPoint.x && pathSegment.p0.y === path.routes[ routeIndex ].startPoint.y ) {

                        newPathSegment.p0 = { x: pathSegment.p0.x, y: pathSegment.p0.y };
                        newPathSegment.p1 = { x: pathSegment.p1.x, y: pathSegment.p1.y };

                    } else {

                        newPathSegment.p0 = { x: pathSegment.p1.x, y: pathSegment.p1.y };
                        newPathSegment.p1 = { x: pathSegment.p0.x, y: pathSegment.p0.y };

                    }

                } else {

                    const predecessorNewPathSegment = path.routes[ routeIndex ].pathSegments[ path.routes[ routeIndex ].pathSegments.length - 1 ];

                    if ( pathSegment.p0.x === predecessorNewPathSegment.p1.x && pathSegment.p0.y === predecessorNewPathSegment.p1.y ) {

                        newPathSegment.p0 = { x: pathSegment.p0.x, y: pathSegment.p0.y };
                        newPathSegment.p1 = { x: pathSegment.p1.x, y: pathSegment.p1.y };

                    } else {

                        newPathSegment.p0 = { x: pathSegment.p1.x, y: pathSegment.p1.y };
                        newPathSegment.p1 = { x: pathSegment.p0.x, y: pathSegment.p0.y };

                    }

                }

                path.routes[ routeIndex ].pathSegments.push( newPathSegment );

                //---

                // console.log( path.routes[ routeIndex ].pathSegments[ path.routes[ routeIndex ].pathSegments.length - 1 ] );

                // //tempPathSegments.push( { type: 'line', p0: { x: point0.x, y: point0.y }, p1: { x: point1.x, y: point1.y }, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );
                // tempPathSegments.push( { type: 'bezier', p0: { x: point0.x, y: point0.y }, controlPoint: { x: pathSegment.controlPoint.x, y: pathSegment.controlPoint.y }, p1: { x: point1.x, y: point1.y }, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );
                // tempPathSegments.push( { type: 'circ', position: { x: point0.x, y: point0.y }, diameter: 15, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );
                // tempPathSegments.push( { type: 'circ', position: { x: point1.x, y: point1.y }, diameter: 15, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );

            }

        } else {

            console.log( "FOUND NO END" );

            path.routes[ routeIndex ].complete = false;

        }

    }

    //---

    function showRoute( position ) {

        tempPathSegments = [];

        //---

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        //---

        const point = getPointByPosition( position );

        if ( point !== null ) {

            let routeFound = null;
            let routeColor = null;

            for ( let i = 0, l = path.routes.length; i < l; i ++ ) {

                const route = path.routes[ i ];

                if ( point.x === route.startPoint.x && point.y === route.startPoint.y || point.x === route.endPoint.x && point.y === route.endPoint.y ) {

                    routeFound = route;
                    routeColor = PATH_COLORS[ i ];

                    break;

                }

            }

            if ( routeFound !== null ) {

                for ( let i = 0, l = routeFound.pathSegments.length; i < l; i ++ ) {

                    const pathSegment = routeFound.pathSegments[ i ];

                    tempPathSegments.push( { type: 'bezier', p0: { x: pathSegment.p0.x, y: pathSegment.p0.y }, controlPoint: { x: pathSegment.controlPoint.x, y: pathSegment.controlPoint.y }, p1: { x: pathSegment.p1.x, y: pathSegment.p1.y }, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );
                    tempPathSegments.push( { type: 'circ', position: { x: pathSegment.p0.x, y: pathSegment.p0.y }, diameter: 15, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );
                    tempPathSegments.push( { type: 'circ', position: { x: pathSegment.p1.x, y: pathSegment.p1.y }, diameter: 15, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );

                }

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

    function addStreetSegment( position ) {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        //---

        const walkable = true;
        const direction = '><';
        const modus = 'add';//'new'

        const laneChange = true;
        const laneDistance = 20;

        //---

        if ( currentStreetSegment === null ) {

            const streetSegment = {

                id: path.streetSegments.length,

                p0: { x: position.x, y: position.y },
                p1: null,
                centerPoint: { x: 0, y: 0 },
                controlPoint: { x: 0, y: 0 },

                lanes: [
                    getNewStreetSegmentLane( { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } ),
                    getNewStreetSegmentLane( { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } ),
                    getNewStreetSegmentLane( { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } ),
                    getNewStreetSegmentLane( { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } ),
                    // getNewStreetSegmentLane( { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } ),
                    // getNewStreetSegmentLane( { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } ),
                    // getNewStreetSegmentLane( { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } ),
                    // getNewStreetSegmentLane( { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } ),
                ],
                centerLanes: [],
                crossLanes: [],
                pathSegments: [],
                borders: [],

                walkable: walkable,
                direction: direction,
                modus: modus,

                laneChange: laneChange,
                laneDistance: laneDistance,

                boundingClientRect: { x: 0, y: 0, width: 0, height: 0 },
                image: null,

            };

            currentStreetSegment = streetSegment;

            path.streetSegments.push( currentStreetSegment );

        } else {

            currentStreetSegment.p1 = { x: position.x, y: position.y };

            console.log( currentStreetSegment );

            //---

            const convertLaneToPathSegment = ( lane ) => {

                const p0 = getPathSegmentPoint( lane.p0 );
                const p0Array = path.points.find( ( point ) => point.x === lane.p0.x && point.y === lane.p0.y );
                const p1 = getPathSegmentPoint( lane.p1 );
                const p1Array = path.points.find( ( point ) => point.x === lane.p1.x && point.y === lane.p1.y );

                let pathSegmentPoint0 = p0Array;
                let pathSegmentPoint1 = p1Array;

                if ( typeof pathSegmentPoint0 === 'undefined' ) {

                    pathSegmentPoint0 = p0;
    
                    path.points.push( pathSegmentPoint0 );
    
                }
    
                if ( typeof pathSegmentPoint1 === 'undefined' ) {
    
                    pathSegmentPoint1 = p1;
    
                    path.points.push( pathSegmentPoint1 );
    
                }

                const pathSegment = {

                    id: path.segments.length,
                    p0: { x: pathSegmentPoint0.x, y: pathSegmentPoint0.y },
                    p1: { x: pathSegmentPoint1.x, y: pathSegmentPoint1.y },
                    controlPoint: { x: lane.controlPoint.x, y: lane.controlPoint.y },
                    centerPoint: { x: lane.centerPoint.x, y: lane.centerPoint.y },
                    length: getPathSegmentLength( lane.p0, lane.p1, lane.controlPoint ),
                    walkable: currentStreetSegment.walkable,
                    direction: currentStreetSegment.direction,

                };

                return pathSegment;

            };

            for ( let i = 0, l = currentStreetSegment.lanes.length; i < l; i ++ ) {

                const lane = currentStreetSegment.lanes[ i ];
                const pathSegment = convertLaneToPathSegment( lane );

                currentStreetSegment.pathSegments.push( pathSegment );
                path.segments.push( pathSegment );

            }

            for ( let i = 0, l = currentStreetSegment.crossLanes.length; i < l; i ++ ) {

                const lane = currentStreetSegment.crossLanes[ i ];
                const pathSegment = convertLaneToPathSegment( lane );

                currentStreetSegment.pathSegments.push( pathSegment );
                path.segments.push( pathSegment );

            }

            //---

            drawStreetSegment( currentStreetSegment );

            //---

            currentStreetSegment = null;

            //---

            tempPathSegments = [];

        }

    }

    // let imageTexture = null;
    let canvasTexture = null;

    function drawStreetSegmentTexture() {

        canvasTexture = document.createElement( 'canvas' );

        canvasTexture.width = 256;
        canvasTexture.height = 256;

        // canvasTexture.style.position = 'absolute';
        // canvasTexture.style.left = '0px';
        // canvasTexture.style.top = '0px';

        // document.body.appendChild( canvasTexture );

        const contextTexture = canvasTexture.getContext( '2d' );

        const imageData = contextTexture.getImageData ( 0, 0, 256, 256 );
        const data = imageData.data;

        for ( let i = 0, l = data.length; i < l; i += 4 ) {

            const color = Math.floor( Math.random() * 20 ) + 60;

            data[ i ]     = color;
            data[ i + 1 ] = color;
            data[ i + 2 ] = color;
            data[ i + 3 ] = 255;

        }

        contextTexture.putImageData( imageData, 0, 0 );

        // imageTexture = new Image( 256, 256 );
        // imageTexture.src = canvasTexture.toDataURL();

    }

    function drawStreetSegment( streetSegment ) {

        if ( streetSegment.p0 !== null && streetSegment.p1 !== null ) {

            const precision = 100;

            context.setLineDash( [] );

            const streetBorder0 = streetSegment.borders[ 0 ];
            const streetBorder1 = streetSegment.borders[ 1 ];

            //---
            //boundingClientRect

            const minX = Math.min( streetBorder0.p0.x, streetBorder0.p1.x, streetBorder1.p0.x, streetBorder1.p1.x ) - 10;
            const maxX = Math.max( streetBorder0.p0.x, streetBorder0.p1.x, streetBorder1.p0.x, streetBorder1.p1.x ) + 10;
            const minY = Math.min( streetBorder0.p0.y, streetBorder0.p1.y, streetBorder1.p0.y, streetBorder1.p1.y ) - 10;
            const maxY = Math.max( streetBorder0.p0.y, streetBorder0.p1.y, streetBorder1.p0.y, streetBorder1.p1.y ) + 10;

            streetSegment.boundingClientRect.x = minX;
            streetSegment.boundingClientRect.y = minY;
            streetSegment.boundingClientRect.width = maxX - minX;
            streetSegment.boundingClientRect.height = maxY - minY;

            //---

            const _canvas = document.createElement( 'canvas' );
            const _context = _canvas.getContext( '2d' );

            _canvas.width = streetSegment.boundingClientRect.width;
            _canvas.height = streetSegment.boundingClientRect.height;

            // _context.rect( 0, 0, streetSegment.boundingClientRect.width, streetSegment.boundingClientRect.height );
            // _context.lineWidth = 2;
            // _context.strokeStyle = 'rgba( 255, 55, 55, 1.00 )';
            // _context.stroke();
            // // _context.fillStyle = 'rgba( 255, 0, 0, 0.005 )';
            // // _context.fill( 'evenodd' );

            //---

            //const asphaltTexture = new Image( 1024, 1024 );
            // asphaltTexture.src = './texture_asphalt.png';
            //asphaltTexture.src = 'data:image/png;base64,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';
            //asphaltTexture.src = 'data:image/png;base64,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';

            //---

            for ( let iC = 0, iCStep = 1 / precision; iC < 1 + iCStep; iC += iCStep ) {

                if ( iC > 0 ) {

                    const pTL = interpolateQuadraticBezier( streetBorder0.p0, streetBorder0.controlPoint, streetBorder0.p1, iC - iCStep );
                    const pTR = interpolateQuadraticBezier( streetBorder0.p0, streetBorder0.controlPoint, streetBorder0.p1, iC );
                    const pBL = interpolateQuadraticBezier( streetBorder1.p0, streetBorder1.controlPoint, streetBorder1.p1, iC - iCStep );
                    const pBR = interpolateQuadraticBezier( streetBorder1.p0, streetBorder1.controlPoint, streetBorder1.p1, iC );

                    //https://stackoverflow.com/questions/9536257/how-to-anti-alias-clip-edges-in-html5-canvas-under-chrome-windows
                    // _context.globalCompositeOperation = 'destination-in';
                    // _context.globalCompositeOperation = 'source-atop';
                    _context.save();
                    // _context.globalAlpha = 1.0;
                    
                    _context.beginPath();
                    _context.moveTo( pTL.x - minX, pTL.y - minY );
                    _context.lineTo( pTR.x - minX, pTR.y - minY );
                    _context.lineTo( pBR.x - minX, pBR.y - minY );
                    _context.lineTo( pBL.x - minX, pBL.y - minY );
                    // _context.lineWidth = 2;
                    _context.closePath();

                    // _context.strokeStyle = 'rgba( 63, 59, 58, 1.00 )';
                    // _context.stroke(); 
                    _context.fillStyle = 'rgba( 63, 59, 58, 1.00 )';
                    _context.fill( 'evenodd' );
                    
                    _context.clip();
                    //_context.drawImage( imageTexture, 0, 0, 256, 256 );
                    _context.fillStyle = _context.createPattern( canvasTexture, 'repeat' );
                    _context.fillRect( 0, 0, streetSegment.boundingClientRect.width, streetSegment.boundingClientRect.height );

                    _context.restore();
                    // _context.globalCompositeOperation = 'source-over';

                }

            }

            _context.beginPath();
            _context.moveTo( streetBorder0.p0.x - minX, streetBorder0.p0.y - minY );
            _context.quadraticCurveTo( streetBorder0.controlPoint.x - minX, streetBorder0.controlPoint.y - minY, streetBorder0.p1.x - minX, streetBorder0.p1.y - minY );
            _context.lineWidth = 2;
            _context.strokeStyle = 'rgba( 135, 135, 135, 1.00 )';
            _context.stroke();

            _context.beginPath();
            _context.moveTo( streetBorder1.p0.x - minX, streetBorder1.p0.y - minY );
            _context.quadraticCurveTo( streetBorder1.controlPoint.x - minX, streetBorder1.controlPoint.y - minY, streetBorder1.p1.x - minX, streetBorder1.p1.y - minY );
            _context.lineWidth = 2;
            _context.strokeStyle = 'rgba( 135, 135, 135, 1.00 )';
            _context.stroke();

            _context.beginPath();
            _context.moveTo( streetSegment.p0.x - minX, streetSegment.p0.y - minY );
            _context.quadraticCurveTo( streetSegment.controlPoint.x - minX, streetSegment.controlPoint.y - minY, streetSegment.p1.x - minX, streetSegment.p1.y - minY );
            _context.lineWidth = 6;
            _context.strokeStyle = 'rgba( 135, 135, 135, 1.00 )';
            _context.stroke();

            _context.beginPath();
            _context.moveTo( streetSegment.p0.x - minX, streetSegment.p0.y - minY );
            _context.quadraticCurveTo( streetSegment.controlPoint.x - minX, streetSegment.controlPoint.y - minY, streetSegment.p1.x - minX, streetSegment.p1.y - minY );
            _context.lineWidth = 2;
            _context.strokeStyle = 'rgba( 63, 59, 58, 1.00 )';
            _context.stroke();

            streetSegment.centerLanes.forEach( ( centerLane ) => {

                _context.setLineDash( [ 8, 18 ] );
                _context.beginPath();
                _context.moveTo( centerLane.p0.x - minX, centerLane.p0.y - minY );
                _context.quadraticCurveTo( centerLane.controlPoint.x - minX, centerLane.controlPoint.y - minY, centerLane.p1.x - minX, centerLane.p1.y - minY );
                _context.lineWidth = 3;
                _context.strokeStyle = 'rgba( 135, 135, 135, 0.75 )';
                _context.stroke();
                
            } );

            //---

            streetSegment.image = new Image( streetSegment.boundingClientRect.width, streetSegment.boundingClientRect.height );
            streetSegment.image.src = _canvas.toDataURL();
            // streetSegment.image.style.position = 'absolute';
            // streetSegment.image.style.left = streetSegment.boundingClientRect.x.toString() + 'px';
            // streetSegment.image.style.top = streetSegment.boundingClientRect.y.toString() + 'px';

            // document.body.appendChild( streetSegment.image );

            //context.drawImage( streetSegment.image, streetSegment.boundingClientRect.x, streetSegment.boundingClientRect.y );

        }

    }

    function drawStreetSegments() {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        //---

        for ( let i = 0, l = path.streetSegments.length; i < l; i ++ ) {

            const streetSegment = path.streetSegments[ i ];

            if ( streetSegment.p0 !== null && streetSegment.p1 !== null ) {

                //context.save();
                context.drawImage( streetSegment.image, streetSegment.boundingClientRect.x, streetSegment.boundingClientRect.y, streetSegment.boundingClientRect.width, streetSegment.boundingClientRect.height );
                //context.restore();

            }

        }



    }

    function getNewStreetSegmentLane( p0, p1, centerPoint, controlPoint ) {

        return {

            p0: p0,
            p1: p1,
            centerPoint: centerPoint,
            controlPoint: controlPoint

        };

    }

    function constructStreetSegment( position ) {



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
            // currentPathSegment.p1 = { x: position.x, y: position.y };
            // currentPathSegment.centerPoint = getPathSegmentCenter( currentPathSegment );
            // currentPathSegment.controlPoint = getPathSegmentCenter( currentPathSegment );
            // currentPathSegment.length = getPathSegmentLength( currentPathSegment.p0, currentPathSegment.p1, currentPathSegment.controlPoint ); //getDistance( currentPathSegment.p0, currentPathSegment.p1 );
            // currentPathSegment.walkable = true;
            // currentPathSegment.direction = '><';

            path.segments.push( currentPathSegment );

            if ( debugMode === true ) {

                addDebugElement( position.x, position.y, position.x.toFixed( 0 ).toString() + ', ' + position.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );

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

            // if ( allowPathSegmentSplitting === true ) {

            //     const intersections = getPathSegmentsIntersections( currentPathSegment, 100 );

            //     for ( let i = 0, l = intersections.length; i < l; i ++ ) {

            //         const intersection = intersections[ i ];

            //         console.log( intersection );

            //         const t0 = getTOfQuadraticBezierFromIntersectionPoint( intersection.pathSegment0, intersection.point );
            //         const t1 = getTOfQuadraticBezierFromIntersectionPoint( intersection.pathSegment1, intersection.point );

            //         splitPathSegment( intersection.pathSegment0, t0 );
            //         splitPathSegment( intersection.pathSegment1, t1 );

            //     }

            // }

            if ( debugMode === true ) {

                addDebugElement( position.x, position.y, position.x.toFixed( 0 ).toString() + ', ' + position.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );
                addDebugElement( currentPathSegment.centerPoint.x, currentPathSegment.centerPoint.y, currentPathSegment.id.toString(), 'white', -4, -6, null );

                addDebugElement( currentPathSegment.centerPoint.x, currentPathSegment.centerPoint.y, currentPathSegment.length.toFixed( 2 ).toString(), 'grey', 10, -5, null );

            }

            currentPathSegment = null;

        }

    }

    function removePathSegmentByPosition( position ) {

        const pathSegment = getPathSegmentByPosition( position );

        if ( pathSegment !== null ) {

            removePathSegment( pathSegment );

        }

    }

    function removePathSegment( pathSegment ) {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];



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

    function straightenPathSegmentByPosition( position ) {

        const pathSegment = getPathSegmentByPosition( position );

        if ( pathSegment !== null ) {

            straightenPathSegment( pathSegment );

        }

    }

    function straightenPathSegment( pathSegment ) {

        const centerPoint = getPathSegmentCenter( pathSegment );

        pathSegment.centerPoint = centerPoint;
        pathSegment.controlPoint = centerPoint;

        pathSegment.length = getPathSegmentLength( pathSegment.p0, pathSegment.p1, pathSegment.controlPoint );

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

        tempPathSegments = [];

    }

    function splitPathSegmentByPosition( position, t = 0.50 ) {

        const pathSegment = getPathSegmentByPosition( position );

        if ( pathSegment !== null ) {

            splitPathSegment( pathSegment, t );

        }

    }

    function splitPathSegment( pathSegment, t = 0.50 ) {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        const newPathSegment0 = trimPathSegment( pathSegment, t, false );
        const newPathSegment1 = trimPathSegment( pathSegment, t, true );

        const newPathSegments = [ newPathSegment0, newPathSegment1 ];

        //---

        removePathSegment( pathSegment );

        //---

        for ( let i = 0, l = newPathSegments.length; i < l; i ++ ) {

            const newPathSegment = newPathSegments[ i ];

            newPathSegment.id = path.segments.length;

            const pathSegment0Point0New = getPathSegmentPoint( newPathSegment.p0 );
            const pathSegment0Point0Array = path.points.find( ( point ) => point.x === newPathSegment.p0.x && point.y === newPathSegment.p0.y );
            const pathSegment0Point1New = getPathSegmentPoint( newPathSegment.p1 );
            const pathSegment0Point1Array = path.points.find( ( point ) => point.x === newPathSegment.p1.x && point.y === newPathSegment.p1.y );

            let pathSegmentPoint0 = pathSegment0Point0Array;
            let pathSegmentPoint1 = pathSegment0Point1Array;

            if ( typeof pathSegmentPoint0 === 'undefined' ) {

                pathSegmentPoint0 = pathSegment0Point0New;

                path.points.push( pathSegmentPoint0 );

            }

            if ( typeof pathSegmentPoint1 === 'undefined' ) {

                pathSegmentPoint1 = pathSegment0Point1New;

                path.points.push( pathSegmentPoint1 );

            }

            newPathSegment.centerPoint = interpolateQuadraticBezier( newPathSegment.p0, newPathSegment.controlPoint, newPathSegment.p1, 0.50 );
            newPathSegment.length = getPathSegmentLength( newPathSegment.p0, newPathSegment.p1, newPathSegment.controlPoint ); //getDistance( newPathSegment0.p0, newPathSegment0.p1 );
            newPathSegment.walkable = true;
            newPathSegment.direction = '><';

            path.segments.push( newPathSegment );

        }

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

        tempPathSegments = [];

    }

    function trimPathSegment ( pathSegment, t = 0.50, fromStart = false ) {

		let startPoint;
        let endPoint;

		if ( fromStart ) {

			endPoint = pathSegment.p0;
			startPoint = pathSegment.p1;
            t = 1 - t;

		} else {

			startPoint = pathSegment.p0;
            endPoint = pathSegment.p1;

        }

		const dscx = pathSegment.controlPoint.x - startPoint.x;
		const dscy = pathSegment.controlPoint.y - startPoint.y;
		const dcex = endPoint.x - pathSegment.controlPoint.x;
        const dcey = endPoint.y - pathSegment.controlPoint.y;

        const newPathSegment = {

            p0: startPoint,
            controlPoint: { x: startPoint.x + dscx * t, y: startPoint.y + dscy * t },
            p1: startPoint

        };

		let dx = pathSegment.controlPoint.x + dcex * t - newPathSegment.controlPoint.x;
        let dy = pathSegment.controlPoint.y + dcey * t - newPathSegment.controlPoint.y;

		if ( fromStart ) {

            newPathSegment.p0 = {

                x: newPathSegment.controlPoint.x + dx * t,
                y: newPathSegment.controlPoint.y + dy * t

            };

		} else {

            newPathSegment.p1 = {

                x: newPathSegment.controlPoint.x + dx * t,
                y: newPathSegment.controlPoint.y + dy * t

            };

        }

        return newPathSegment;

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

        removeVehiclesByRouteIndex( routeIndex );

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

    // function removeDuplicatePointsFromArray() {

    //     const pathIndex = 0;

    //     const path = pathHolder[ pathIndex ];

    //     const point = path.currentPoint;

    //     const duplicatePoints = path.points.filter( ( p ) => p.x === point.x && p.y === point.y );

    //     if ( duplicatePoints.length > 1 ) {

    //         path.points.splice( path.points.findIndex( ( p ) => p.x === point.x && p.y === point.y ), 1 );

    //     }

    // }

    // function removeDuplicatePathSegmentsFromArray() {

    //     const pathIndex = 0;

    //     const path = pathHolder[ pathIndex ];

    //     //under construction

    // }

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

                //getPathSegmentsIntersections( pathSegment, 25 );

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

    //--- ------------------------------------------------------------------------------------------------------------------------------

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

                addDebugElement( pathSegment.p0.x, pathSegment.p0.y, pathSegment.p0.x.toFixed( 0 ).toString() + ', ' + pathSegment.p0.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );
                addDebugElement( pathSegment.p1.x, pathSegment.p1.y, pathSegment.p1.x.toFixed( 0 ).toString() + ', ' + pathSegment.p1.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );

            } else {

                addDebugElement( pathSegment.p0.x, pathSegment.p0.y, pathSegment.p0.x.toFixed( 0 ).toString() + ', ' + pathSegment.p0.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );
                addDebugElement( pathSegment.p1.x, pathSegment.p1.y, pathSegment.p1.x.toFixed( 0 ).toString() + ', ' + pathSegment.p1.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );

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

    //--- ------------------------------------------------------------------------------------------------------------------------------

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
		let p = p0;
		let np = null;

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
        // if ( ua < 0 || ua > 1 || ub < 0 || ub > 1 ) {

        //     return null

        // }

        // Return a object with the x and y coordinates of the intersection
        return {
            x: x1 + ua * ( x2 - x1 ),
            y: y1 + ua * ( y2 - y1 )
        };

    }

    // function showPathSegmentIntersectionPointsWithLine( line, precision = 25 ) {

    //     tempPathSegments = [];

    //     //---

    //     const pathIndex = 0;

    //     const path = pathHolder[ pathIndex ];

    //     //---

    //     for ( let i = 0, l = path.segments.length; i < l; i ++ ) {

    //         const comparePathSegment = path.segments[ i ];

    //         if ( line.id !== comparePathSegment.id ) {

    //             for ( let iC = 0, iCStep = 1 / precision; iC < 1 + iCStep; iC += iCStep ) {

    //                 if ( iC > 0 ) {

    //                     const tempComparePathSegment = {};

    //                     tempComparePathSegment.p0 = interpolateQuadraticBezier( comparePathSegment.p0, comparePathSegment.controlPoint, comparePathSegment.p1, iC - iCStep );
    //                     tempComparePathSegment.p1 = interpolateQuadraticBezier( comparePathSegment.p0, comparePathSegment.controlPoint, comparePathSegment.p1, iC );

    //                     const intersectionPoint = getLinesIntersectionPoint( line.p0.x, line.p0.y, line.p1.x, line.p1.y, tempComparePathSegment.p0.x, tempComparePathSegment.p0.y, tempComparePathSegment.p1.x, tempComparePathSegment.p1.y );

    //                     if ( intersectionPoint !== null ) {

    //                         if ( Math.round( intersectionPoint.x ) !== line.p0.x && Math.round( intersectionPoint.y ) !== line.p0.y && Math.round( intersectionPoint.x ) !== line.p1.x && Math.round( intersectionPoint.y ) !== line.p1.y ) {

    //                             tempPathSegments.push( { type: 'circfill', position: { x: intersectionPoint.x, y: intersectionPoint.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );

    //                         }

    //                     }

    //                 }

    //             }

    //         }

    //     }

    // }

    // function getPathSegmentsIntersections( inputPathSegment, precision = 25 ) {

    //     //tempPathSegments = [];

    //     //---

    //     const pathIndex = 0;

    //     const path = pathHolder[ pathIndex ];

    //     //---

    //     // const intersectionPoints = [];
    //     const intersections = [];

    //     for ( let iI = 0, iIStep = 1 / precision; iI < 1 + iIStep; iI += iIStep ) {

    //         if ( iI > 0 ) {

    //             const tempInputPathSegment = {};

    //             tempInputPathSegment.id = inputPathSegment.id;
    //             tempInputPathSegment.p0 = interpolateQuadraticBezier( inputPathSegment.p0, inputPathSegment.controlPoint, inputPathSegment.p1, iI - iIStep );
    //             tempInputPathSegment.p1 = interpolateQuadraticBezier( inputPathSegment.p0, inputPathSegment.controlPoint, inputPathSegment.p1, iI );

    //             //tempPathSegments.push( { type: 'line', p0: { x: tempInputPathSegment.p0.x | 0, y: tempInputPathSegment.p0.y | 0 }, p1: { x: tempInputPathSegment.p1.x | 0, y: tempInputPathSegment.p1.y | 0 }, color: { r: 255, g: 0, b: 0, a: 255 } } );
    //             //tempPathSegments.push( { type: 'circfill', position: { x: tempInputPathSegment.p0.x | 0, y: tempInputPathSegment.p0.y | 0 }, diameter: 9, color: { r: 255, g: 0, b: 0, a: 255 } } );

    //             for ( let i = 0, l = path.segments.length; i < l; i ++ ) {

    //                 const comparePathSegment = path.segments[ i ];
    //                 // const compareIndex = selectedPathSegments.findIndex( ( pathSegment ) => pathSegment.id === comparePathSegment.id );

    //                 // if ( compareIndex > -1 ) {

    //                 //     continue;

    //                 // }

    //                 for ( let iC = 0, iCStep = 1 / precision; iC < 1 + iCStep; iC += iCStep ) {

    //                     if ( iC > 0 ) {

    //                         const tempComparePathSegment = {};

    //                         tempComparePathSegment.id = comparePathSegment.id;
    //                         tempComparePathSegment.p0 = interpolateQuadraticBezier( comparePathSegment.p0, comparePathSegment.controlPoint, comparePathSegment.p1, iC - iCStep );
    //                         tempComparePathSegment.p1 = interpolateQuadraticBezier( comparePathSegment.p0, comparePathSegment.controlPoint, comparePathSegment.p1, iC );

    //                         if ( tempInputPathSegment.id !== tempComparePathSegment.id ) {

    //                             //tempPathSegments.push( { type: 'line', p0: { x: tempComparePathSegment.p0.x | 0, y: tempComparePathSegment.p0.y | 0 }, p1: { x: tempComparePathSegment.p1.x | 0, y: tempComparePathSegment.p1.y | 0 }, color: { r: 255, g: 0, b: 0, a: 255 } } );

    //                             const intersectionPoint = getLinesIntersectionPoint( tempInputPathSegment.p0.x, tempInputPathSegment.p0.y, tempInputPathSegment.p1.x, tempInputPathSegment.p1.y, tempComparePathSegment.p0.x, tempComparePathSegment.p0.y, tempComparePathSegment.p1.x, tempComparePathSegment.p1.y );

    //                             if ( intersectionPoint !== null ) {

    //                                 if ( Math.round( intersectionPoint.x ) !== tempInputPathSegment.p0.x && Math.round( intersectionPoint.y ) !== tempInputPathSegment.p0.y && Math.round( intersectionPoint.x ) !== tempInputPathSegment.p1.x && Math.round( intersectionPoint.y ) !== tempInputPathSegment.p1.y ) {

    //                                     //console.log( intersectionPoint, tempInputPathSegment.p0, tempInputPathSegment.p1 );

    //                                     //tempPathSegments.push( { type: 'circfill', position: { x: intersectionPoint.x, y: intersectionPoint.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );

    //                                     intersections.push( { point: intersectionPoint, pathSegment0: inputPathSegment, pathSegment1: comparePathSegment } );

    //                                 }

    //                             }

    //                         }

    //                     }

    //                 }

    //             }

    //         }

    //     }

    //     return intersections;

    // }

    function getTOfQuadraticBezierFromIntersectionPoint( pathSegment, position, precision = 100 ) {

        let distance = Infinity;
        let t = -1;

        for ( let i = 0, l = 1 / precision; i < 1 + l; i += l ) {

            const pOnBezier = interpolateQuadraticBezier( pathSegment.p0, pathSegment.controlPoint, pathSegment.p1, i );

            const d = getDistance( position, pOnBezier );

            if ( distance > d ) {

                distance = d;
                t = i;

            }

        }

        return t;

    }

    function getNearestPointOnPathSegmentByPosition( pathSegment, position, precision = 100 ) {

        let distance = Infinity;
        let nearestPoint = null;

        for ( let i = 0, l = 1 / precision; i < 1 + l; i += l ) {

            const pOnBezier = interpolateQuadraticBezier( pathSegment.p0, pathSegment.controlPoint, pathSegment.p1, i );

            const d = getDistance( position, pOnBezier );

            if ( distance > d ) {

                distance = d;
                nearestPoint = pOnBezier;

            }

        }

        return nearestPoint;

    }

    function signedDistanceToLine( p, p0X, p0Y, p1X, p1Y ) {

        const p0p1X = p0X - p1X;
        const p0p1Y = p0Y - p1Y;

        const l2 = p0p1X * p0p1X + p0p1Y * p0p1Y;

        const pp0X = p.x - p0X;
        const pp0Y = p.y - p0Y;

        if ( l2 === 0 ) {

            return pp0X * pp0X + pp0Y * pp0Y;

        }

        const p1p0X = p1X - p0X;
        const p1p0Y = p1Y - p0Y;

        const t = clamp( ( pp0X * p1p0X + pp0Y * p1p0Y ) / l2, 0, 1 );

        const ptX = p0X + t * p1p0X;
        const ptY = p0Y + t * p1p0Y;

        const pX = p.x - ptX;
        const pY = p.y - ptY;

        return Math.sqrt( pX * pX + pY * pY );

    }

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

    //     return {

    //         x: a.x + ( b.x - a.x ) * frac,
    //         y: a.y + ( b.y - a.y ) * frac

    //     };

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

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function mouseDownHandler( event ) {

        mouseDown = true;

        //---



        if ( editorMode === EDITOR_MODE_ENUM.addStreetSegment ) {

            addStreetSegment( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.addPathSegment ) {

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

            removePathSegmentByPosition( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.movePoint ) {

            addCurrentPointToPath( mouseCursor.position );
            addSelectedPathSegments( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.togglePathWalkable ) {

            togglePathWalkable( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.togglePathDirections ) {

            togglePathDirections( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.showRoute ) {

            //---

        } else if ( editorMode === EDITOR_MODE_ENUM.removeStartEndPoints ) {

            removeStartEndPoints( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.bendPathSegment ) {

            currentPathSegment = getPathSegmentByPosition( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.straightenPathSegment ) {

            straightenPathSegmentByPosition( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.splitPathSegment ) {

            splitPathSegmentByPosition( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.splitPathSegmentAt ) {

            const pathSegment = getPathSegmentByPosition( mousePos );

            if ( pathSegment !== null ) {

                const pointOnPathSegment = getNearestPointOnPathSegmentByPosition( pathSegment, mousePos, 100 );
                const tOnPathSegment = getTOfQuadraticBezierFromIntersectionPoint( pathSegment, pointOnPathSegment, 100 );

                splitPathSegment( pathSegment, tOnPathSegment );

            }

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
            // removeDuplicatePointsFromArray();
            // removeDuplicatePathSegmentsFromArray();

        }

        //---

        if ( currentPathSegment === null ) {

            const pathIndex = 0;

            const path = pathHolder[ pathIndex ];

            for ( let i = 0, l = path.routes.length; i < l; i ++ ) {

                const route = path.routes[ i ];

                const startPoint = route.startPoint;
                const endPoint = route.endPoint;

                if ( startPoint !== null && endPoint !== null ) {

                    findPath( startPoint );

                }

            }

            //---

            startVehicleSimulation();

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
             editorMode === EDITOR_MODE_ENUM.straightenPathSegment ||
             editorMode === EDITOR_MODE_ENUM.splitPathSegment ) {

            tempPathSegments = [];

            //---

            const pathSegment = getPathSegmentByPosition( mousePos );

            if ( pathSegment !== null ) {

                //tempPathSegments.push( { type: 'line', p0: { x: pathSegment.p0.x, y: pathSegment.p0.y }, p1: { x: pathSegment.p1.x, y: pathSegment.p1.y  }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                tempPathSegments.push( { type: 'bezier', p0: { x: pathSegment.p0.x, y: pathSegment.p0.y }, controlPoint: { x: pathSegment.controlPoint.x, y: pathSegment.controlPoint.y }, p1: { x: pathSegment.p1.x, y: pathSegment.p1.y }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                tempPathSegments.push( { type: 'circ', position: { x: pathSegment.p0.x, y: pathSegment.p0.y }, diameter: 12, color: { r: 255, g: 0, b: 255, a: 255 }  } );
                tempPathSegments.push( { type: 'circ', position: { x: pathSegment.p1.x, y: pathSegment.p1.y }, diameter: 12, color: { r: 0, g: 255, b: 255, a: 255 }  } );

            }

        } else if ( editorMode === EDITOR_MODE_ENUM.splitPathSegmentAt ) {

            tempPathSegments = [];

            //---

            const pathSegment = getPathSegmentByPosition( mousePos );

            if ( pathSegment !== null ) {

                //tempPathSegments.push( { type: 'line', p0: { x: pathSegment.p0.x, y: pathSegment.p0.y }, p1: { x: pathSegment.p1.x, y: pathSegment.p1.y  }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                tempPathSegments.push( { type: 'bezier', p0: { x: pathSegment.p0.x, y: pathSegment.p0.y }, controlPoint: { x: pathSegment.controlPoint.x, y: pathSegment.controlPoint.y }, p1: { x: pathSegment.p1.x, y: pathSegment.p1.y }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                tempPathSegments.push( { type: 'circ', position: { x: pathSegment.p0.x, y: pathSegment.p0.y }, diameter: 12, color: { r: 255, g: 0, b: 255, a: 255 }  } );
                tempPathSegments.push( { type: 'circ', position: { x: pathSegment.p1.x, y: pathSegment.p1.y }, diameter: 12, color: { r: 0, g: 255, b: 255, a: 255 }  } );

                const pointOnPathSegment = getNearestPointOnPathSegmentByPosition( pathSegment, mousePos, 100 );

                tempPathSegments.push( { type: 'circfill', position: { x: pointOnPathSegment.x, y: pointOnPathSegment.y }, diameter: 5, color: { r: 255, g: 0, b: 255, a: 255 }  } );

            }

        } else if ( editorMode === EDITOR_MODE_ENUM.movePoint ) {

            if ( mouseDown === true ) {

                movePoint( mousePos );
                // movePoint( mouseCursor.position ); //under construction

            }

        } else if ( editorMode === EDITOR_MODE_ENUM.showRoute ) {

            //findPath( mouseCursor.position );
            showRoute( mouseCursor.position );

        }

        if ( editorMode === EDITOR_MODE_ENUM.bendPathSegment ) {

            if ( mouseDown === true ) {

                bendPathSegment( mousePos );

            }

        }

        if ( editorMode === EDITOR_MODE_ENUM.addStreetSegment ) {

            tempPathSegments = [];

            const streetSegment = currentStreetSegment;

            if ( streetSegment !== null ) {

                streetSegment.crossLanes = [];
                streetSegment.borders = [];
                streetSegment.centerLanes = [];

                //neues street element ohne verbindung zu einem bestehendem street element
                if ( streetSegment.modus === 'new' ) {

                    if ( streetSegment.p0 !== null && streetSegment.p1 === null ) {

                        // const pathDistance = 50;

                        // const tempP1 = { x: mousePos.x, y: mousePos.y };

                        //---

                        // const angleStart = Math.atan2( tempP1.y - streetSegment.p0.y, tempP1.x - streetSegment.p0.x );

                        // const sinA = Math.sin( angleStart );
                        // const cosA = Math.cos( angleStart );

                        // streetSegment.pTS.x = sinA * pathDistance + streetSegment.p0.x;
                        // streetSegment.pTS.y = -cosA * pathDistance + streetSegment.p0.y;
                        // streetSegment.pBS.x = -sinA * pathDistance + streetSegment.p0.x;
                        // streetSegment.pBS.y = cosA * pathDistance + streetSegment.p0.y;

                        // streetSegment.pTE.x = sinA * pathDistance + tempP1.x;
                        // streetSegment.pTE.y = -cosA * pathDistance + tempP1.y;
                        // streetSegment.pBE.x = -sinA * pathDistance + tempP1.x;
                        // streetSegment.pBE.y = cosA * pathDistance + tempP1.y;

                        // streetSegment.centerPoint.x = ( streetSegment.p0.x + tempP1.x ) / 2;
                        // streetSegment.centerPoint.y = ( streetSegment.p0.y + tempP1.y ) / 2;
                        // streetSegment.controlPoint.x = streetSegment.centerPoint.x;
                        // streetSegment.controlPoint.y = streetSegment.centerPoint.y;

                        // streetSegment.pTCenter.x = ( streetSegment.pTS.x + streetSegment.pTE.x ) / 2;
                        // streetSegment.pTCenter.y = ( streetSegment.pTS.y + streetSegment.pTE.y ) / 2;
                        // streetSegment.pTControl.x = streetSegment.pTCenter.x;
                        // streetSegment.pTControl.y = streetSegment.pTCenter.y;

                        // streetSegment.pBCenter.x = ( streetSegment.pBS.x + streetSegment.pBE.x ) / 2;
                        // streetSegment.pBCenter.y = ( streetSegment.pBS.y + streetSegment.pBE.y ) / 2;
                        // streetSegment.pBControl.x = streetSegment.pBCenter.x;
                        // streetSegment.pBControl.y = streetSegment.pBCenter.y;

                        // tempPathSegments.push( { type: 'line', p0: { x: streetSegment.p0.x, y: streetSegment.p0.y }, p1: { x: tempP1.x, y: tempP1.y }, color: { r: 100, g: 100, b: 100, a: 255 } } );

                        // tempPathSegments.push( { type: 'circfill', position: { x: streetSegment.p0.x, y: streetSegment.p0.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );
                        // tempPathSegments.push( { type: 'circfill', position: { x: tempP1.x, y: tempP1.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );

                        // tempPathSegments.push( { type: 'line', p0: { x: streetSegment.pTS.x | 0, y: streetSegment.pTS.y | 0 }, p1: { x: streetSegment.pBS.x | 0, y: streetSegment.pBS.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                        // tempPathSegments.push( { type: 'line', p0: { x: streetSegment.pTE.x | 0, y: streetSegment.pTE.y | 0 }, p1: { x: streetSegment.pBE.x | 0, y: streetSegment.pBE.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );

                        // tempPathSegments.push( { type: 'line', p0: { x: streetSegment.pTS.x | 0, y: streetSegment.pTS.y | 0 }, p1: { x: streetSegment.pTE.x | 0, y: streetSegment.pTE.y | 0 }, color: { r: 255, g: 0, b: 0, a: 255 } } );
                        // tempPathSegments.push( { type: 'line', p0: { x: streetSegment.pBS.x | 0, y: streetSegment.pBS.y | 0 }, p1: { x: streetSegment.pBE.x | 0, y: streetSegment.pBE.y | 0 }, color: { r: 0, g: 255, b: 0, a: 255 } } );

                        // tempPathSegments.push( { type: 'circfill', position: { x: streetSegment.centerPoint.x, y: streetSegment.centerPoint.y }, diameter: 6, color: { r: 155, g: 155, b: 155, a: 255 } } );
                        // tempPathSegments.push( { type: 'circfill', position: { x: streetSegment.pTCenter.x, y: streetSegment.pTCenter.y }, diameter: 6, color: { r: 155, g: 155, b: 155, a: 255 } } );
                        // tempPathSegments.push( { type: 'circfill', position: { x: streetSegment.pBCenter.x, y: streetSegment.pBCenter.y }, diameter: 6, color: { r: 155, g: 155, b: 155, a: 255 } } );

                        // tempPathSegments.push( { type: 'circfill', position: { x: streetSegment.controlPoint.x, y: streetSegment.controlPoint.y }, diameter: 3, color: { r: 255, g: 255, b: 255, a: 255 } } );
                        // tempPathSegments.push( { type: 'circfill', position: { x: streetSegment.pTControl.x, y: streetSegment.pTControl.y }, diameter: 3, color: { r: 255, g: 255, b: 255, a: 255 } } );
                        // tempPathSegments.push( { type: 'circfill', position: { x: streetSegment.pBControl.x, y: streetSegment.pBControl.y }, diameter: 3, color: { r: 255, g: 255, b: 255, a: 255 } } );

                        // tempPathSegments.push( { type: 'circfill', position: { x: streetSegment.pTS.x, y: streetSegment.pTS.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );
                        // tempPathSegments.push( { type: 'circfill', position: { x: streetSegment.pTE.x, y: streetSegment.pTE.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );
                        // tempPathSegments.push( { type: 'circfill', position: { x: streetSegment.pBS.x, y: streetSegment.pBS.y }, diameter: 3, color: { r: 0, g: 255, b: 0, a: 255 } } );
                        // tempPathSegments.push( { type: 'circfill', position: { x: streetSegment.pBE.x, y: streetSegment.pBE.y }, diameter: 3, color: { r: 0, g: 255, b: 0, a: 255 } } );

                    }

                    if ( streetSegment.p1 !== null ) {

                        //---

                    }

                //neues street element mit verbindung zu einem bestehendem street element
                } else if ( streetSegment.modus === 'add' ) {

                    if ( streetSegment.p0 !== null && streetSegment.p1 === null ) {

                        const scanDistance = 10000;

                        const tempP1 = { x: mousePos.x, y: mousePos.y };

                        //---

                        // rechts = Math.PI * 0.00;
                        // unten  = Math.PI * 0.50;
                        // links  = Math.PI * 1.00;
                        // oben   = Math.PI * 1.50;

                        //angleStart muss noch vom dem verbundenen street element übernommen werden
                        const angleStart = Math.PI * 0.98;
                        const angleEnd = Math.atan2( tempP1.y - streetSegment.controlPoint.y, tempP1.x - streetSegment.controlPoint.x );
                        const angleAdjacent = angleStart + Math.PI * 0.50;
                        const angleOpposite = angleStart;
                        const angleIntersection = Math.atan2( tempP1.y - streetSegment.p0.y, tempP1.x - streetSegment.p0.x );

                        const sinStart = Math.sin( angleStart );
                        const cosStart = Math.cos( angleStart );
                        const sinEnd = Math.sin( angleEnd );
                        const cosEnd = Math.cos( angleEnd );
                        const sinAdjacent = Math.sin( angleAdjacent );
                        const cosAdjacent = Math.cos( angleAdjacent );
                        const sinOpposite = Math.sin( angleOpposite );
                        const cosOpposite = Math.cos( angleOpposite );
                        const sinIntersection = Math.sin( angleIntersection );
                        const cosIntersection = Math.cos( angleIntersection );

                        //---
                        //center line/bezier

                        const lineAdjacent = { p0: { x: sinAdjacent * scanDistance + streetSegment.p0.x, y: -cosAdjacent * scanDistance + streetSegment.p0.y }, p1: { x: -sinAdjacent * scanDistance + streetSegment.p0.x, y: cosAdjacent * scanDistance + streetSegment.p0.y } };
                        const lineOpposite = { p0: { x: sinOpposite * scanDistance + tempP1.x, y: -cosOpposite * scanDistance + tempP1.y }, p1: { x: -sinOpposite * scanDistance + tempP1.x, y: cosOpposite * scanDistance + tempP1.y } };
                        const lineHypotenuseCenterPoint = { x: tempP1.x + ( streetSegment.p0.x - tempP1.x ) / 2, y: tempP1.y + ( streetSegment.p0.y - tempP1.y ) / 2 };
                        const lineIntersection = { p0: { x: sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: -cosIntersection * scanDistance + lineHypotenuseCenterPoint.y }, p1: { x: -sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: cosIntersection * scanDistance + lineHypotenuseCenterPoint.y } };

                        //---
                        
                        let intersectionPoint = null;
                        let intersectionPoint0 = getLinesIntersectionPoint( lineAdjacent.p0.x, lineAdjacent.p0.y, lineAdjacent.p1.x, lineAdjacent.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );
                        let intersectionPoint1 = getLinesIntersectionPoint( lineOpposite.p0.x, lineOpposite.p0.y, lineOpposite.p1.x, lineOpposite.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );

                        const distintersectionPoint00 = getDistance( intersectionPoint0, lineHypotenuseCenterPoint );
                        const distintersectionPoint01 = getDistance( intersectionPoint1, lineHypotenuseCenterPoint );

                        if ( distintersectionPoint00 <= distintersectionPoint01 ) {

                            intersectionPoint = intersectionPoint0;

                        } else {

                            intersectionPoint = intersectionPoint1;

                        }

                        streetSegment.controlPoint.x = intersectionPoint.x;
                        streetSegment.controlPoint.y = intersectionPoint.y;
                        streetSegment.centerPoint = interpolateQuadraticBezier( streetSegment.p0, intersectionPoint, tempP1, 0.50 );

                        //---

                        tempPathSegments.push( { type: 'line', p0: { x: lineAdjacent.p0.x, y: lineAdjacent.p0.y }, p1: { x: lineAdjacent.p1.x, y: lineAdjacent.p1.y }, color: { r: 55, g: 55, b: 155, a: 255 } } );
                        tempPathSegments.push( { type: 'line', p0: { x: lineOpposite.p0.x, y: lineOpposite.p0.y }, p1: { x: lineOpposite.p1.x, y: lineOpposite.p1.y }, color: { r: 55, g: 155, b: 55, a: 255 } } );
                        tempPathSegments.push( { type: 'circfill', position: lineHypotenuseCenterPoint, diameter: 5, color: { r: 255, g: 55, b: 55, a: 255 } } );
                        tempPathSegments.push( { type: 'line', p0: { x: lineIntersection.p0.x | 0, y: lineIntersection.p0.y | 0 }, p1: { x: lineIntersection.p1.x | 0, y: lineIntersection.p1.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                        tempPathSegments.push( { type: 'circfill', position: { x: intersectionPoint.x, y: intersectionPoint.y }, diameter: 3, color: { r: 0, g: 255, b: 0, a: 255 } } );
                        tempPathSegments.push( { type: 'circfill', position: { x: streetSegment.centerPoint.x, y: streetSegment.centerPoint.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );
                        tempPathSegments.push( { type: 'line', p0: { x: streetSegment.p0.x, y: streetSegment.p0.y }, p1: { x: tempP1.x, y: tempP1.y }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                        tempPathSegments.push( { type: 'circfill', position: { x: streetSegment.p0.x, y: streetSegment.p0.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );
                        tempPathSegments.push( { type: 'circfill', position: { x: tempP1.x, y: tempP1.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );

                        //---

                        tempPathSegments.push( { type: 'bezier', p0: streetSegment.p0, controlPoint: streetSegment.controlPoint, p1: tempP1, color: { r: 100, g: 100, b: 100, a: 255 } } );

                        //---
                        //lanes

                        if ( streetSegment.lanes.length > 1 ) {

                            const lanePositionSwitch = ( streetSegment.lanes.length / 2 ) - 1;

                            let laneIndex = ( streetSegment.lanes.length / 2 ) * -1;

                            for ( let i = 0, l = streetSegment.lanes.length; i < l; i++ ) {

                                const lane = streetSegment.lanes[ i ];

                                //---

                                let laneDistance = Math.abs( laneIndex ) * streetSegment.laneDistance;

                                //zur mitte hin soll die distance nicht so groß sein
                                if ( i === lanePositionSwitch || i === lanePositionSwitch + 1 ) {

                                    laneDistance = laneDistance / 1.50;

                                }

                                //---

                                //start und end punkte seitlich der mittellinie platzieren
                                if ( i <= lanePositionSwitch ) {

                                    lane.p0.x = sinStart * laneDistance + streetSegment.p0.x;
                                    lane.p0.y = -cosStart * laneDistance + streetSegment.p0.y;
                                    lane.p1.x = sinEnd * laneDistance + tempP1.x;
                                    lane.p1.y = -cosEnd * laneDistance + tempP1.y;

                                } else {

                                    lane.p0.x = -sinStart * laneDistance + streetSegment.p0.x;
                                    lane.p0.y = cosStart * laneDistance + streetSegment.p0.y;
                                    lane.p1.x = -sinEnd * laneDistance + tempP1.x;
                                    lane.p1.y = cosEnd * laneDistance + tempP1.y;

                                }

                                //---
                                //streetBorder

                                let borderDistance = laneDistance;

                                if ( i === 0 && i <= lanePositionSwitch || i === l - 1 && i > lanePositionSwitch ) {

                                    if ( i === 0 ) {

                                        borderDistance *= 1.33;

                                    } else if ( i === l - 1 ) {

                                        borderDistance *= -1.33;

                                    }

                                    const streetBorder = getNewStreetSegmentLane( { x: sinStart * borderDistance + streetSegment.p0.x, y: -cosStart * borderDistance + streetSegment.p0.y }, { x: sinEnd * borderDistance + tempP1.x, y: -cosEnd * borderDistance + tempP1.y }, { x: 0, y: 0 }, { x: 0, y: 0 } );

                                    const lineAdjacent = { p0: { x: sinAdjacent * scanDistance + streetBorder.p0.x, y: -cosAdjacent * scanDistance + streetBorder.p0.y }, p1: { x: -sinAdjacent * scanDistance + streetBorder.p0.x, y: cosAdjacent * scanDistance + streetBorder.p0.y } };
                                    const lineOpposite = { p0: { x: sinOpposite * scanDistance + streetBorder.p1.x, y: -cosOpposite * scanDistance + streetBorder.p1.y }, p1: { x: -sinOpposite * scanDistance + streetBorder.p1.x, y: cosOpposite * scanDistance + streetBorder.p1.y } };
                                    const lineHypotenuseCenterPoint = { x: streetBorder.p1.x + ( streetBorder.p0.x - streetBorder.p1.x ) / 2, y: streetBorder.p1.y + ( streetBorder.p0.y - streetBorder.p1.y ) / 2 };
                                    const lineIntersection = { p0: { x: sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: -cosIntersection * scanDistance + lineHypotenuseCenterPoint.y }, p1: { x: -sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: cosIntersection * scanDistance + lineHypotenuseCenterPoint.y } };

                                    //---

                                    let intersectionPoint = null;
                                    let intersectionPoint0 = getLinesIntersectionPoint( lineAdjacent.p0.x, lineAdjacent.p0.y, lineAdjacent.p1.x, lineAdjacent.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );
                                    let intersectionPoint1 = getLinesIntersectionPoint( lineOpposite.p0.x, lineOpposite.p0.y, lineOpposite.p1.x, lineOpposite.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );

                                    const distintersectionPoint00 = getDistance( intersectionPoint0, lineHypotenuseCenterPoint );
                                    const distintersectionPoint01 = getDistance( intersectionPoint1, lineHypotenuseCenterPoint );

                                    if ( distintersectionPoint00 <= distintersectionPoint01 ) {

                                        intersectionPoint = intersectionPoint0;

                                    } else {

                                        intersectionPoint = intersectionPoint1;

                                    }

                                    streetBorder.controlPoint.x = intersectionPoint.x;
                                    streetBorder.controlPoint.y = intersectionPoint.y;
                                    streetBorder.centerPoint = interpolateQuadraticBezier( streetBorder.p0, streetBorder.controlPoint, streetBorder.p1, 0.50 );

                                    //---

                                    tempPathSegments.push( { type: 'bezier', p0: streetBorder.p0, controlPoint: streetBorder.controlPoint, p1: streetBorder.p1, color: { r: 255, g: 55, b: 255, a: 255 } } );

                                    //---

                                    streetSegment.borders.push( streetBorder );
                                    
                                }

                 
                                //---
                                //lane

                                const lineAdjacent = { p0: { x: sinAdjacent * scanDistance + lane.p0.x, y: -cosAdjacent * scanDistance + lane.p0.y }, p1: { x: -sinAdjacent * scanDistance + lane.p0.x, y: cosAdjacent * scanDistance + lane.p0.y } };
                                const lineOpposite = { p0: { x: sinOpposite * scanDistance + lane.p1.x, y: -cosOpposite * scanDistance + lane.p1.y }, p1: { x: -sinOpposite * scanDistance + lane.p1.x, y: cosOpposite * scanDistance + lane.p1.y } };
                                const lineHypotenuseCenterPoint = { x: lane.p1.x + ( lane.p0.x - lane.p1.x ) / 2, y: lane.p1.y + ( lane.p0.y - lane.p1.y ) / 2 };
                                const lineIntersection = { p0: { x: sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: -cosIntersection * scanDistance + lineHypotenuseCenterPoint.y }, p1: { x: -sinIntersection * scanDistance + lineHypotenuseCenterPoint.x, y: cosIntersection * scanDistance + lineHypotenuseCenterPoint.y } };

                                //---

                                let intersectionPoint = null;
                                let intersectionPoint0 = getLinesIntersectionPoint( lineAdjacent.p0.x, lineAdjacent.p0.y, lineAdjacent.p1.x, lineAdjacent.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );
                                let intersectionPoint1 = getLinesIntersectionPoint( lineOpposite.p0.x, lineOpposite.p0.y, lineOpposite.p1.x, lineOpposite.p1.y, lineIntersection.p0.x, lineIntersection.p0.y, lineIntersection.p1.x, lineIntersection.p1.y );

                                const distintersectionPoint00 = getDistance( intersectionPoint0, lineHypotenuseCenterPoint );
                                const distintersectionPoint01 = getDistance( intersectionPoint1, lineHypotenuseCenterPoint );

                                if ( distintersectionPoint00 <= distintersectionPoint01 ) {

                                    intersectionPoint = intersectionPoint0;

                                } else {

                                    intersectionPoint = intersectionPoint1;

                                }

                                lane.controlPoint.x = intersectionPoint.x;
                                lane.controlPoint.y = intersectionPoint.y;
                                lane.centerPoint = interpolateQuadraticBezier( lane.p0, intersectionPoint, lane.p1, 0.50 );

                                //---

                                tempPathSegments.push( { type: 'line', p0: { x: lane.p0.x, y: lane.p0.y }, p1: { x: lane.p1.x, y: lane.p1.y }, color: { r: 55, g: 55, b: 55, a: 255 } } );
                                tempPathSegments.push( { type: 'line', p0: { x: lineAdjacent.p0.x, y: lineAdjacent.p0.y }, p1: { x: lineAdjacent.p1.x, y: lineAdjacent.p1.y }, color: { r: 25, g: 25, b: 75, a: 255 } } );
                                tempPathSegments.push( { type: 'line', p0: { x: lineOpposite.p0.x, y: lineOpposite.p0.y }, p1: { x: lineOpposite.p1.x, y: lineOpposite.p1.y }, color: { r: 25, g: 75, b: 25, a: 255 } } );
                                tempPathSegments.push( { type: 'circfill', position: lineHypotenuseCenterPoint, diameter: 3, color: { r: 155, g: 55, b: 55, a: 255 } } );
                                tempPathSegments.push( { type: 'line', p0: { x: lineIntersection.p0.x | 0, y: lineIntersection.p0.y | 0 }, p1: { x: lineIntersection.p1.x | 0, y: lineIntersection.p1.y | 0 }, color: { r: 55, g: 55, b: 55, a: 255 } } );
                                tempPathSegments.push( { type: 'circfill', position: { x: intersectionPoint.x, y: intersectionPoint.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );
                                tempPathSegments.push( { type: 'circfill', position: { x: lane.centerPoint.x, y: lane.centerPoint.y }, diameter: 3, color: { r: 55, g: 55, b: 55, a: 255 } } );
                                tempPathSegments.push( { type: 'line', p0: { x: lane.p0.x | 0, y: lane.p0.y | 0 }, p1: { x: streetSegment.p0.x | 0, y: streetSegment.p0.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                                tempPathSegments.push( { type: 'line', p0: { x: lane.p1.x | 0, y: lane.p1.y | 0 }, p1: { x: tempP1.x | 0, y: tempP1.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                                tempPathSegments.push( { type: 'circfill', position: lane.p0, diameter: 3, color: { r: 155, g: 155, b: 155, a: 255 } } );
                                tempPathSegments.push( { type: 'circfill', position: lane.p1, diameter: 3, color: { r: 155, g: 155, b: 155, a: 255 } } );

                                //---

                                tempPathSegments.push( { type: 'bezier', p0: lane.p0, controlPoint: lane.controlPoint, p1: lane.p1, color: { r: 255, g: 55, b: 55, a: 255 } } );

                                //---
                                //center lanes & cross lanes

                                //nur wenn es mehr als eine lane gibt
                                if ( l > 1 ) {

                                    //erst ab lane 1, damit auf lane 0 zurückgergriffen werden kann
                                    if ( i > 0 && i !== lanePositionSwitch + 1 ) {

                                        const laneTemp = streetSegment.lanes[ i - 1 ];

                                        //---
                                        //const lane center

                                        const centerLane = getNewStreetSegmentLane( { x: ( laneTemp.p0.x + lane.p0.x ) / 2, y: ( laneTemp.p0.y + lane.p0.y ) / 2 }, { x: ( laneTemp.p1.x + lane.p1.x ) / 2, y: ( laneTemp.p1.y + lane.p1.y ) / 2 }, { x: 0, y: 0 }, { x: 0, y: 0 } );

                                        //---

                                        const centerLane0Adjacent = { p0: { x: sinAdjacent * scanDistance + centerLane.p0.x, y: -cosAdjacent * scanDistance + centerLane.p0.y }, p1: { x: -sinAdjacent * scanDistance + centerLane.p0.x, y: cosAdjacent * scanDistance + centerLane.p0.y } };
                                        const centerLane0Opposite = { p0: { x: sinOpposite * scanDistance + centerLane.p1.x, y: -cosOpposite * scanDistance + centerLane.p1.y }, p1: { x: -sinOpposite * scanDistance + centerLane.p1.x, y: cosOpposite * scanDistance + centerLane.p1.y } };
                                        const centerLane0HypotenuseCenterPoint = { x: centerLane.p1.x + ( centerLane.p0.x - centerLane.p1.x ) / 2, y: centerLane.p1.y + ( centerLane.p0.y - centerLane.p1.y ) / 2 };
                                        const centerLane0Intersection = { p0: { x: sinIntersection * scanDistance + centerLane0HypotenuseCenterPoint.x, y: -cosIntersection * scanDistance + centerLane0HypotenuseCenterPoint.y }, p1: { x: -sinIntersection * scanDistance + centerLane0HypotenuseCenterPoint.x, y: cosIntersection * scanDistance + centerLane0HypotenuseCenterPoint.y } };

                                        //---

                                        let centerLane0IntersectiobPoint = null;
                                        let centerLane0IntersectiobPoint0 = getLinesIntersectionPoint( centerLane0Adjacent.p0.x, centerLane0Adjacent.p0.y, centerLane0Adjacent.p1.x, centerLane0Adjacent.p1.y, centerLane0Intersection.p0.x, centerLane0Intersection.p0.y, centerLane0Intersection.p1.x, centerLane0Intersection.p1.y );
                                        let centerLane0IntersectiobPoint1 = getLinesIntersectionPoint( centerLane0Opposite.p0.x, centerLane0Opposite.p0.y, centerLane0Opposite.p1.x, centerLane0Opposite.p1.y, centerLane0Intersection.p0.x, centerLane0Intersection.p0.y, centerLane0Intersection.p1.x, centerLane0Intersection.p1.y );

                                        const distcenterLane0IntersectiobPoint00 = getDistance( centerLane0IntersectiobPoint0, centerLane0HypotenuseCenterPoint );
                                        const distcenterLane0IntersectiobPoint01 = getDistance( centerLane0IntersectiobPoint1, centerLane0HypotenuseCenterPoint );

                                        if ( distcenterLane0IntersectiobPoint00 <= distcenterLane0IntersectiobPoint01 ) {

                                            centerLane0IntersectiobPoint = centerLane0IntersectiobPoint0;

                                        } else {

                                            centerLane0IntersectiobPoint = centerLane0IntersectiobPoint1;

                                        }

                                        centerLane.controlPoint.x = centerLane0IntersectiobPoint.x;
                                        centerLane.controlPoint.y = centerLane0IntersectiobPoint.y;
                                        centerLane.centerPoint = interpolateQuadraticBezier( centerLane.p0, centerLane.controlPoint, centerLane.p1, 0.50 );

                                        streetSegment.centerLanes.push( centerLane );





                                        //---
                                        //cross lanes

                                        const l0 = getNewStreetSegmentLane( { x: lane.p0.x, y: lane.p0.y }, { x: laneTemp.p1.x, y: laneTemp.p1.y }, { x: 0, y: 0 }, { x: 0, y: 0 } );
                                        const l1 = getNewStreetSegmentLane( { x: laneTemp.p0.x, y: laneTemp.p0.y }, { x: lane.p1.x, y: lane.p1.y }, { x: 0, y: 0 }, { x: 0, y: 0 } );


                                        const lineAdjacent0 = { p0: { x: sinAdjacent * scanDistance + centerLane.p0.x, y: -cosAdjacent * scanDistance + centerLane.p0.y }, p1: { x: -sinAdjacent * scanDistance + centerLane.p0.x, y: cosAdjacent * scanDistance + centerLane.p0.y } };
                                        const lineAdjacent1 = { p0: { x: sinAdjacent * scanDistance + centerLane.p0.x, y: -cosAdjacent * scanDistance + centerLane.p0.y }, p1: { x: -sinAdjacent * scanDistance + centerLane.p0.x, y: cosAdjacent * scanDistance + centerLane.p0.y } };
                                        const lineOpposite0 = { p0: { x: sinOpposite * scanDistance + centerLane.p1.x, y: -cosOpposite * scanDistance + centerLane.p1.y }, p1: { x: -sinOpposite * scanDistance + centerLane.p1.x, y: cosOpposite * scanDistance + centerLane.p1.y } };
                                        const lineOpposite1 = { p0: { x: sinOpposite * scanDistance + centerLane.p1.x, y: -cosOpposite * scanDistance + centerLane.p1.y }, p1: { x: -sinOpposite * scanDistance + centerLane.p1.x, y: cosOpposite * scanDistance + centerLane.p1.y } };

                                        //----

                                        const angleIntersection0 = Math.atan2( l0.p1.y - l0.p0.y, l0.p1.x - l0.p0.x );
                                        const sinIntersection0 = Math.sin( angleIntersection0 );
                                        const cosIntersection0 = Math.cos( angleIntersection0 );

                                        const lineHypotenuseCenterPoint0 = { x: l0.p1.x + ( l0.p0.x - l0.p1.x ) / 2, y: l0.p1.y + ( l0.p0.y - l0.p1.y ) / 2 };
                                        const lineIntersection0 = { p0: { x: sinIntersection0 * scanDistance + lineHypotenuseCenterPoint0.x, y: -cosIntersection0 * scanDistance + lineHypotenuseCenterPoint0.y }, p1: { x: -sinIntersection0 * scanDistance + lineHypotenuseCenterPoint0.x, y: cosIntersection0 * scanDistance + lineHypotenuseCenterPoint0.y } };
                                        
                                        let intersectionPoint0 = null;
                                        let intersectionPoint00 = getLinesIntersectionPoint( lineAdjacent0.p0.x, lineAdjacent0.p0.y, lineAdjacent0.p1.x, lineAdjacent0.p1.y, lineIntersection0.p0.x, lineIntersection0.p0.y, lineIntersection0.p1.x, lineIntersection0.p1.y );
                                        let intersectionPoint01 = getLinesIntersectionPoint( lineOpposite0.p0.x, lineOpposite0.p0.y, lineOpposite0.p1.x, lineOpposite0.p1.y, lineIntersection0.p0.x, lineIntersection0.p0.y, lineIntersection0.p1.x, lineIntersection0.p1.y );

                                        const distintersectionPoint00 = getDistance( intersectionPoint00, lineHypotenuseCenterPoint0 );
                                        const distintersectionPoint01 = getDistance( intersectionPoint01, lineHypotenuseCenterPoint0 );

                                        if ( distintersectionPoint00 <= distintersectionPoint01 ) {

                                            intersectionPoint0 = intersectionPoint00;

                                        } else {

                                            intersectionPoint0 = intersectionPoint01;

                                        }

                                        
                                        l0.controlPoint.x = intersectionPoint0.x;
                                        l0.controlPoint.y = intersectionPoint0.y;
                                        l0.centerPoint = interpolateQuadraticBezier( l0.p0, intersectionPoint0, l0.p1, 0.50 );

                                        //---

                                        const angleIntersection1 = Math.atan2( l1.p1.y - l1.p0.y, l1.p1.x - l1.p0.x );
                                        const sinIntersection1 = Math.sin( angleIntersection1 );
                                        const cosIntersection1 = Math.cos( angleIntersection1 );

                                        const lineHypotenuseCenterPoint1 = { x: l1.p1.x + ( l1.p0.x - l1.p1.x ) / 2, y: l1.p1.y + ( l1.p0.y - l1.p1.y ) / 2 };
                                        const lineIntersection1 = { p0: { x: sinIntersection1 * scanDistance + lineHypotenuseCenterPoint1.x, y: -cosIntersection1 * scanDistance + lineHypotenuseCenterPoint1.y }, p1: { x: -sinIntersection1 * scanDistance + lineHypotenuseCenterPoint1.x, y: cosIntersection1 * scanDistance + lineHypotenuseCenterPoint1.y } };
                                        
                                        let intersectionPoint1 = null;
                                        let intersectionPoint10 = getLinesIntersectionPoint( lineAdjacent1.p0.x, lineAdjacent1.p0.y, lineAdjacent1.p1.x, lineAdjacent1.p1.y, lineIntersection1.p0.x, lineIntersection1.p0.y, lineIntersection1.p1.x, lineIntersection1.p1.y );
                                        let intersectionPoint11 = getLinesIntersectionPoint( lineOpposite1.p0.x, lineOpposite1.p0.y, lineOpposite1.p1.x, lineOpposite1.p1.y, lineIntersection1.p0.x, lineIntersection1.p0.y, lineIntersection1.p1.x, lineIntersection1.p1.y );

                                        const distIntersectionPoint10 = getDistance( intersectionPoint10, lineHypotenuseCenterPoint1 );
                                        const distIntersectionPoint11 = getDistance( intersectionPoint11, lineHypotenuseCenterPoint1 );

                                        if ( distIntersectionPoint10 <= distIntersectionPoint11 ) {

                                            intersectionPoint1 = intersectionPoint10;

                                        } else {

                                            intersectionPoint1 = intersectionPoint11;

                                        }

                                        
                                        l1.controlPoint.x = intersectionPoint1.x;
                                        l1.controlPoint.y = intersectionPoint1.y;
                                        l1.centerPoint = interpolateQuadraticBezier( l1.p0, intersectionPoint1, l1.p1, 0.50 );

                                        //---

                                        tempPathSegments.push( { type: 'line', p0: { x: l0.p0.x | 0, y: l0.p0.y | 0 }, p1: { x: l0.p1.x | 0, y: l0.p1.y | 0 }, color: { r: 155, g: 155, b: 55, a: 255 } } );
                                        tempPathSegments.push( { type: 'line', p0: { x: l1.p0.x | 0, y: l1.p0.y | 0 }, p1: { x: l1.p1.x | 0, y: l1.p1.y | 0 }, color: { r: 55, g: 155, b: 155, a: 255 } } );
                                        tempPathSegments.push( { type: 'circfill', position: centerLane.p0, diameter: 3, color: { r: 55, g: 255, b: 55, a: 255 } } );
                                        tempPathSegments.push( { type: 'circfill', position: centerLane.p1, diameter: 3, color: { r: 55, g: 255, b: 55, a: 255 } } );
                                        tempPathSegments.push( { type: 'line', p0: { x: lineAdjacent0.p0.x, y: lineAdjacent0.p0.y }, p1: { x: lineAdjacent0.p1.x, y: lineAdjacent0.p1.y }, color: { r: 25, g: 25, b: 255, a: 255 } } );
                                        tempPathSegments.push( { type: 'line', p0: { x: lineAdjacent1.p0.x, y: lineAdjacent1.p0.y }, p1: { x: lineAdjacent1.p1.x, y: lineAdjacent1.p1.y }, color: { r: 25, g: 25, b: 255, a: 255 } } );
                                        tempPathSegments.push( { type: 'line', p0: { x: lineOpposite0.p0.x, y: lineOpposite0.p0.y }, p1: { x: lineOpposite0.p1.x, y: lineOpposite0.p1.y }, color: { r: 25, g: 255, b: 25, a: 255 } } );
                                        tempPathSegments.push( { type: 'line', p0: { x: lineOpposite1.p0.x, y: lineOpposite1.p0.y }, p1: { x: lineOpposite1.p1.x, y: lineOpposite1.p1.y }, color: { r: 25, g: 255, b: 25, a: 255 } } );

                                        tempPathSegments.push( { type: 'circfill', position: lineHypotenuseCenterPoint0, diameter: 3, color: { r: 255, g: 55, b: 55, a: 255 } } );
                                        tempPathSegments.push( { type: 'line', p0: { x: lineIntersection0.p0.x | 0, y: lineIntersection0.p0.y | 0 }, p1: { x: lineIntersection0.p1.x | 0, y: lineIntersection0.p1.y | 0 }, color: { r: 55, g: 55, b: 55, a: 255 } } );

                                        tempPathSegments.push( { type: 'circfill', position: lineHypotenuseCenterPoint1, diameter: 3, color: { r: 155, g: 55, b: 55, a: 255 } } );
                                        tempPathSegments.push( { type: 'line', p0: { x: lineIntersection1.p0.x | 0, y: lineIntersection1.p0.y | 0 }, p1: { x: lineIntersection1.p1.x | 0, y: lineIntersection1.p1.y | 0 }, color: { r: 55, g: 55, b: 55, a: 255 } } );

                                        tempPathSegments.push( { type: 'circfill', position: intersectionPoint0, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );
                                        tempPathSegments.push( { type: 'circfill', position: intersectionPoint1, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );

                                        //---

                                        tempPathSegments.push( { type: 'bezier', p0: l0.p0, controlPoint: l0.controlPoint, p1: l0.p1, color: { r: 200, g: 200, b: 200, a: 255 } } );
                                        tempPathSegments.push( { type: 'bezier', p0: l1.p0, controlPoint: l1.controlPoint, p1: l1.p1, color: { r: 200, g: 200, b: 200, a: 255 } } );

                                        //---

                                        streetSegment.crossLanes.push( l0, l1 );

                                    }

                                } 

                                //---

                                laneIndex++;

                                if ( laneIndex === 0 ) {

                                    laneIndex++;

                                }

                            }

                        } else {

                            const lane = streetSegment.lanes[ 0 ];

                            lane.p0.x = streetSegment.p0.x;
                            lane.p0.y = streetSegment.p0.y;
                            lane.p1.x = tempP1.x;
                            lane.p1.y = tempP1.y;
                            lane.controlPoint.x = streetSegment.controlPoint.x;
                            lane.controlPoint.y = streetSegment.controlPoint.y;
                            lane.centerPoint.x = streetSegment.centerPoint.x;
                            lane.centerPoint.y = streetSegment.centerPoint.y;

                            tempPathSegments.push( { type: 'bezier', p0: lane.p0, controlPoint: lane.controlPoint, p1: lane.p1, color: { r: 200, g: 200, b: 200, a: 255 } } );

                        }

                        //---
                        
                    }

                    if ( streetSegment.p1 !== null ) {

                        //---

                    }

                }

            }

        }

    }

    function getMousePos( canvas, event ) {

        const rect = canvas.getBoundingClientRect();

        return { x: event.clientX - rect.left, y: event.clientY - rect.top };

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

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

    //--- ------------------------------------------------------------------------------------------------------------------------------

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

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function getPointAndAngleOnRouteByT( t, routeIndex ) {

        const pathIndex = 0;

        const path = pathHolder[ pathIndex ];

        //---

        const route = path.routes[ routeIndex ];

        const output = {

            point: null,
            angle: 0

        };

        const routeLength = route.length;
        const tLength = t * routeLength;

        let curLength = 0;
        let lastLength = 0;

        for ( let i = 0, l = route.pathSegments.length; i < l; i ++ ) {

            const pathSegment = route.pathSegments[ i ];

            curLength += pathSegment.length;

            if ( tLength <= curLength ) {

                const tPathSegment = ( tLength - lastLength ) / pathSegment.length;

                const point0 = interpolateQuadraticBezier( pathSegment.p0, pathSegment.controlPoint, pathSegment.p1, tPathSegment );
                const point1 = interpolateQuadraticBezier( pathSegment.p0, pathSegment.controlPoint, pathSegment.p1, tPathSegment + 0.001 );

                output.point = point0;
                output.angle = Math.atan2( point0.y - point1.y, point0.x - point1.x );

                break;

            }

            lastLength = curLength;

        }

        //---

        return output;

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function drawImageData() {

        mouseCursor.position.x = mousePos.x;
        mouseCursor.position.y = mousePos.y;
        mouseCursor.color = { r: 255, g: 255, b: 255, a: 255 };

        pathHolder.forEach( ( path, index ) => {

            // let distanceAtTheMoment = Infinity;
            // let pathSegmentSelected = null;

            // if ( editorMode === EDITOR_MODE_ENUM.addPathSegment ) {

            //     for ( let i = 0, l = path.segments.length; i < l; i ++ ) {

            //         const pathSegment = path.segments[ i ];

            //         if ( pathSegment.p0 !== null && pathSegment.p1 !== null ) {

            //             const distanceToSegment = signedDistanceToQuadraticBezier( mousePos, pathSegment.p0, pathSegment.p1, pathSegment.controlPoint, 25 );

            //             if ( distanceAtTheMoment > distanceToSegment ) {

            //                 distanceAtTheMoment = distanceToSegment;

            //                 if ( distanceAtTheMoment <= SNAP_TO_DISTANCE ) {

            //                     pathSegmentSelected = pathSegment;

            //                 }

            //             }

            //         }

            //     }

            //     if ( pathSegmentSelected !== null ) {



            //     }

            // }

            // //console.log( 'd: ', d );
            // //console.log( 'pathSegmentSelected: ', pathSegmentSelected );

            for ( let i = 0, l = path.segments.length; i < l; i ++ ) {

                const pathSegment = path.segments[ i ];

                if ( pathSegment.p0 !== null && pathSegment.p1 !== null ) {

                    //const distanceToSegment = signedDistanceToQuadraticBezier( mousePos, pathSegment.p0, pathSegment.p1, pathSegment.controlPoint, 25 );

                    //console.log( distanceToSegment );



                    //---

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

                        // if ( allowPathSegmentSplitting === true ) {

                        //     const tempPathSegment = {

                        //         id: pathSegment.id,
                        //         p0: pathSegment.p0,
                        //         p1: { x: mouseCursor.position.x, y: mouseCursor.position.y }

                        //     };

                        //     showPathSegmentIntersectionPointsWithLine( tempPathSegment );

                        // }

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

            for ( let i = 0, l = path.streetSegments.length; i < l; i ++ ) {

                const streetSegment = path.streetSegments[ i ];

                if ( streetSegment.p0 !== null && streetSegment.p1 === null ) {



                }

                if ( streetSegment.p1 !== null ) {



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

        //---

        // simulateVehicles();

    }

    function drawContext() {

        drawStreetSegments();
        simulateVehicles();

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function initVehicles() {

        vehiclesHolder = [];
        vehcileImageHolder = [];

        for ( let i = 0, l = 40; i < l; i ++ ) {

            let fileIndex = ( i + 1 ).toString();

            while ( fileIndex.length < 3 ) { fileIndex = '0' + fileIndex; };

            const filePath = './img/car_' + fileIndex + '.png'

            const vehicleImage = new Image();

            vehicleImage.crossOrigin = 'anonymous';
            vehicleImage.src = filePath;

            vehcileImageHolder.push( vehicleImage );

        }

        startVehicleSimulation();

    }

    function startVehicleSimulation() {

        stopVehicleSimulation();

        vehicleTimer = setInterval( addVehicle, VEHICLE_INTERVAL );

        addVehicle();

    }

    function stopVehicleSimulation() {

        if ( vehicleTimer !== null ) {

            clearInterval( vehicleTimer );

            vehicleTimer = null;

        }

    }

    function addVehicle() {

        if ( simulationRuns === true ) {

            const pathIndex = 0;

            const path = pathHolder[ pathIndex ];

            for ( let i = 0, l = path.routes.length; i < l; i ++ ) {

                const routeIndex = i;
                const route = path.routes[ routeIndex ];

                if ( route.startPoint === null || route.endPoint === null || route.complete === false ) {

                    continue;

                }

                const routePositionObject = getPointAndAngleOnRouteByT( 0, routeIndex );

                const vehicleImage = vehcileImageHolder[ Math.floor( Math.random() * vehcileImageHolder.length ) ];
                const vehicle = getVehicle( routePositionObject.point, routePositionObject.angle, 0, pathIndex, routeIndex, 0.0015, vehicleImage );

                vehiclesHolder.push( vehicle );

            }

        }

    }

    function removeVehiclesByRouteIndex( routeIndex ) {

        for ( let i = 0, l = vehiclesHolder.length; i < l; i ++ ) {

            const vehicle = vehiclesHolder[ i ];

            if ( vehicle.routeIndex === routeIndex ) {

                vehicle.t = 1;

            } else if ( vehicle.routeIndex > routeIndex ) {

                vehicle.routeIndex--;

            }

        }

        vehiclesHolder = vehiclesHolder.filter( ( v ) => v.t !== 1 );

    }

    function getVehicle( position, angle = 0, t = 0, pathIndex = 0, routeIndex = 0, speed = 0.0015, image = null ) {

        const vehicle = {

            position: { x: position.x, y: position.y },
            angle: angle,
            t: t,
            pathIndex: pathIndex,
            routeIndex: routeIndex,
            speed: speed,
            image: image

        }

        return vehicle;

    }

    function simulateVehicles() {

        for ( let i = 0, l = vehiclesHolder.length; i < l; i ++ ) {

            const vehicle = vehiclesHolder[ i ];

            const route = pathHolder[ vehicle.pathIndex ].routes[ vehicle.routeIndex ];
            const routePositionObject = getPointAndAngleOnRouteByT( vehicle.t, vehicle.routeIndex );

            vehicle.position = routePositionObject.point;
            vehicle.angle = routePositionObject.angle;

            // const angleOnRoute0 = vehicle.angle;
            // const angleOnRoute1 = angleOnRoute0 + Math.PI * 0.50;
            const angleOnRoute3 = vehicle.angle + Math.PI * -0.50;

            // const length = 15;

            // const sinA0 = Math.sin( angleOnRoute0 );
            // const cosA0 = Math.cos( angleOnRoute0 );
            // const sinA1 = Math.sin( angleOnRoute1 );
            // const cosA1 = Math.cos( angleOnRoute1 );

            // drawCircle( vehicle.position, 5, 230, 29, 95, 255 );
            // drawLine( ( sinA0 * length + vehicle.position.x ) | 0, ( -cosA0 * length + vehicle.position.y ) | 0, ( -sinA0 * length + vehicle.position.x ) | 0, ( cosA0 * length + vehicle.position.y ) | 0, 0, 0, 255, 255 );
            // drawLine( ( sinA1 * length + vehicle.position.x ) | 0, ( -cosA1 * length + vehicle.position.y ) | 0, ( -sinA1 * length + vehicle.position.x ) | 0, ( cosA1 * length + vehicle.position.y ) | 0, 255, 255, 255, 255 );

            // context.drawImage( square[ 'tileObj' + tileType ].image, 0, 0, imgWidth, imgHeight, imgX, imgY, imgWidth, imgHeight );

            //context.drawImage( vehicleTestImage, vehicle.position.x - 10, vehicle.position.y - 10, 20, 20 );

            context.save();
            context.translate( vehicle.position.x, vehicle.position.y );
            context.rotate( angleOnRoute3 );
            context.drawImage( vehicle.image, -10, -10, 20, 20 );
            context.rotate( -angleOnRoute3 );
            context.translate( -vehicle.position.x, -vehicle.position.y );
            context.restore();

            if ( route.complete === true && simulationRuns === true ) {

                vehicle.t += vehicle.speed;

                if ( vehicle.t > 1 ) {

                    vehicle.t = 1;

                }

            }

        }

        vehiclesHolder = vehiclesHolder.filter( ( v ) => v.t !== 1 );

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function render( timestamp ) {

        clearImageData();

        //---

        drawImageData();

        //---

        context.putImageData( imageData, 0, 0 );

        //---

        drawContext();

        //---

        stats.update();

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

    //--- ------------------------------------------------------------------------------------------------------------------------------

    init();
    initGUI();

    //--- ------------------------------------------------------------------------------------------------------------------------------

} );