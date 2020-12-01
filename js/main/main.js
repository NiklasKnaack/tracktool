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

        addGraphSegment: 'addGraphSegment',
        removeGraphSegment: 'removeGraphSegment',
        bendGraphSegment: 'bendGraphSegment',
        straightenGraphSegment: 'straightenGraphSegment',
        splitGraphSegment: 'splitGraphSegment',
        splitGraphSegmentAt: 'splitGraphSegmentAt',
        toggleGraphWalkable: 'toggleGraphWalkable',
        toggleGraphDirections: 'toggleGraphDirections',
        addStartPoint: 'addStartPoint',
        addEndPoint: 'addEndPoint',
        removeStartEndPoints: 'removeStartEndPoints',
        getGraphSegment: 'getGraphSegment',
        togglePointWalkable: 'togglePointWalkable',
        movePoint: 'movePoint',
        showRoute: 'showRoute',
        addStreetSegment: 'addStreetSegment'

    } );

    const GRAPH_SEGMENT_DIRECTIONS = [ '><', '>', '<' ];
    const GRAPH_SEGMENT_CURVE_ACCURACY = 5;

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
        { r: 123, g: 192, b:  67, a: 255 },
        { r: 255, g:   0, b:   0, a: 255 },
        { r:   0, g: 255, b:   0, a: 255 },
        { r:   0, g:   0, b: 255, a: 255 },
    ];

    let editorMode = EDITOR_MODE_ENUM.addGraphSegment;

    const VEHICLE_INTERVAL = 500;

    const pathfinder = new Pathfinder();

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

    let simulationRuns = false;

    let currentNode = null;
    let currentGraphSegment = null;
    let selectedGraphSegments = [];
    // let allowGraphSegmentSplitting = true;
    let tempGraphSegments = [];

    let currentStreetSegment = null;

    let graphHolder = [
        {
            id: 0,
            routes: [
                { startPoint: { x: 60, y: 218 }, endPoint: { x: 785, y: 877 }, graphSegments: [], length: 0, complete: false },
                // { startPoint: { x: 170, y: 835 }, endPoint: { x: 715, y: 51 }, graphSegments: [], length: 0, complete: false },
                // { startPoint: { x: 906, y: 57 }, endPoint: { x: 868, y: 784 }, graphSegments: [], length: 0, complete: false },
            ],
            streetPoints: [],
            streetSegments: [],
            points: [
                { x: 170, y: 835, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 180, y: 716, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 153, y: 584, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 203, y: 427, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 170, y: 263, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 191, y: 70, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 347, y: 63, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 362, y: 232, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 363, y: 325, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 383, y: 418, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 370, y: 567, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 396, y: 689, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 385, y: 798, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 413, y: 890, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 578, y: 898, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 578, y: 757, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 568, y: 646, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 578, y: 501, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 562, y: 369, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 593, y: 249, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 548, y: 127, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 606, y: 41, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 715, y: 51, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 725, y: 147, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 722, y: 271, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 753, y: 390, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 745, y: 547, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 801, y: 683, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 758, y: 766, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 785, y: 877, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 868, y: 784, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 60, y: 218, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 57, y: 582, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 91, y: 741, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 952, y: 416, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 645, y: 341, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 270, y: 465, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 266, y: 915, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 867, y: 157, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 906, y: 57, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 874, y: 547, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 938, y: 757, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
                { x: 122, y: 426, walkable: true, cost: 0, parentPoint: null, visited: false, neighbourGraphsegments: [], neighbourPoints: [] },
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
                { id: 13, p0: { x: 578, y: 757 }, p1: { x: 568, y: 646 }, walkable: true, direction: '><', centerPoint: { x: 526, y: 717.75 }, controlPoint: { x: 479, y: 734 }, length: 153.91204041072916 },
                { id: 14, p0: { x: 568, y: 646 }, p1: { x: 578, y: 501 }, walkable: true, direction: '><', centerPoint: { x: 616, y: 570.25 }, controlPoint: { x: 659, y: 567 }, length: 173.2832564115281 },
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
                { id: 48, p0: { x: 867, y: 157 }, p1: { x: 725, y: 147 }, walkable: true, direction: '><', centerPoint: { x: 831, y: 265.5 }, controlPoint: { x: 866, y: 379 }, length: 283.14586710344025 },
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

    setAllGraphSegmentPointNeighbours();

    pathfinder.computeRoutes( graphHolder[ 0 ], ( routes, time ) => {

        graphHolder[ 0 ].routes = routes;

        console.log( 'Der Aufruf von computeRoutes dauerte ' + time + ' Millisekunden.' );

    } );

    if ( debugMode === true ) {

        rebuildDebugElements();

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function initGUI() {


        const _addStreetSegment = () => {

            editorMode = EDITOR_MODE_ENUM.addStreetSegment;

        }

        const _addGraphSegment = () => {

            editorMode = EDITOR_MODE_ENUM.addGraphSegment;

        }

        const _removeGraphSegment = () => {

            editorMode = EDITOR_MODE_ENUM.removeGraphSegment;

        }

        const _bendGraphSegment = () => {

            editorMode = EDITOR_MODE_ENUM.bendGraphSegment;

        }

        const _straightenGraphSegment = () => {

            editorMode = EDITOR_MODE_ENUM.straightenGraphSegment;

        }

        const _splitGraphSegment = () => {

            editorMode = EDITOR_MODE_ENUM.splitGraphSegment;

        }

        const _splitGraphSegmentAt = () => {

            editorMode = EDITOR_MODE_ENUM.splitGraphSegmentAt;

        }

        const _toggleGraphWalkable = () => {

            editorMode = EDITOR_MODE_ENUM.toggleGraphWalkable;

        }

        const _toggleGraphDirections = () => {

            editorMode = EDITOR_MODE_ENUM.toggleGraphDirections;

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

        const _getGraphSegment = () => {

            editorMode = EDITOR_MODE_ENUM.getGraphSegment;

        }

        const _clearAll = () => {

            const graphIndex = 0;

            graphHolder[ graphIndex ] = {
                id: graphIndex,
                routes: [],
                points: [],
                openSet: [],
                closedSet: [],
                segments: [],
                streetSegments: []
            }

            tempGraphSegments = [];

            currentNode = null;
            currentGraphSegment = null;
            currentStreetSegment = null;
            selectedGraphSegments = [];

            vehiclesHolder = [];

            stopVehicleSimulation();

            removeDebugElements();

        }

        const _logGraph = () => {

            const graphIndex = 0;

            const graph = graphHolder[ graphIndex ];

            let output = '';

            output += 'id: ' + graphIndex + ',\n';
            output += 'routes: [' + '\n';

            for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

                const route = graph.routes[ i ];

                output += '    { startPoint: { x: ' + route.startPoint.x + ', y: ' + route.startPoint.y + ' }, endPoint: { x: ' + route.endPoint.x + ', y: ' + route.endPoint.y + ' }, graphSegments: [], length: 0, complete: false }';

                if ( i < l ) {

                    output += ',\n';

                } else {

                    output += '\n';

                }

            }

            output += '],' + '\n';

            output += 'streetPoints: ' + '[],' + '\n';
            output += 'streetSegments: ' + '[],' + '\n';

            output += 'points: [' + '\n';

            for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

                const point = graph.points[ i ];

                output += '    { x: ' + point.x + ', y: ' + point.y + ', walkable: ' + point.walkable + ', cost: ' + '0' + ', parentPoint: ' + 'null' + ', visited: ' + 'false' + ', neighbourGraphsegments: ' + '[]' + ', neighbourPoints: ' + '[]' + ' }';

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

            for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

                const graphSegment = graph.segments[ i ];

                output += '    { id: ' + graphSegment.id + ', p0: ' + '{ x: ' + graphSegment.p0.x + ', y: ' + graphSegment.p0.y + ' }' + ', p1: ' + '{ x: ' + graphSegment.p1.x + ', y: ' + graphSegment.p1.y + ' }' + ', walkable: ' +  graphSegment.walkable + ', direction: "' +  graphSegment.direction + '", centerPoint: ' + '{ x: ' + graphSegment.centerPoint.x + ', y: ' + graphSegment.centerPoint.y + ' }' + ', controlPoint: { x: ' + graphSegment.controlPoint.x + ', y: ' + graphSegment.controlPoint.y + ' }, length: ' + graphSegment.length + ' }';

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
            'Add Graph Segment': _addGraphSegment,
            // 'Allow Graph Segment Splitting': allowGraphSegmentSplitting,
            'Remove Graph Segment': _removeGraphSegment,
            'Bend Graph Segment': _bendGraphSegment,
            'Straighten Graph Segment': _straightenGraphSegment,
            'Split Graph Segment': _splitGraphSegment,
            'Split Graph Segment At': _splitGraphSegmentAt,
            'Toggle Graph Walkable': _toggleGraphWalkable,
            'Toggle Graph Directions': _toggleGraphDirections,
            'Move Point': _movePoint,
            'Add Start Point': _addStartPoint,
            'Add End Point': _addEndPoint,
            'Remove Start & End Points': _removeStartEndPoints,
            'Toggle Walkable Point': _setToggleWalkable,
            'Clear All': _clearAll,
            'Get GraphSegment': _getGraphSegment,
            'Log Graph': _logGraph,
            'Show Route': _showRoute,
            'Toggle Debug Mode': _toggleDebugMode,
            'Play/Pause Simulation': _playPauseSimulation,
            '@niklaswebdev': _linkTo

        }

        const gui = new dat.GUI();

        const folderEdit = gui.addFolder( 'Edit' );

        folderEdit.open();
        folderEdit.add( guiSetting, 'Add Street Segment' );
        folderEdit.add( guiSetting, 'Add Graph Segment' );
        // folderEdit.add( guiSetting, 'Allow Graph Segment Splitting' ).onChange( () => { allowGraphSegmentSplitting = guiSetting[ 'Allow Graph Segment Splitting' ]; } );
        folderEdit.add( guiSetting, 'Remove Graph Segment' );
        folderEdit.add( guiSetting, 'Bend Graph Segment' );
        folderEdit.add( guiSetting, 'Straighten Graph Segment' );
        folderEdit.add( guiSetting, 'Split Graph Segment' );
        folderEdit.add( guiSetting, 'Split Graph Segment At' );
        folderEdit.add( guiSetting, 'Toggle Graph Walkable' );
        folderEdit.add( guiSetting, 'Toggle Graph Directions' );
        folderEdit.add( guiSetting, 'Move Point' );
        folderEdit.add( guiSetting, 'Add Start Point' );
        folderEdit.add( guiSetting, 'Add End Point' );
        folderEdit.add( guiSetting, 'Remove Start & End Points' );
        folderEdit.add( guiSetting, 'Toggle Walkable Point' );
        folderEdit.add( guiSetting, 'Clear All' );

        const folderAnalyze = gui.addFolder( 'Analyze' );

        folderAnalyze.open();
        folderAnalyze.add( guiSetting, 'Get GraphSegment' );
        folderAnalyze.add( guiSetting, 'Log Graph' );
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

        simulationRuns = true;

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function showRoute( position ) {

        tempGraphSegments = [];

        //---

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        const point = getPointByPosition( position );

        if ( point !== null ) {

            let routeFound = null;
            let routeColor = null;

            for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

                const route = graph.routes[ i ];

                if ( point.x === route.startPoint.x && point.y === route.startPoint.y || point.x === route.endPoint.x && point.y === route.endPoint.y ) {

                    routeFound = route;
                    routeColor = PATH_COLORS[ i ];

                    break;

                }

            }

            if ( routeFound !== null ) {

                for ( let i = 0, l = routeFound.graphSegments.length; i < l; i ++ ) {

                    const graphSegment = routeFound.graphSegments[ i ];

                    tempGraphSegments.push( { type: 'bezier', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, controlPoint: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y }, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );
                    tempGraphSegments.push( { type: 'circ', position: { x: graphSegment.p0.x, y: graphSegment.p0.y }, diameter: 15, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );
                    tempGraphSegments.push( { type: 'circ', position: { x: graphSegment.p1.x, y: graphSegment.p1.y }, diameter: 15, color: { r: routeColor.r, g: routeColor.g, b: routeColor.b, a: routeColor.a } } );

                }

            }

        }

    }

    //---

    function setAllGraphSegmentPointNeighbours() {

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

            const point = graph.points[ i ];

            setGraphSegmentPointNeighbours( point );

        }

    }

    function setGraphSegmentPointNeighbours( point ) {

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        const neighbourGraphSegments = getNextGraphSegmentsByPoint( point, graph.segments );

        if ( neighbourGraphSegments.length > 0 ) {

            const neighbourPoints = getNextPointsByPointAndGraphSegments( point, neighbourGraphSegments );

            point.neighbourGraphsegments = neighbourGraphSegments;
            point.neighbourPoints = neighbourPoints;

        }

    }

    // function getGraphSegmentByPoints( p0, p1 ) {

    //     const graphIndex = 0;

    //     const graph = graphHolder[ graphIndex ];

    //     //---

    //     let result = null;

    //     for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

    //         const graphSegment = graph.segments[ i ];

    //         let p0Found = false;
    //         let p1Found = false;

    //         if ( graphSegment.p0.x === p0.x && graphSegment.p0.y === p0.y || graphSegment.p1.x === p0.x && graphSegment.p1.y === p0.y ) {

    //             p0Found = true;

    //         }

    //         if ( graphSegment.p0.x === p1.x && graphSegment.p0.y === p1.y || graphSegment.p1.x === p1.x && graphSegment.p1.y === p1.y ) {

    //             p1Found = true;

    //         }

    //         if ( p0Found === true && p1Found === true ) {

    //             result = graphSegment;

    //         }

    //     }

    //     return result;

    // }

    function getGraphSegmentPoint( position, walkable = true, cost = 0, parentPoint = null, visited = false, neighbourGraphsegments = [], neighbourPoints = [] ) {

        const point = {

            x: position.x,
            y: position.y,
            walkable: walkable,
            gCost: 0,
            hCost: 0,
            cost: cost,
            parentPoint: parentPoint,
            parentGraphSegment: null,
            visited: visited,
            neighbourGraphsegments: neighbourGraphsegments,
            neighbourPoints: neighbourPoints,

        };

        return point;

    }

    function getNextGraphSegmentsByPoint( point, graphSegments ) {

        const graphSegmentsFound = [];

        for ( let i = 0, l = graphSegments.length; i < l; i ++ ) {

            const graphSegment = graphSegments[ i ];

            if ( graphSegment.walkable === true ) {

                if ( point.x === graphSegment.p0.x && point.y === graphSegment.p0.y ) {

                    graphSegmentsFound.push( graphSegment );

                } else if ( point.x === graphSegment.p1.x && point.y === graphSegment.p1.y ) {

                    graphSegmentsFound.push( graphSegment );

                }

            }

        }

        return graphSegmentsFound;

    }

    function getNextPointsByPointAndGraphSegments( point, nextGraphSegments ) {

        const pointsFound = [];

        for ( let i = 0, l = nextGraphSegments.length; i < l; i ++ ) {

            const nextGraphSegment = nextGraphSegments[ i ];

            if ( point.x === nextGraphSegment.p0.x && point.y === nextGraphSegment.p0.y ) {

                if ( nextGraphSegment.direction === '><' || nextGraphSegment.direction === '>' ) {

                    pointsFound.push( nextGraphSegment.p1 );

                }

            } else if ( point.x === nextGraphSegment.p1.x && point.y === nextGraphSegment.p1.y ) {

                if ( nextGraphSegment.direction === '><' || nextGraphSegment.direction === '<' ) {

                    pointsFound.push( nextGraphSegment.p0 );

                }

            }

        }

        return pointsFound;

    }

    function getPointByPosition( position ) {

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        let point = null;

        for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

            const p = graph.points[ i ];

            if ( p.x === position.x && p.y === position.y ) {

                point = p;

                break;

            }

        }

        return point;

    }

    //---

    function getStreetSegmentsByPoint( p ) {

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        const result = [];

        for ( let i = 0, l = graph.streetSegments.length; i < l; i ++ ) {

            const streetSegment = graph.streetSegments[ i ];

            if ( p.x === streetSegment.p0.x && p.y === streetSegment.p0.y ) {

                result.push( { streetSegment: streetSegment, side: 0 } );

            }

            if ( streetSegment.p1 !== null ) {

                if ( p.x === streetSegment.p1.x && p.y === streetSegment.p1.y ) {

                    result.push( { streetSegment: streetSegment, side: 1 } );

                }

            }

        }

        return result;

    }

    function addStreetSegment( position ) {

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        const walkable = true;
        const direction = '><';
        //const modus = 'add';//'new'

        const laneChange = true;
        const laneDistance = 18;

        //---

        if ( currentStreetSegment === null ) {

            const connectedStreetSegments = getStreetSegmentsByPoint( position );

            let modus = null;
            let angle0 = 0;
            let lanesCount = 4;
            let lanes = [];

            if ( connectedStreetSegments.length > 0 ) {

                const connectedStreetSegment = connectedStreetSegments[ 0 ];

                modus = 'add';
                angle0 = connectedStreetSegment.streetSegment[ 'angle' + connectedStreetSegment.side.toString() ];

                for ( let i = 0, l = connectedStreetSegment.streetSegment.lanes.length; i < l; i ++ ) {

                    const connectedLane = connectedStreetSegment.streetSegment.lanes[ i ];
                    const connectedLanePoint = connectedLane[ 'p' + connectedStreetSegment.side.toString() ];

                    const lane = getNewStreetSegmentLane( { x: connectedLanePoint.x, y: connectedLanePoint.y }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } );

                    lanes.push( lane );

                }

            } else {

                modus = 'add';//'new';
                angle0 = Math.PI * 0.98;

                // rechts = Math.PI * 0.00;
                // unten  = Math.PI * 0.50;
                // links  = Math.PI * 1.00;
                // oben   = Math.PI * 1.50;

                for ( let i = 0, l = lanesCount; i < l; i ++ ) {

                    const lane = getNewStreetSegmentLane( { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } );

                    lanes.push( lane );

                }

            }

            //console.log( '--->>> ', getStreetSegmentsByPoint( position ) );



            const streetSegment = {

                id: graph.streetSegments.length,

                p0: { x: position.x, y: position.y },
                p1: null,
                centerPoint: { x: 0, y: 0 },
                controlPoint: { x: 0, y: 0 },
                angle0: angle0,
                angle1: 0,
                lanes: lanes,
                centerLanes: [],
                crossLanes: [],
                graphSegments: [],
                borders: [],

                walkable: walkable,
                direction: direction,
                modus: modus,

                modus: modus,

                laneChange: laneChange,
                laneDistance: laneDistance,

                boundingClientRect: { x: 0, y: 0, width: 0, height: 0 },
                image: null,

            };

            currentStreetSegment = streetSegment;

            graph.streetSegments.push( currentStreetSegment );

        } else {

            currentStreetSegment.p1 = { x: position.x, y: position.y };

            console.log( currentStreetSegment );

            //---

            const convertLaneToGraphSegment = ( lane ) => {

                const p0 = getGraphSegmentPoint( lane.p0 );
                const p0Array = graph.points.find( ( point ) => point.x === lane.p0.x && point.y === lane.p0.y );
                const p1 = getGraphSegmentPoint( lane.p1 );
                const p1Array = graph.points.find( ( point ) => point.x === lane.p1.x && point.y === lane.p1.y );

                let graphSegmentPoint0 = p0Array;
                let graphSegmentPoint1 = p1Array;

                if ( typeof graphSegmentPoint0 === 'undefined' ) {

                    graphSegmentPoint0 = p0;
    
                    graph.points.push( graphSegmentPoint0 );
    
                }
    
                if ( typeof graphSegmentPoint1 === 'undefined' ) {
    
                    graphSegmentPoint1 = p1;
    
                    graph.points.push( graphSegmentPoint1 );
    
                }

                const graphSegment = {

                    id: graph.segments.length,
                    p0: { x: graphSegmentPoint0.x, y: graphSegmentPoint0.y },
                    p1: { x: graphSegmentPoint1.x, y: graphSegmentPoint1.y },
                    controlPoint: { x: lane.controlPoint.x, y: lane.controlPoint.y },
                    centerPoint: { x: lane.centerPoint.x, y: lane.centerPoint.y },
                    length: getGraphSegmentLength( lane.p0, lane.p1, lane.controlPoint ),
                    walkable: currentStreetSegment.walkable,
                    direction: currentStreetSegment.direction,

                };

                setGraphSegmentPointNeighbours( getPointByPosition( graphSegment.p0 ) );
                setGraphSegmentPointNeighbours( getPointByPosition( graphSegment.p1 ) );

                return graphSegment;

            };

            for ( let i = 0, l = currentStreetSegment.lanes.length; i < l; i ++ ) {

                const lane = currentStreetSegment.lanes[ i ];
                const graphSegment = convertLaneToGraphSegment( lane );

                currentStreetSegment.graphSegments.push( graphSegment );
                graph.segments.push( graphSegment );

            }

            for ( let i = 0, l = currentStreetSegment.crossLanes.length; i < l; i ++ ) {

                const lane = currentStreetSegment.crossLanes[ i ];
                const graphSegment = convertLaneToGraphSegment( lane );

                currentStreetSegment.graphSegments.push( graphSegment );
                graph.segments.push( graphSegment );

            }

            //---

            drawStreetSegment( currentStreetSegment );

            //---

            currentStreetSegment = null;

            //---

            tempGraphSegments = [];

        }

    }

    let canvasStreetTexture = null;

    function drawStreetSegmentTexture() {

        canvasStreetTexture = document.createElement( 'canvas' );

        canvasStreetTexture.width = 256;
        canvasStreetTexture.height = 256;

        // canvasStreetTexture.style.position = 'absolute';
        // canvasStreetTexture.style.left = '0px';
        // canvasStreetTexture.style.top = '0px';
        // document.body.appendChild( canvasStreetTexture );

        const contextStreetTexture = canvasStreetTexture.getContext( '2d' );

        const imageData = contextStreetTexture.getImageData ( 0, 0, 256, 256 );
        const data = imageData.data;

        for ( let i = 0, l = data.length; i < l; i += 4 ) {

            const color = Math.floor( Math.random() * 20 ) + 60;

            data[ i ]     = color;
            data[ i + 1 ] = color;
            data[ i + 2 ] = color;
            data[ i + 3 ] = 255;

        }

        contextStreetTexture.putImageData( imageData, 0, 0 );

    }

    function drawStreetSegment( streetSegment ) {

        if ( streetSegment.p0 !== null && streetSegment.p1 !== null ) {

            const precision = 100;

            context.setLineDash( [] );

            const streetBorder0 = streetSegment.borders[ 0 ];
            const streetBorder1 = streetSegment.borders[ 1 ];

            //---
            //boundingClientRect

            const minX = Math.min( streetBorder0.p0.x, streetBorder0.p1.x, streetBorder1.p0.x, streetBorder1.p1.x ) - 100;
            const maxX = Math.max( streetBorder0.p0.x, streetBorder0.p1.x, streetBorder1.p0.x, streetBorder1.p1.x ) + 100;
            const minY = Math.min( streetBorder0.p0.y, streetBorder0.p1.y, streetBorder1.p0.y, streetBorder1.p1.y ) - 100;
            const maxY = Math.max( streetBorder0.p0.y, streetBorder0.p1.y, streetBorder1.p0.y, streetBorder1.p1.y ) + 100;

            streetSegment.boundingClientRect.x = minX;
            streetSegment.boundingClientRect.y = minY;
            streetSegment.boundingClientRect.width = maxX - minX;
            streetSegment.boundingClientRect.height = maxY - minY;

            //---

            const _canvas = document.createElement( 'canvas' );
            const _context = _canvas.getContext( '2d' );

            _canvas.width = streetSegment.boundingClientRect.width;
            _canvas.height = streetSegment.boundingClientRect.height;

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
                    
                    _context.beginGraph();
                    _context.moveTo( pTL.x - minX, pTL.y - minY );
                    _context.lineTo( pTR.x - minX, pTR.y - minY );
                    _context.lineTo( pBR.x - minX, pBR.y - minY );
                    _context.lineTo( pBL.x - minX, pBL.y - minY );
                    // _context.lineWidth = 2;
                    _context.closeGraph();

                    // _context.strokeStyle = 'rgba( 63, 59, 58, 1.00 )';
                    // _context.stroke(); 
                    _context.fillStyle = 'rgba( 63, 59, 58, 1.00 )';
                    _context.fill( 'evenodd' );
                    
                    _context.clip();
                    //_context.drawImage( imageTexture, 0, 0, 256, 256 );
                    _context.fillStyle = _context.createPattern( canvasStreetTexture, 'repeat' );
                    _context.fillRect( 0, 0, streetSegment.boundingClientRect.width, streetSegment.boundingClientRect.height );

                    _context.restore();
                    // _context.globalCompositeOperation = 'source-over';

                }

            }

            _context.beginGraph();
            _context.moveTo( streetBorder0.p0.x - minX, streetBorder0.p0.y - minY );
            _context.quadraticCurveTo( streetBorder0.controlPoint.x - minX, streetBorder0.controlPoint.y - minY, streetBorder0.p1.x - minX, streetBorder0.p1.y - minY );
            _context.lineWidth = 2;
            _context.strokeStyle = 'rgba( 135, 135, 135, 1.00 )';
            _context.stroke();

            _context.beginGraph();
            _context.moveTo( streetBorder1.p0.x - minX, streetBorder1.p0.y - minY );
            _context.quadraticCurveTo( streetBorder1.controlPoint.x - minX, streetBorder1.controlPoint.y - minY, streetBorder1.p1.x - minX, streetBorder1.p1.y - minY );
            _context.lineWidth = 2;
            _context.strokeStyle = 'rgba( 135, 135, 135, 1.00 )';
            _context.stroke();

            if ( streetSegment.lanes.length > 1 ) {

                _context.beginGraph();
                _context.moveTo( streetSegment.p0.x - minX, streetSegment.p0.y - minY );
                _context.quadraticCurveTo( streetSegment.controlPoint.x - minX, streetSegment.controlPoint.y - minY, streetSegment.p1.x - minX, streetSegment.p1.y - minY );
                _context.lineWidth = 6;
                _context.strokeStyle = 'rgba( 135, 135, 135, 1.00 )';
                _context.stroke();

                _context.beginGraph();
                _context.moveTo( streetSegment.p0.x - minX, streetSegment.p0.y - minY );
                _context.quadraticCurveTo( streetSegment.controlPoint.x - minX, streetSegment.controlPoint.y - minY, streetSegment.p1.x - minX, streetSegment.p1.y - minY );
                _context.lineWidth = 2;
                _context.strokeStyle = 'rgba( 63, 59, 58, 1.00 )';
                _context.stroke();

            }

            
            streetSegment.centerLanes.forEach( ( centerLane ) => {

                _context.setLineDash( [ 8, 18 ] );
                _context.beginGraph();
                _context.moveTo( centerLane.p0.x - minX, centerLane.p0.y - minY );
                _context.quadraticCurveTo( centerLane.controlPoint.x - minX, centerLane.controlPoint.y - minY, centerLane.p1.x - minX, centerLane.p1.y - minY );
                _context.lineWidth = 3;
                _context.strokeStyle = 'rgba( 135, 135, 135, 0.75 )';
                _context.stroke();
                
            } );

            //---

            streetSegment.image = new Image( streetSegment.boundingClientRect.width, streetSegment.boundingClientRect.height );
            streetSegment.image.src = _canvas.toDataURL();

        }

    }

    function drawStreetSegments() {

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        for ( let i = 0, l = graph.streetSegments.length; i < l; i ++ ) {

            const streetSegment = graph.streetSegments[ i ];

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

    function addGraphSegment( position ) {

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        if ( currentGraphSegment === null ) {

            const graphSegmentPointNew = getGraphSegmentPoint( position );
            const graphSegmentPointArray = graph.points.find( ( point ) => point.x === position.x && point.y === position.y );

            let graphSegmentPoint = graphSegmentPointArray;

            if ( typeof graphSegmentPoint === 'undefined' ) {

                graphSegmentPoint = graphSegmentPointNew;

                graph.points.push( graphSegmentPoint );

            }

            currentGraphSegment = {};
            currentGraphSegment.id = graph.segments.length;
            currentGraphSegment.p0 = { x: unifyNumber( graphSegmentPoint.x ), y: unifyNumber( graphSegmentPoint.y ) };
            currentGraphSegment.p1 = null;
            // currentGraphSegment.p1 = { x: position.x, y: position.y };
            // currentGraphSegment.centerPoint = getGraphSegmentCenter( currentGraphSegment );
            // currentGraphSegment.controlPoint = getGraphSegmentCenter( currentGraphSegment );
            // currentGraphSegment.length = getGraphSegmentLength( currentGraphSegment.p0, currentGraphSegment.p1, currentGraphSegment.controlPoint ); //getDistance( currentGraphSegment.p0, currentGraphSegment.p1 );
            // currentGraphSegment.walkable = true;
            // currentGraphSegment.direction = '><';

            graph.segments.push( currentGraphSegment );

            setGraphSegmentPointNeighbours( getPointByPosition( currentGraphSegment.p0 ) );

            if ( debugMode === true ) {

                addDebugElement( position.x, position.y, position.x.toFixed( 0 ).toString() + ', ' + position.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );

            }

        } else {

            const graphSegmentPointNew = getGraphSegmentPoint( position );
            const graphSegmentPointArray = graph.points.find( ( point ) => point.x === position.x && point.y === position.y );

            let graphSegmentPoint = graphSegmentPointArray;

            if ( typeof graphSegmentPoint === 'undefined' ) {

                graphSegmentPoint = graphSegmentPointNew;

                graph.points.push( graphSegmentPoint );

            }

            currentGraphSegment.p1 = { x: unifyNumber( graphSegmentPoint.x ), y: unifyNumber( graphSegmentPoint.y ) };

            //GraphSegment points are not allowed to have the same position. work in progress. check if a point is not used by other GraphSegments!
            if ( currentGraphSegment.p0.x === currentGraphSegment.p1.x && currentGraphSegment.p0.y === currentGraphSegment.p1.y ) {

                graph.points.splice( graph.points.findIndex( ( point ) => point.x === currentGraphSegment.p0.x && point.y === currentGraphSegment.p0.y ), 1 );
                graph.segments.pop();

                currentGraphSegment = null;

                if ( debugMode === true ) {

                    rebuildDebugElements();

                }

                return;

            }

            currentGraphSegment.centerPoint = getGraphSegmentCenter( currentGraphSegment );
            currentGraphSegment.controlPoint = getGraphSegmentCenter( currentGraphSegment );
            currentGraphSegment.length = getGraphSegmentLength( currentGraphSegment.p0, currentGraphSegment.p1, currentGraphSegment.controlPoint ); //getDistance( currentGraphSegment.p0, currentGraphSegment.p1 );
            currentGraphSegment.walkable = true;
            currentGraphSegment.direction = '><';

            setGraphSegmentPointNeighbours( getPointByPosition( currentGraphSegment.p0 ) );
            setGraphSegmentPointNeighbours( getPointByPosition( currentGraphSegment.p1 ) );

            // if ( allowGraphSegmentSplitting === true ) {

            //     const intersections = getGraphSegmentsIntersections( currentGraphSegment, 100 );

            //     for ( let i = 0, l = intersections.length; i < l; i ++ ) {

            //         const intersection = intersections[ i ];

            //         console.log( intersection );

            //         const t0 = getTOfQuadraticBezierFromIntersectionPoint( intersection.graphSegment0, intersection.point );
            //         const t1 = getTOfQuadraticBezierFromIntersectionPoint( intersection.graphSegment1, intersection.point );

            //         splitGraphSegment( intersection.graphSegment0, t0 );
            //         splitGraphSegment( intersection.graphSegment1, t1 );

            //     }

            // }

            if ( debugMode === true ) {

                addDebugElement( position.x, position.y, position.x.toFixed( 0 ).toString() + ', ' + position.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );
                addDebugElement( currentGraphSegment.centerPoint.x, currentGraphSegment.centerPoint.y, currentGraphSegment.id.toString(), 'white', -4, -6, null );

                addDebugElement( currentGraphSegment.centerPoint.x, currentGraphSegment.centerPoint.y, currentGraphSegment.length.toFixed( 2 ).toString(), 'grey', 10, -5, null );

            }

            currentGraphSegment = null;

        }

    }

    function removeGraphSegmentByPosition( position ) {

        const graphSegment = getGraphSegmentByPosition( position );

        if ( graphSegment !== null ) {

            removeGraphSegment( graphSegment );

        }

    }

    function removeGraphSegment( graphSegment ) {

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        let p0Found = getPointByPosition( graphSegment.p0 );
        let p1Found = getPointByPosition( graphSegment.p1 );

        for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

            const pS = graph.segments[ i ];

            if ( pS.id !== graphSegment.id ) {

                if ( graphSegment.p0.x === pS.p0.x && graphSegment.p0.y === pS.p0.y || graphSegment.p0.x === pS.p1.x && graphSegment.p0.y === pS.p1.y ) {

                    p0Found = null;

                }

                if ( graphSegment.p1.x === pS.p0.x && graphSegment.p1.y === pS.p0.y || graphSegment.p1.x === pS.p1.x && graphSegment.p1.y === pS.p1.y ) {

                    p1Found = null;

                }

            }

        }

        graph.segments.splice( graph.segments.findIndex( ( pS ) => pS.id === graphSegment.id ), 1 );

        if ( p0Found !== null ) {

            graph.points.splice( graph.points.findIndex( ( point ) => point.x === p0Found.x && point.y === p0Found.y ), 1 );

        }

        if ( p1Found !== null ) {

            graph.points.splice( graph.points.findIndex( ( point ) => point.x === p1Found.x && point.y === p1Found.y ), 1 );

        }

        //---

        for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

            graph.segments[ i ].id = i;

        }

        for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

            setGraphSegmentPointNeighbours( graph.points[ i ] );

        }

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

        tempGraphSegments = [];

    }

    function bendGraphSegment( position ) {

        const graphSegment = currentGraphSegment;

        if ( graphSegment !== null ) {

            graphSegment.controlPoint.x = position.x;
            graphSegment.controlPoint.y = position.y;

            graphSegment.centerPoint = interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, 0.50 );

            graphSegment.length = getGraphSegmentLength( graphSegment.p0, graphSegment.p1, graphSegment.controlPoint );

        }

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

        tempGraphSegments = [];

        tempGraphSegments.push( { type: 'line', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, p1: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, color: { r: 230, g: 29, b: 95, a: 255 } } );
        tempGraphSegments.push( { type: 'line', p0: { x: graphSegment.p1.x, y: graphSegment.p1.y }, p1: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, color: { r: 230, g: 29, b: 95, a: 255 } } );
        tempGraphSegments.push( { type: 'circfill', position: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, diameter: 3, color: { r: 230, g: 29, b: 95, a: 255 } } );
        tempGraphSegments.push( { type: 'bezier', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, controlPoint: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y }, color: { r: 255, g: 255, b: 255, a: 255 } } );

    }

    function straightenGraphSegmentByPosition( position ) {

        const graphSegment = getGraphSegmentByPosition( position );

        if ( graphSegment !== null ) {

            straightenGraphSegment( graphSegment );

        }

    }

    function straightenGraphSegment( graphSegment ) {

        const centerPoint = getGraphSegmentCenter( graphSegment );

        graphSegment.centerPoint = centerPoint;
        graphSegment.controlPoint = centerPoint;

        graphSegment.length = getGraphSegmentLength( graphSegment.p0, graphSegment.p1, graphSegment.controlPoint );

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

        tempGraphSegments = [];

    }

    function splitGraphSegmentByPosition( position, t = 0.50 ) {

        const graphSegment = getGraphSegmentByPosition( position );

        if ( graphSegment !== null ) {

            splitGraphSegment( graphSegment, t );

        }

    }

    function splitGraphSegment( graphSegment, t = 0.50 ) {

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        const newGraphSegment0 = trimGraphSegment( graphSegment, t, false );
        const newGraphSegment1 = trimGraphSegment( graphSegment, t, true );

        const newGraphSegments = [ newGraphSegment0, newGraphSegment1 ];

        //---

        removeGraphSegment( graphSegment );

        //---

        for ( let i = 0, l = newGraphSegments.length; i < l; i ++ ) {

            const newGraphSegment = newGraphSegments[ i ];

            newGraphSegment.id = graph.segments.length;

            const graphSegment0Point0New = getGraphSegmentPoint( newGraphSegment.p0 );
            const graphSegment0Point0Array = graph.points.find( ( point ) => point.x === newGraphSegment.p0.x && point.y === newGraphSegment.p0.y );
            const graphSegment0Point1New = getGraphSegmentPoint( newGraphSegment.p1 );
            const graphSegment0Point1Array = graph.points.find( ( point ) => point.x === newGraphSegment.p1.x && point.y === newGraphSegment.p1.y );

            let graphSegmentPoint0 = graphSegment0Point0Array;
            let graphSegmentPoint1 = graphSegment0Point1Array;

            if ( typeof graphSegmentPoint0 === 'undefined' ) {

                graphSegmentPoint0 = graphSegment0Point0New;

                graph.points.push( graphSegmentPoint0 );

            }

            if ( typeof graphSegmentPoint1 === 'undefined' ) {

                graphSegmentPoint1 = graphSegment0Point1New;

                graph.points.push( graphSegmentPoint1 );

            }

            newGraphSegment.centerPoint = interpolateQuadraticBezier( newGraphSegment.p0, newGraphSegment.controlPoint, newGraphSegment.p1, 0.50 );
            newGraphSegment.length = getGraphSegmentLength( newGraphSegment.p0, newGraphSegment.p1, newGraphSegment.controlPoint ); //getDistance( newGraphSegment0.p0, newGraphSegment0.p1 );
            newGraphSegment.walkable = true;
            newGraphSegment.direction = '><';

            graph.segments.push( newGraphSegment );

            setGraphSegmentPointNeighbours( getPointByPosition( graphSegmentPoint0 ) );
            setGraphSegmentPointNeighbours( getPointByPosition( graphSegmentPoint1 ) );

        }

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

        tempGraphSegments = [];

    }

    function trimGraphSegment ( graphSegment, t = 0.50, fromStart = false ) {

		let startPoint;
        let endPoint;

		if ( fromStart ) {

			endPoint = graphSegment.p0;
			startPoint = graphSegment.p1;
            t = 1 - t;

		} else {

			startPoint = graphSegment.p0;
            endPoint = graphSegment.p1;

        }

		const dscx = graphSegment.controlPoint.x - startPoint.x;
		const dscy = graphSegment.controlPoint.y - startPoint.y;
		const dcex = endPoint.x - graphSegment.controlPoint.x;
        const dcey = endPoint.y - graphSegment.controlPoint.y;

        const newGraphSegment = {

            p0: startPoint,
            controlPoint: { x: startPoint.x + dscx * t, y: startPoint.y + dscy * t },
            p1: startPoint

        };

		let dx = graphSegment.controlPoint.x + dcex * t - newGraphSegment.controlPoint.x;
        let dy = graphSegment.controlPoint.y + dcey * t - newGraphSegment.controlPoint.y;

		if ( fromStart ) {

            newGraphSegment.p0 = {

                x: unifyNumber( newGraphSegment.controlPoint.x + dx * t ),
                y: unifyNumber( newGraphSegment.controlPoint.y + dy * t )

            };

		} else {

            newGraphSegment.p1 = {

                x: unifyNumber( newGraphSegment.controlPoint.x + dx * t ),
                y: unifyNumber( newGraphSegment.controlPoint.y + dy * t )

            };

        }

        console.log( '-----------------------------------------------------------------' );
        console.log( newGraphSegment );
        console.log( '-----------------------------------------------------------------' );

        return newGraphSegment;

	}

    //---

    function addStartPointToGraph( position ) {

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        const route = { startPoint: null, endPoint: null, graphSegments: [] };

        const startPoint = getPointByPosition( position );

        if ( startPoint !== null ) {

            route.startPoint = {

                x: startPoint.x,
                y: startPoint.y

            };

            graph.routes.push( route );

        }

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

    }

    function addEndPointToGraph( position ) {

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        let routeIndex = 0;

        for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

            const route = graph.routes[ i ];

            if ( route.endPoint === null ) {

                routeIndex = i;

                break;

            }

        }

        const route = graph.routes[ routeIndex ];

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

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        let routeIndex = 0;

        for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

            const route = graph.routes[ i ];

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

        graph.routes.splice( routeIndex, 1 );

        //---

        removeVehiclesByRouteIndex( routeIndex );

        //---

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

    }

    function setCurrentNode( position ) {

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        const point = getPointByPosition( position );

        if ( point !== null ) {

            currentNode = point;

        }

        if ( debugMode === true ) {

            rebuildDebugElements();

        }

    }

    function addSelectedGraphSegments( position ) {

        selectedGraphSegments = [];

        //---

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

            const graphSegment = graph.segments[ i ];

            if ( graphSegment.p0.x === position.x && graphSegment.p0.y === position.y ) {

                selectedGraphSegments.push( graphSegment );

            } else if ( graphSegment.p1.x === position.x && graphSegment.p1.y === position.y ) {

                selectedGraphSegments.push( graphSegment );

            }

        }

    }

    function removeSelectedGraphSegments( position ) {

        selectedGraphSegments = [];

    }

    // function removeDuplicatePointsFromArray() {

    //     const graphIndex = 0;

    //     const graph = graphHolder[ graphIndex ];

    //     const point = currentNode;

    //     const duplicatePoints = graph.points.filter( ( p ) => p.x === point.x && p.y === point.y );

    //     if ( duplicatePoints.length > 1 ) {

    //         graph.points.splice( graph.points.findIndex( ( p ) => p.x === point.x && p.y === point.y ), 1 );

    //     }

    // }

    // function removeDuplicateGraphSegmentsFromArray() {

    //     const graphIndex = 0;

    //     const graph = graphHolder[ graphIndex ];

    //     //under construction

    // }

    function movePoint( position ) {

        tempGraphSegments = [];

        //---

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        const point = currentNode;

        if ( point !== null ) {

            const pointOldX = point.x;
            const pointOldY = point.y;

            point.x = position.x;
            point.y = position.y;

            for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

                const route = graph.routes[ i ];

                if ( route.startPoint.x === pointOldX && route.startPoint.y === pointOldY ) {

                    route.startPoint.x = point.x;
                    route.startPoint.y = point.y;

                }

                if ( route.endPoint.x === pointOldX && route.endPoint.y === pointOldY ) {

                    route.endPoint.x = point.x;
                    route.endPoint.y = point.y;

                }

            }

            for ( let i = 0, l = selectedGraphSegments.length; i < l; i ++ ) {

                const graphSegment = selectedGraphSegments[ i ];

                let diffX = 0;
                let diffY = 0;

                if ( graphSegment.p0.x === pointOldX && graphSegment.p0.y === pointOldY ) {

                    diffX = point.x - graphSegment.p0.x;
                    diffY = point.y - graphSegment.p0.y;

                    graphSegment.p0.x = point.x;
                    graphSegment.p0.y = point.y;

                } else if ( graphSegment.p1.x === pointOldX && graphSegment.p1.y === pointOldY ) {

                    diffX = point.x - graphSegment.p1.x;
                    diffY = point.y - graphSegment.p1.y;

                    graphSegment.p1.x = point.x;
                    graphSegment.p1.y = point.y;

                }

                graphSegment.length = getGraphSegmentLength( graphSegment.p0, graphSegment.p1, graphSegment.controlPoint );// getDistance( graphSegment.p0, graphSegment.p1 );
                //graphSegment.centerPoint = getGraphSegmentCenter( graphSegment );
                graphSegment.centerPoint = interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, 0.50 );

                graphSegment.controlPoint.x += diffX / 2;
                graphSegment.controlPoint.y += diffY / 2;

                //tempGraphSegments.push( { type: 'circfill', position: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, diameter: 3, color: { r: 230, g: 29, b: 95, a: 255 } } );

                //getGraphSegmentsIntersections( graphSegment, 25 );

            }

            //---

            if ( debugMode === true ) {

                rebuildDebugElements();

            }

            //tempGraphSegments = [];

        }

    }

    function togglePointWalkable( position ) {

        tempGraphSegments = [];

        //---

        //const graphIndex = 0;

        //const graph = graphHolder[ graphIndex ];

        const point = getPointByPosition( position );

        if ( point !== null ) {

            point.walkable = !point.walkable;

        }

    }

    function toggleGraphWalkable( position ) {

        tempGraphSegments = [];

        //---

        const graphSegment = getGraphSegmentByPosition( position );

        if ( graphSegment !== null ) {

            graphSegment.walkable = !graphSegment.walkable;

            setAllGraphSegmentPointNeighbours();//muss optimiert werden. Es sollte möglich sein nur die betroffenen Punkte upzudaten und nicht alle.

        }

    }

    function toggleGraphDirections( position ) {

        tempGraphSegments = [];

        //---

        //const graphIndex = 0;

        //const graph = graphHolder[ graphIndex ];

        const graphSegment = getGraphSegmentByPosition( position );

        if ( graphSegment !== null ) {

            let graphDirectionIndex = GRAPH_SEGMENT_DIRECTIONS.findIndex( ( direction ) => direction === graphSegment.direction );

            graphDirectionIndex += 1;

            if ( graphDirectionIndex > GRAPH_SEGMENT_DIRECTIONS.length - 1 ) {

                graphDirectionIndex = 0;

            }

            graphSegment.direction = GRAPH_SEGMENT_DIRECTIONS[ graphDirectionIndex ];

        }

    }

    function getGraphSegmentByPosition( position ) {

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        let distanceTotal = Infinity;
        let indexSave = -1;

        for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

            const graphSegment = graph.segments[ i ];

            //const distanceToGraphSegment = signedDistanceToLine( position, graphSegment.p0.x, graphSegment.p0.y, graphSegment.p1.x, graphSegment.p1.y );
            const distanceToGraphSegment = signedDistanceToQuadraticBezier( position, graphSegment.p0, graphSegment.p1, graphSegment.controlPoint );

            if ( distanceToGraphSegment < distanceTotal ) {

                distanceTotal = distanceToGraphSegment;

                indexSave = i;

            }

        }

        if ( indexSave > -1 && distanceTotal <= SNAP_TO_DISTANCE ) {

            return graph.segments[ indexSave ];

        }

        return null;

    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function rebuildDebugElements() {

        removeDebugElements();

        //---

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

            const route = graph.routes[ i ];
            const routeColor = PATH_COLORS[ i ];

            if ( route.startPoint !== null ) {

                addDebugElement( route.startPoint.x, route.startPoint.y, 'START ' + ( i + 1 ).toString(), 'white', -15, -25, null );

            }

            if ( route.endPoint !== null ) {

                addDebugElement( route.endPoint.x, route.endPoint.y, 'END ' + ( i + 1 ).toString(), 'white', -15, -25, null );

            }

        }

        //---

        graph.segments.forEach( ( graphSegment, index ) => {

            if ( index < graph.segments.length - 1 ) {

                addDebugElement( graphSegment.p0.x, graphSegment.p0.y, graphSegment.p0.x.toFixed( 0 ).toString() + ', ' + graphSegment.p0.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );
                addDebugElement( graphSegment.p1.x, graphSegment.p1.y, graphSegment.p1.x.toFixed( 0 ).toString() + ', ' + graphSegment.p1.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );

            } else {

                addDebugElement( graphSegment.p0.x, graphSegment.p0.y, graphSegment.p0.x.toFixed( 0 ).toString() + ', ' + graphSegment.p0.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );
                addDebugElement( graphSegment.p1.x, graphSegment.p1.y, graphSegment.p1.x.toFixed( 0 ).toString() + ', ' + graphSegment.p1.y.toFixed( 0 ).toString(), '#cdcbc8', 0, 9, null );

            }

            addDebugElement( graphSegment.centerPoint.x, graphSegment.centerPoint.y, graphSegment.id.toString(), 'white', -4, -6, null );
            addDebugElement( graphSegment.centerPoint.x, graphSegment.centerPoint.y, graphSegment.length.toFixed( 2 ).toString(), 'grey', 10, -5, null );

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

    function getGraphSegmentLength( p0, p1, controlPoint ) {

        //return getDistance( p0, p1 );

        //---

        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;

        const cx = ( dx === 0 ) ? 0 : ( controlPoint.x - p0.x ) / dx;
        const cy = ( dy === 0 ) ? 0 : ( controlPoint.y - p0.y ) / dy;

		let d = 0;
		let p = p0;
		let np = null;

		for ( let i = 1; i < GRAPH_SEGMENT_CURVE_ACCURACY; i++ ) {

			const t = i / GRAPH_SEGMENT_CURVE_ACCURACY;
			const f1 = 2 * t * ( 1 - t );
            const f2 = t * t;

			np = { x: p0.x + dx * ( f1 * cx + f2 ), y: p0.y + dy * ( f1 * cy + f2 ) };
			d += getDistance( p, np );
            p = np;

        }

		return d + getDistance( p, p1 );

    }

    function getGraphSegmentCenter( graphSegment ) {

        const x = ( graphSegment.p0.x + graphSegment.p1.x ) / 2;
        const y = ( graphSegment.p0.y + graphSegment.p1.y ) / 2;

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

    // function showGraphSegmentIntersectionPointsWithLine( line, precision = 25 ) {

    //     tempGraphSegments = [];

    //     //---

    //     const graphIndex = 0;

    //     const graph = graphHolder[ graphIndex ];

    //     //---

    //     for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

    //         const compareGraphSegment = graph.segments[ i ];

    //         if ( line.id !== compareGraphSegment.id ) {

    //             for ( let iC = 0, iCStep = 1 / precision; iC < 1 + iCStep; iC += iCStep ) {

    //                 if ( iC > 0 ) {

    //                     const tempCompareGraphSegment = {};

    //                     tempCompareGraphSegment.p0 = interpolateQuadraticBezier( compareGraphSegment.p0, compareGraphSegment.controlPoint, compareGraphSegment.p1, iC - iCStep );
    //                     tempCompareGraphSegment.p1 = interpolateQuadraticBezier( compareGraphSegment.p0, compareGraphSegment.controlPoint, compareGraphSegment.p1, iC );

    //                     const intersectionPoint = getLinesIntersectionPoint( line.p0.x, line.p0.y, line.p1.x, line.p1.y, tempCompareGraphSegment.p0.x, tempCompareGraphSegment.p0.y, tempCompareGraphSegment.p1.x, tempCompareGraphSegment.p1.y );

    //                     if ( intersectionPoint !== null ) {

    //                         if ( Math.round( intersectionPoint.x ) !== line.p0.x && Math.round( intersectionPoint.y ) !== line.p0.y && Math.round( intersectionPoint.x ) !== line.p1.x && Math.round( intersectionPoint.y ) !== line.p1.y ) {

    //                             tempGraphSegments.push( { type: 'circfill', position: { x: intersectionPoint.x, y: intersectionPoint.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );

    //                         }

    //                     }

    //                 }

    //             }

    //         }

    //     }

    // }

    // function getGraphSegmentsIntersections( inputGraphSegment, precision = 25 ) {

    //     //tempGraphSegments = [];

    //     //---

    //     const graphIndex = 0;

    //     const graph = graphHolder[ graphIndex ];

    //     //---

    //     // const intersectionPoints = [];
    //     const intersections = [];

    //     for ( let iI = 0, iIStep = 1 / precision; iI < 1 + iIStep; iI += iIStep ) {

    //         if ( iI > 0 ) {

    //             const tempInputGraphSegment = {};

    //             tempInputGraphSegment.id = inputGraphSegment.id;
    //             tempInputGraphSegment.p0 = interpolateQuadraticBezier( inputGraphSegment.p0, inputGraphSegment.controlPoint, inputGraphSegment.p1, iI - iIStep );
    //             tempInputGraphSegment.p1 = interpolateQuadraticBezier( inputGraphSegment.p0, inputGraphSegment.controlPoint, inputGraphSegment.p1, iI );

    //             //tempGraphSegments.push( { type: 'line', p0: { x: tempInputGraphSegment.p0.x | 0, y: tempInputGraphSegment.p0.y | 0 }, p1: { x: tempInputGraphSegment.p1.x | 0, y: tempInputGraphSegment.p1.y | 0 }, color: { r: 255, g: 0, b: 0, a: 255 } } );
    //             //tempGraphSegments.push( { type: 'circfill', position: { x: tempInputGraphSegment.p0.x | 0, y: tempInputGraphSegment.p0.y | 0 }, diameter: 9, color: { r: 255, g: 0, b: 0, a: 255 } } );

    //             for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

    //                 const compareGraphSegment = graph.segments[ i ];
    //                 // const compareIndex = selectedGraphSegments.findIndex( ( graphSegment ) => graphSegment.id === compareGraphSegment.id );

    //                 // if ( compareIndex > -1 ) {

    //                 //     continue;

    //                 // }

    //                 for ( let iC = 0, iCStep = 1 / precision; iC < 1 + iCStep; iC += iCStep ) {

    //                     if ( iC > 0 ) {

    //                         const tempCompareGraphSegment = {};

    //                         tempCompareGraphSegment.id = compareGraphSegment.id;
    //                         tempCompareGraphSegment.p0 = interpolateQuadraticBezier( compareGraphSegment.p0, compareGraphSegment.controlPoint, compareGraphSegment.p1, iC - iCStep );
    //                         tempCompareGraphSegment.p1 = interpolateQuadraticBezier( compareGraphSegment.p0, compareGraphSegment.controlPoint, compareGraphSegment.p1, iC );

    //                         if ( tempInputGraphSegment.id !== tempCompareGraphSegment.id ) {

    //                             //tempGraphSegments.push( { type: 'line', p0: { x: tempCompareGraphSegment.p0.x | 0, y: tempCompareGraphSegment.p0.y | 0 }, p1: { x: tempCompareGraphSegment.p1.x | 0, y: tempCompareGraphSegment.p1.y | 0 }, color: { r: 255, g: 0, b: 0, a: 255 } } );

    //                             const intersectionPoint = getLinesIntersectionPoint( tempInputGraphSegment.p0.x, tempInputGraphSegment.p0.y, tempInputGraphSegment.p1.x, tempInputGraphSegment.p1.y, tempCompareGraphSegment.p0.x, tempCompareGraphSegment.p0.y, tempCompareGraphSegment.p1.x, tempCompareGraphSegment.p1.y );

    //                             if ( intersectionPoint !== null ) {

    //                                 if ( Math.round( intersectionPoint.x ) !== tempInputGraphSegment.p0.x && Math.round( intersectionPoint.y ) !== tempInputGraphSegment.p0.y && Math.round( intersectionPoint.x ) !== tempInputGraphSegment.p1.x && Math.round( intersectionPoint.y ) !== tempInputGraphSegment.p1.y ) {

    //                                     //console.log( intersectionPoint, tempInputGraphSegment.p0, tempInputGraphSegment.p1 );

    //                                     //tempGraphSegments.push( { type: 'circfill', position: { x: intersectionPoint.x, y: intersectionPoint.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );

    //                                     intersections.push( { point: intersectionPoint, graphSegment0: inputGraphSegment, graphSegment1: compareGraphSegment } );

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

    function getTOfQuadraticBezierFromIntersectionPoint( graphSegment, position, precision = 100 ) {

        let distance = Infinity;
        let t = -1;

        for ( let i = 0, l = 1 / precision; i < 1 + l; i += l ) {

            const pOnBezier = interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, i );

            const d = getDistance( position, pOnBezier );

            if ( distance > d ) {

                distance = d;
                t = i;

            }

        }

        return t;

    }

    function getNearestPointOnGraphSegmentByPosition( graphSegment, position, precision = 100 ) {

        let distance = Infinity;
        let nearestPoint = null;

        for ( let i = 0, l = 1 / precision; i < 1 + l; i += l ) {

            const pOnBezier = interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, i );

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

    function unifyNumber( numb, digits = 5 ) {

        return parseFloat( numb.toFixed( digits ) );

    }

    function getUID() {

        //https://stackoverflow.com/questions/8012002/create-a-unique-number-with-javascript-time
        //https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
        return window.crypto.getRandomValues( new Uint8Array( 10 ) ).join( '' );
      
    }

    function getUNumber() {

        return parseFloat( window.crypto.getRandomValues( new Uint8Array( 10 ) ).join( '' ) );
    
    }

    //--- ------------------------------------------------------------------------------------------------------------------------------

    function mouseDownHandler( event ) {

        mouseDown = true;

        //---

        if ( editorMode === EDITOR_MODE_ENUM.addStreetSegment ) {

            addStreetSegment( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.addGraphSegment ) {

            addGraphSegment( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.addStartPoint ) {

            addStartPointToGraph( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.addEndPoint ) {

            addEndPointToGraph( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.getGraphSegment ) {

            //---

        } else if ( editorMode === EDITOR_MODE_ENUM.togglePointWalkable ) {

            togglePointWalkable( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.removeGraphSegment ) {

            removeGraphSegmentByPosition( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.movePoint ) {

            setCurrentNode( mouseCursor.position );
            addSelectedGraphSegments( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.toggleGraphWalkable ) {

            toggleGraphWalkable( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.toggleGraphDirections ) {

            toggleGraphDirections( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.showRoute ) {

            //---

        } else if ( editorMode === EDITOR_MODE_ENUM.removeStartEndPoints ) {

            removeStartEndPoints( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.bendGraphSegment ) {

            currentGraphSegment = getGraphSegmentByPosition( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.straightenGraphSegment ) {

            straightenGraphSegmentByPosition( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.splitGraphSegment ) {

            splitGraphSegmentByPosition( mouseCursor.position );

        } else if ( editorMode === EDITOR_MODE_ENUM.splitGraphSegmentAt ) {

            const graphSegment = getGraphSegmentByPosition( mousePos );

            if ( graphSegment !== null ) {

                const pointOnGraphSegment = getNearestPointOnGraphSegmentByPosition( graphSegment, mousePos, 100 );
                const tOnGraphSegment = getTOfQuadraticBezierFromIntersectionPoint( graphSegment, pointOnGraphSegment, 100 );

                splitGraphSegment( graphSegment, tOnGraphSegment );

            }

        }

    }

    function mouseUpHandler( event ) {

        mouseDown = false;

        //---

        if ( editorMode === EDITOR_MODE_ENUM.bendGraphSegment ) {

            currentGraphSegment = null;

            tempGraphSegments = [];

        } else if ( editorMode === EDITOR_MODE_ENUM.movePoint ) {

            removeSelectedGraphSegments();
            // removeDuplicatePointsFromArray();
            // removeDuplicateGraphSegmentsFromArray();

        }

        //---

        if ( currentGraphSegment === null ) {

            const graphIndex = 0;

            const graph = graphHolder[ graphIndex ];

            //---

            pathfinder.computeRoutes( graph, ( routes, time ) => {

                graph.routes = routes;

                console.log( 'Der Aufruf von computeRoutes dauerte ' + time + ' Millisekunden.' );
        
            } );

            //---

            startVehicleSimulation();

        }

    }

    function mouseMoveHandler( event ) {

        mousePos = getMousePos( canvas, event );

        //---

        if ( editorMode === EDITOR_MODE_ENUM.getGraphSegment ||
             editorMode === EDITOR_MODE_ENUM.removeGraphSegment ||
             editorMode === EDITOR_MODE_ENUM.toggleGraphWalkable ||
             editorMode === EDITOR_MODE_ENUM.toggleGraphDirections ||
             ( editorMode === EDITOR_MODE_ENUM.bendGraphSegment && mouseDown === false ) ||
             editorMode === EDITOR_MODE_ENUM.straightenGraphSegment ||
             editorMode === EDITOR_MODE_ENUM.splitGraphSegment ) {

            tempGraphSegments = [];

            //---

            const graphSegment = getGraphSegmentByPosition( mousePos );

            if ( graphSegment !== null ) {

                //tempGraphSegments.push( { type: 'line', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y  }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                tempGraphSegments.push( { type: 'bezier', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, controlPoint: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                tempGraphSegments.push( { type: 'circ', position: { x: graphSegment.p0.x, y: graphSegment.p0.y }, diameter: 12, color: { r: 255, g: 0, b: 255, a: 255 }  } );
                tempGraphSegments.push( { type: 'circ', position: { x: graphSegment.p1.x, y: graphSegment.p1.y }, diameter: 12, color: { r: 0, g: 255, b: 255, a: 255 }  } );

            }

        } else if ( editorMode === EDITOR_MODE_ENUM.splitGraphSegmentAt ) {

            tempGraphSegments = [];

            //---

            const graphSegment = getGraphSegmentByPosition( mousePos );

            if ( graphSegment !== null ) {

                //tempGraphSegments.push( { type: 'line', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y  }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                tempGraphSegments.push( { type: 'bezier', p0: { x: graphSegment.p0.x, y: graphSegment.p0.y }, controlPoint: { x: graphSegment.controlPoint.x, y: graphSegment.controlPoint.y }, p1: { x: graphSegment.p1.x, y: graphSegment.p1.y }, color: { r: 255, g: 255, b: 255, a: 255 } } );
                tempGraphSegments.push( { type: 'circ', position: { x: graphSegment.p0.x, y: graphSegment.p0.y }, diameter: 12, color: { r: 255, g: 0, b: 255, a: 255 }  } );
                tempGraphSegments.push( { type: 'circ', position: { x: graphSegment.p1.x, y: graphSegment.p1.y }, diameter: 12, color: { r: 0, g: 255, b: 255, a: 255 }  } );

                const pointOnGraphSegment = getNearestPointOnGraphSegmentByPosition( graphSegment, mousePos, 100 );

                tempGraphSegments.push( { type: 'circfill', position: { x: pointOnGraphSegment.x, y: pointOnGraphSegment.y }, diameter: 5, color: { r: 255, g: 0, b: 255, a: 255 }  } );

            }

        } else if ( editorMode === EDITOR_MODE_ENUM.movePoint ) {

            if ( mouseDown === true ) {

                movePoint( mousePos );
                // movePoint( mouseCursor.position ); //under construction

            }

        } else if ( editorMode === EDITOR_MODE_ENUM.showRoute ) {

            showRoute( mouseCursor.position );

        }

        if ( editorMode === EDITOR_MODE_ENUM.bendGraphSegment ) {

            if ( mouseDown === true ) {

                bendGraphSegment( mousePos );

            }

        }

        if ( editorMode === EDITOR_MODE_ENUM.addStreetSegment ) {

            tempGraphSegments = [];

            const streetSegment = currentStreetSegment;

            if ( streetSegment !== null ) {

                streetSegment.crossLanes = [];
                streetSegment.borders = [];
                streetSegment.centerLanes = [];

                //neues street element ohne verbindung zu einem bestehendem street element
                if ( streetSegment.modus === 'new' ) {

                    if ( streetSegment.p0 !== null && streetSegment.p1 === null ) {

                        // const graphDistance = 50;

                        // const tempP1 = { x: mousePos.x, y: mousePos.y };

                        //---

                        // const angleStart = Math.atan2( tempP1.y - streetSegment.p0.y, tempP1.x - streetSegment.p0.x );

                        // const sinA = Math.sin( angleStart );
                        // const cosA = Math.cos( angleStart );

                        // streetSegment.pTS.x = sinA * graphDistance + streetSegment.p0.x;
                        // streetSegment.pTS.y = -cosA * graphDistance + streetSegment.p0.y;
                        // streetSegment.pBS.x = -sinA * graphDistance + streetSegment.p0.x;
                        // streetSegment.pBS.y = cosA * graphDistance + streetSegment.p0.y;

                        // streetSegment.pTE.x = sinA * graphDistance + tempP1.x;
                        // streetSegment.pTE.y = -cosA * graphDistance + tempP1.y;
                        // streetSegment.pBE.x = -sinA * graphDistance + tempP1.x;
                        // streetSegment.pBE.y = cosA * graphDistance + tempP1.y;

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

                        // tempGraphSegments.push( { type: 'line', p0: { x: streetSegment.p0.x, y: streetSegment.p0.y }, p1: { x: tempP1.x, y: tempP1.y }, color: { r: 100, g: 100, b: 100, a: 255 } } );

                        // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.p0.x, y: streetSegment.p0.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );
                        // tempGraphSegments.push( { type: 'circfill', position: { x: tempP1.x, y: tempP1.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );

                        // tempGraphSegments.push( { type: 'line', p0: { x: streetSegment.pTS.x | 0, y: streetSegment.pTS.y | 0 }, p1: { x: streetSegment.pBS.x | 0, y: streetSegment.pBS.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                        // tempGraphSegments.push( { type: 'line', p0: { x: streetSegment.pTE.x | 0, y: streetSegment.pTE.y | 0 }, p1: { x: streetSegment.pBE.x | 0, y: streetSegment.pBE.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );

                        // tempGraphSegments.push( { type: 'line', p0: { x: streetSegment.pTS.x | 0, y: streetSegment.pTS.y | 0 }, p1: { x: streetSegment.pTE.x | 0, y: streetSegment.pTE.y | 0 }, color: { r: 255, g: 0, b: 0, a: 255 } } );
                        // tempGraphSegments.push( { type: 'line', p0: { x: streetSegment.pBS.x | 0, y: streetSegment.pBS.y | 0 }, p1: { x: streetSegment.pBE.x | 0, y: streetSegment.pBE.y | 0 }, color: { r: 0, g: 255, b: 0, a: 255 } } );

                        // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.centerPoint.x, y: streetSegment.centerPoint.y }, diameter: 6, color: { r: 155, g: 155, b: 155, a: 255 } } );
                        // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pTCenter.x, y: streetSegment.pTCenter.y }, diameter: 6, color: { r: 155, g: 155, b: 155, a: 255 } } );
                        // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pBCenter.x, y: streetSegment.pBCenter.y }, diameter: 6, color: { r: 155, g: 155, b: 155, a: 255 } } );

                        // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.controlPoint.x, y: streetSegment.controlPoint.y }, diameter: 3, color: { r: 255, g: 255, b: 255, a: 255 } } );
                        // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pTControl.x, y: streetSegment.pTControl.y }, diameter: 3, color: { r: 255, g: 255, b: 255, a: 255 } } );
                        // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pBControl.x, y: streetSegment.pBControl.y }, diameter: 3, color: { r: 255, g: 255, b: 255, a: 255 } } );

                        // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pTS.x, y: streetSegment.pTS.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );
                        // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pTE.x, y: streetSegment.pTE.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );
                        // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pBS.x, y: streetSegment.pBS.y }, diameter: 3, color: { r: 0, g: 255, b: 0, a: 255 } } );
                        // tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.pBE.x, y: streetSegment.pBE.y }, diameter: 3, color: { r: 0, g: 255, b: 0, a: 255 } } );

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
                        // const angleStart = Math.PI * 0.98;
                        const angleStart = streetSegment.angle0;
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

                        streetSegment.angle1 = angleEnd;

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

                        tempGraphSegments.push( { type: 'line', p0: { x: lineAdjacent.p0.x, y: lineAdjacent.p0.y }, p1: { x: lineAdjacent.p1.x, y: lineAdjacent.p1.y }, color: { r: 55, g: 55, b: 155, a: 255 } } );
                        tempGraphSegments.push( { type: 'line', p0: { x: lineOpposite.p0.x, y: lineOpposite.p0.y }, p1: { x: lineOpposite.p1.x, y: lineOpposite.p1.y }, color: { r: 55, g: 155, b: 55, a: 255 } } );
                        tempGraphSegments.push( { type: 'circfill', position: lineHypotenuseCenterPoint, diameter: 5, color: { r: 255, g: 55, b: 55, a: 255 } } );
                        tempGraphSegments.push( { type: 'line', p0: { x: lineIntersection.p0.x | 0, y: lineIntersection.p0.y | 0 }, p1: { x: lineIntersection.p1.x | 0, y: lineIntersection.p1.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                        tempGraphSegments.push( { type: 'circfill', position: { x: intersectionPoint.x, y: intersectionPoint.y }, diameter: 3, color: { r: 0, g: 255, b: 0, a: 255 } } );
                        tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.centerPoint.x, y: streetSegment.centerPoint.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );
                        tempGraphSegments.push( { type: 'line', p0: { x: streetSegment.p0.x, y: streetSegment.p0.y }, p1: { x: tempP1.x, y: tempP1.y }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                        tempGraphSegments.push( { type: 'circfill', position: { x: streetSegment.p0.x, y: streetSegment.p0.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );
                        tempGraphSegments.push( { type: 'circfill', position: { x: tempP1.x, y: tempP1.y }, diameter: 3, color: { r: 100, g: 100, b: 100, a: 255 } } );

                        //---

                        tempGraphSegments.push( { type: 'bezier', p0: streetSegment.p0, controlPoint: streetSegment.controlPoint, p1: tempP1, color: { r: 100, g: 100, b: 100, a: 255 } } );

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
                                // if ( i === lanePositionSwitch || i === lanePositionSwitch + 1 ) {

                                //     laneDistance = laneDistance / 2;

                                // }

                                //---

                                //start und end punkte seitlich der mittellinie platzieren
                                if ( i <= lanePositionSwitch ) {

                                    if ( lane.p0.x === 0 && lane.p0.y === 0 ) {

                                        lane.p0.x = sinStart * laneDistance + streetSegment.p0.x;
                                        lane.p0.y = -cosStart * laneDistance + streetSegment.p0.y;

                                    }

                                    // lane.p0.x = sinStart * laneDistance + streetSegment.p0.x;
                                    // lane.p0.y = -cosStart * laneDistance + streetSegment.p0.y;
                                    lane.p1.x = sinEnd * laneDistance + tempP1.x;
                                    lane.p1.y = -cosEnd * laneDistance + tempP1.y;

                                } else {

                                    if ( lane.p0.x === 0 && lane.p0.y === 0 ) {

                                        lane.p0.x = -sinStart * laneDistance + streetSegment.p0.x;
                                        lane.p0.y = cosStart * laneDistance + streetSegment.p0.y;
                                        
                                    }

                                    // lane.p0.x = -sinStart * laneDistance + streetSegment.p0.x;
                                    // lane.p0.y = cosStart * laneDistance + streetSegment.p0.y;
                                    lane.p1.x = -sinEnd * laneDistance + tempP1.x;
                                    lane.p1.y = cosEnd * laneDistance + tempP1.y;

                                }

                                //---
                                //streetBorder

                                let borderDistance = 0;

                                if ( i === 0 && i <= lanePositionSwitch || i === l - 1 && i > lanePositionSwitch ) {

                                    if ( i === 0 ) {

                                        borderDistance = ( ( streetSegment.lanes.length / 2 ) * -1 ) * streetSegment.laneDistance - streetSegment.laneDistance;

                                    } else if ( i === l - 1 ) {

                                        borderDistance = ( ( streetSegment.lanes.length / 2 ) * 1 ) * streetSegment.laneDistance + streetSegment.laneDistance;

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

                                    tempGraphSegments.push( { type: 'bezier', p0: streetBorder.p0, controlPoint: streetBorder.controlPoint, p1: streetBorder.p1, color: { r: 255, g: 55, b: 255, a: 255 } } );

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

                                tempGraphSegments.push( { type: 'line', p0: { x: lane.p0.x, y: lane.p0.y }, p1: { x: lane.p1.x, y: lane.p1.y }, color: { r: 55, g: 55, b: 55, a: 255 } } );
                                tempGraphSegments.push( { type: 'line', p0: { x: lineAdjacent.p0.x, y: lineAdjacent.p0.y }, p1: { x: lineAdjacent.p1.x, y: lineAdjacent.p1.y }, color: { r: 25, g: 25, b: 75, a: 255 } } );
                                tempGraphSegments.push( { type: 'line', p0: { x: lineOpposite.p0.x, y: lineOpposite.p0.y }, p1: { x: lineOpposite.p1.x, y: lineOpposite.p1.y }, color: { r: 25, g: 75, b: 25, a: 255 } } );
                                tempGraphSegments.push( { type: 'circfill', position: lineHypotenuseCenterPoint, diameter: 3, color: { r: 155, g: 55, b: 55, a: 255 } } );
                                tempGraphSegments.push( { type: 'line', p0: { x: lineIntersection.p0.x | 0, y: lineIntersection.p0.y | 0 }, p1: { x: lineIntersection.p1.x | 0, y: lineIntersection.p1.y | 0 }, color: { r: 55, g: 55, b: 55, a: 255 } } );
                                tempGraphSegments.push( { type: 'circfill', position: { x: intersectionPoint.x, y: intersectionPoint.y }, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );
                                tempGraphSegments.push( { type: 'circfill', position: { x: lane.centerPoint.x, y: lane.centerPoint.y }, diameter: 3, color: { r: 55, g: 55, b: 55, a: 255 } } );
                                tempGraphSegments.push( { type: 'line', p0: { x: lane.p0.x | 0, y: lane.p0.y | 0 }, p1: { x: streetSegment.p0.x | 0, y: streetSegment.p0.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                                tempGraphSegments.push( { type: 'line', p0: { x: lane.p1.x | 0, y: lane.p1.y | 0 }, p1: { x: tempP1.x | 0, y: tempP1.y | 0 }, color: { r: 100, g: 100, b: 100, a: 255 } } );
                                tempGraphSegments.push( { type: 'circfill', position: lane.p0, diameter: 3, color: { r: 155, g: 155, b: 155, a: 255 } } );
                                tempGraphSegments.push( { type: 'circfill', position: lane.p1, diameter: 3, color: { r: 155, g: 155, b: 155, a: 255 } } );

                                //---

                                tempGraphSegments.push( { type: 'bezier', p0: lane.p0, controlPoint: lane.controlPoint, p1: lane.p1, color: { r: 255, g: 55, b: 55, a: 255 } } );

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

                                        tempGraphSegments.push( { type: 'line', p0: { x: l0.p0.x | 0, y: l0.p0.y | 0 }, p1: { x: l0.p1.x | 0, y: l0.p1.y | 0 }, color: { r: 155, g: 155, b: 55, a: 255 } } );
                                        tempGraphSegments.push( { type: 'line', p0: { x: l1.p0.x | 0, y: l1.p0.y | 0 }, p1: { x: l1.p1.x | 0, y: l1.p1.y | 0 }, color: { r: 55, g: 155, b: 155, a: 255 } } );
                                        tempGraphSegments.push( { type: 'circfill', position: centerLane.p0, diameter: 3, color: { r: 55, g: 255, b: 55, a: 255 } } );
                                        tempGraphSegments.push( { type: 'circfill', position: centerLane.p1, diameter: 3, color: { r: 55, g: 255, b: 55, a: 255 } } );
                                        tempGraphSegments.push( { type: 'line', p0: { x: lineAdjacent0.p0.x, y: lineAdjacent0.p0.y }, p1: { x: lineAdjacent0.p1.x, y: lineAdjacent0.p1.y }, color: { r: 25, g: 25, b: 255, a: 255 } } );
                                        tempGraphSegments.push( { type: 'line', p0: { x: lineAdjacent1.p0.x, y: lineAdjacent1.p0.y }, p1: { x: lineAdjacent1.p1.x, y: lineAdjacent1.p1.y }, color: { r: 25, g: 25, b: 255, a: 255 } } );
                                        tempGraphSegments.push( { type: 'line', p0: { x: lineOpposite0.p0.x, y: lineOpposite0.p0.y }, p1: { x: lineOpposite0.p1.x, y: lineOpposite0.p1.y }, color: { r: 25, g: 255, b: 25, a: 255 } } );
                                        tempGraphSegments.push( { type: 'line', p0: { x: lineOpposite1.p0.x, y: lineOpposite1.p0.y }, p1: { x: lineOpposite1.p1.x, y: lineOpposite1.p1.y }, color: { r: 25, g: 255, b: 25, a: 255 } } );

                                        tempGraphSegments.push( { type: 'circfill', position: lineHypotenuseCenterPoint0, diameter: 3, color: { r: 255, g: 55, b: 55, a: 255 } } );
                                        tempGraphSegments.push( { type: 'line', p0: { x: lineIntersection0.p0.x | 0, y: lineIntersection0.p0.y | 0 }, p1: { x: lineIntersection0.p1.x | 0, y: lineIntersection0.p1.y | 0 }, color: { r: 55, g: 55, b: 55, a: 255 } } );

                                        tempGraphSegments.push( { type: 'circfill', position: lineHypotenuseCenterPoint1, diameter: 3, color: { r: 155, g: 55, b: 55, a: 255 } } );
                                        tempGraphSegments.push( { type: 'line', p0: { x: lineIntersection1.p0.x | 0, y: lineIntersection1.p0.y | 0 }, p1: { x: lineIntersection1.p1.x | 0, y: lineIntersection1.p1.y | 0 }, color: { r: 55, g: 55, b: 55, a: 255 } } );

                                        tempGraphSegments.push( { type: 'circfill', position: intersectionPoint0, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );
                                        tempGraphSegments.push( { type: 'circfill', position: intersectionPoint1, diameter: 3, color: { r: 255, g: 0, b: 0, a: 255 } } );

                                        //---

                                        tempGraphSegments.push( { type: 'bezier', p0: l0.p0, controlPoint: l0.controlPoint, p1: l0.p1, color: { r: 200, g: 200, b: 200, a: 255 } } );
                                        tempGraphSegments.push( { type: 'bezier', p0: l1.p0, controlPoint: l1.controlPoint, p1: l1.p1, color: { r: 200, g: 200, b: 200, a: 255 } } );

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

                            tempGraphSegments.push( { type: 'bezier', p0: lane.p0, controlPoint: lane.controlPoint, p1: lane.p1, color: { r: 200, g: 200, b: 200, a: 255 } } );

                            //---
                            //streetBorder

                            let borderDistanceTop = -streetSegment.laneDistance;
                            let borderDistanceBottom = streetSegment.laneDistance;

                            //---
                            //top

                            const streetBorderTop = getNewStreetSegmentLane( { x: sinStart * borderDistanceTop + streetSegment.p0.x, y: -cosStart * borderDistanceTop + streetSegment.p0.y }, { x: sinEnd * borderDistanceTop + tempP1.x, y: -cosEnd * borderDistanceTop + tempP1.y }, { x: 0, y: 0 }, { x: 0, y: 0 } );

                            const lineAdjacentTop = { p0: { x: sinAdjacent * scanDistance + streetBorderTop.p0.x, y: -cosAdjacent * scanDistance + streetBorderTop.p0.y }, p1: { x: -sinAdjacent * scanDistance + streetBorderTop.p0.x, y: cosAdjacent * scanDistance + streetBorderTop.p0.y } };
                            const lineOppositeTop = { p0: { x: sinOpposite * scanDistance + streetBorderTop.p1.x, y: -cosOpposite * scanDistance + streetBorderTop.p1.y }, p1: { x: -sinOpposite * scanDistance + streetBorderTop.p1.x, y: cosOpposite * scanDistance + streetBorderTop.p1.y } };
                            const lineHypotenuseCenterPointTop = { x: streetBorderTop.p1.x + ( streetBorderTop.p0.x - streetBorderTop.p1.x ) / 2, y: streetBorderTop.p1.y + ( streetBorderTop.p0.y - streetBorderTop.p1.y ) / 2 };
                            const lineIntersectionTop = { p0: { x: sinIntersection * scanDistance + lineHypotenuseCenterPointTop.x, y: -cosIntersection * scanDistance + lineHypotenuseCenterPointTop.y }, p1: { x: -sinIntersection * scanDistance + lineHypotenuseCenterPointTop.x, y: cosIntersection * scanDistance + lineHypotenuseCenterPointTop.y } };

                            //---

                            let intersectionPointTop = null;
                            let intersectionPointTop0 = getLinesIntersectionPoint( lineAdjacentTop.p0.x, lineAdjacentTop.p0.y, lineAdjacentTop.p1.x, lineAdjacentTop.p1.y, lineIntersectionTop.p0.x, lineIntersectionTop.p0.y, lineIntersectionTop.p1.x, lineIntersectionTop.p1.y );
                            let intersectionPointTop1 = getLinesIntersectionPoint( lineOppositeTop.p0.x, lineOppositeTop.p0.y, lineOppositeTop.p1.x, lineOppositeTop.p1.y, lineIntersectionTop.p0.x, lineIntersectionTop.p0.y, lineIntersectionTop.p1.x, lineIntersectionTop.p1.y );

                            const distintersectionPointTop00 = getDistance( intersectionPointTop0, lineHypotenuseCenterPointTop );
                            const distintersectionPointTop01 = getDistance( intersectionPointTop1, lineHypotenuseCenterPointTop );

                            if ( distintersectionPointTop00 <= distintersectionPointTop01 ) {

                                intersectionPointTop = intersectionPointTop0;

                            } else {

                                intersectionPointTop = intersectionPointTop1;

                            }

                            streetBorderTop.controlPoint.x = intersectionPointTop.x;
                            streetBorderTop.controlPoint.y = intersectionPointTop.y;
                            streetBorderTop.centerPoint = interpolateQuadraticBezier( streetBorderTop.p0, streetBorderTop.controlPoint, streetBorderTop.p1, 0.50 );

                            //---

                            tempGraphSegments.push( { type: 'bezier', p0: streetBorderTop.p0, controlPoint: streetBorderTop.controlPoint, p1: streetBorderTop.p1, color: { r: 255, g: 55, b: 255, a: 255 } } );

                            //---

                            streetSegment.borders.push( streetBorderTop );

                            //---
                            //bottom
                            
                            const streetBorderBottom = getNewStreetSegmentLane( { x: sinStart * borderDistanceBottom + streetSegment.p0.x, y: -cosStart * borderDistanceBottom + streetSegment.p0.y }, { x: sinEnd * borderDistanceBottom + tempP1.x, y: -cosEnd * borderDistanceBottom + tempP1.y }, { x: 0, y: 0 }, { x: 0, y: 0 } );

                            const lineAdjacentBottom = { p0: { x: sinAdjacent * scanDistance + streetBorderBottom.p0.x, y: -cosAdjacent * scanDistance + streetBorderBottom.p0.y }, p1: { x: -sinAdjacent * scanDistance + streetBorderBottom.p0.x, y: cosAdjacent * scanDistance + streetBorderBottom.p0.y } };
                            const lineOppositeBottom = { p0: { x: sinOpposite * scanDistance + streetBorderBottom.p1.x, y: -cosOpposite * scanDistance + streetBorderBottom.p1.y }, p1: { x: -sinOpposite * scanDistance + streetBorderBottom.p1.x, y: cosOpposite * scanDistance + streetBorderBottom.p1.y } };
                            const lineHypotenuseCenterPointBottom = { x: streetBorderBottom.p1.x + ( streetBorderBottom.p0.x - streetBorderBottom.p1.x ) / 2, y: streetBorderBottom.p1.y + ( streetBorderBottom.p0.y - streetBorderBottom.p1.y ) / 2 };
                            const lineIntersectionBottom = { p0: { x: sinIntersection * scanDistance + lineHypotenuseCenterPointBottom.x, y: -cosIntersection * scanDistance + lineHypotenuseCenterPointBottom.y }, p1: { x: -sinIntersection * scanDistance + lineHypotenuseCenterPointBottom.x, y: cosIntersection * scanDistance + lineHypotenuseCenterPointBottom.y } };

                            //---

                            let intersectionPointBottom = null;
                            let intersectionPointBottom0 = getLinesIntersectionPoint( lineAdjacentBottom.p0.x, lineAdjacentBottom.p0.y, lineAdjacentBottom.p1.x, lineAdjacentBottom.p1.y, lineIntersectionBottom.p0.x, lineIntersectionBottom.p0.y, lineIntersectionBottom.p1.x, lineIntersectionBottom.p1.y );
                            let intersectionPointBottom1 = getLinesIntersectionPoint( lineOppositeBottom.p0.x, lineOppositeBottom.p0.y, lineOppositeBottom.p1.x, lineOppositeBottom.p1.y, lineIntersectionBottom.p0.x, lineIntersectionBottom.p0.y, lineIntersectionBottom.p1.x, lineIntersectionBottom.p1.y );

                            const distintersectionPointBottom00 = getDistance( intersectionPointBottom0, lineHypotenuseCenterPointBottom );
                            const distintersectionPointBottom01 = getDistance( intersectionPointBottom1, lineHypotenuseCenterPointBottom );

                            if ( distintersectionPointBottom00 <= distintersectionPointBottom01 ) {

                                intersectionPointBottom = intersectionPointBottom0;

                            } else {

                                intersectionPointBottom = intersectionPointBottom1;

                            }

                            streetBorderBottom.controlPoint.x = intersectionPointBottom.x;
                            streetBorderBottom.controlPoint.y = intersectionPointBottom.y;
                            streetBorderBottom.centerPoint = interpolateQuadraticBezier( streetBorderBottom.p0, streetBorderBottom.controlPoint, streetBorderBottom.p1, 0.50 );

                            //---

                            tempGraphSegments.push( { type: 'bezier', p0: streetBorderBottom.p0, controlPoint: streetBorderBottom.controlPoint, p1: streetBorderBottom.p1, color: { r: 255, g: 55, b: 255, a: 255 } } );

                            //---

                            streetSegment.borders.push( streetBorderBottom );


                            /*
                            let borderDistance = 0;

                            if ( i === 0 && i <= lanePositionSwitch || i === l - 1 && i > lanePositionSwitch ) {

                                if ( i === 0 ) {

                                    borderDistance = ( ( streetSegment.lanes.length / 2 ) * -1 ) * streetSegment.laneDistance - streetSegment.laneDistance;

                                } else if ( i === l - 1 ) {

                                    borderDistance = ( ( streetSegment.lanes.length / 2 ) * 1 ) * streetSegment.laneDistance + streetSegment.laneDistance;

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

                                tempGraphSegments.push( { type: 'bezier', p0: streetBorder.p0, controlPoint: streetBorder.controlPoint, p1: streetBorder.p1, color: { r: 255, g: 55, b: 255, a: 255 } } );

                                //---

                                streetSegment.borders.push( streetBorder );
                                
                            }
                            */

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

        const graphIndex = 0;

        const graph = graphHolder[ graphIndex ];

        //---

        const route = graph.routes[ routeIndex ];

        const output = {

            point: null,
            angle: 0

        };

        const routeLength = route.length;
        const tLength = t * routeLength;

        let curLength = 0;
        let lastLength = 0;

        for ( let i = 0, l = route.graphSegments.length; i < l; i ++ ) {

            const graphSegment = route.graphSegments[ i ];

            curLength += graphSegment.length;

            if ( tLength <= curLength ) {

                const tGraphSegment = ( tLength - lastLength ) / graphSegment.length;

                const point0 = interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, tGraphSegment );
                const point1 = interpolateQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, tGraphSegment + 0.001 );

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

        graphHolder.forEach( ( graph, index ) => {

            // let distanceAtTheMoment = Infinity;
            // let graphSegmentSelected = null;

            // if ( editorMode === EDITOR_MODE_ENUM.addGraphSegment ) {

            //     for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

            //         const graphSegment = graph.segments[ i ];

            //         if ( graphSegment.p0 !== null && graphSegment.p1 !== null ) {

            //             const distanceToSegment = signedDistanceToQuadraticBezier( mousePos, graphSegment.p0, graphSegment.p1, graphSegment.controlPoint, 25 );

            //             if ( distanceAtTheMoment > distanceToSegment ) {

            //                 distanceAtTheMoment = distanceToSegment;

            //                 if ( distanceAtTheMoment <= SNAP_TO_DISTANCE ) {

            //                     graphSegmentSelected = graphSegment;

            //                 }

            //             }

            //         }

            //     }

            //     if ( graphSegmentSelected !== null ) {



            //     }

            // }

            // //console.log( 'd: ', d );
            // //console.log( 'graphSegmentSelected: ', graphSegmentSelected );

            for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

                const graphSegment = graph.segments[ i ];

                if ( graphSegment.p0 !== null && graphSegment.p1 !== null ) {

                    //const distanceToSegment = signedDistanceToQuadraticBezier( mousePos, graphSegment.p0, graphSegment.p1, graphSegment.controlPoint, 25 );

                    //console.log( distanceToSegment );



                    //---

                    const distancep0 = getDistance( mousePos, graphSegment.p0 );
                    const distancep1 = getDistance( mousePos, graphSegment.p1 );

                    if ( distancep0 <= SNAP_TO_DISTANCE ) {

                        mouseCursor.position.x = graphSegment.p0.x;
                        mouseCursor.position.y = graphSegment.p0.y;
                        mouseCursor.color = { r: 0, g: 255, b: 0, a: 255 };

                        //console.log( 'p0: ', graphSegment.p0.x, graphSegment.p0.y, mousePos.x, mousePos.y );

                    } else if ( distancep1 <= SNAP_TO_DISTANCE ) {

                        mouseCursor.position.x = graphSegment.p1.x;
                        mouseCursor.position.y = graphSegment.p1.y;
                        mouseCursor.color = { r: 0, g: 255, b: 0, a: 255 };

                        //console.log( 'p1: ', graphSegment.p1.x, graphSegment.p1.y, mousePos.x, mousePos.y );

                    }

                }

            }

            //---

            for ( let i = 0, l = graph.streetSegments.length; i < l; i ++ ) {

                const streetSegment = graph.streetSegments[ i ];

                if ( streetSegment.p0 !== null && streetSegment.p1 !== null ) {

                    const distancep0 = getDistance( mousePos, streetSegment.p0 );
                    const distancep1 = getDistance( mousePos, streetSegment.p1 );

                    if ( distancep0 <= SNAP_TO_DISTANCE ) {

                        mouseCursor.position.x = streetSegment.p0.x;
                        mouseCursor.position.y = streetSegment.p0.y;
                        mouseCursor.color = { r: 0, g: 255, b: 0, a: 255 };

                        //console.log( 'p0: ', graphSegment.p0.x, graphSegment.p0.y, mousePos.x, mousePos.y );

                    } else if ( distancep1 <= SNAP_TO_DISTANCE ) {

                        mouseCursor.position.x = streetSegment.p1.x;
                        mouseCursor.position.y = streetSegment.p1.y;
                        mouseCursor.color = { r: 0, g: 255, b: 0, a: 255 };

                        //console.log( 'p1: ', graphSegment.p1.x, graphSegment.p1.y, mousePos.x, mousePos.y );

                    }

                    //---

                    drawCircle( streetSegment.p0, 3, 124, 252, 0, 255 );
                    drawCircleOutline( streetSegment.p0, 6, 124, 252, 0, 255 );

                    drawCircle( streetSegment.p1, 3, 124, 252, 0, 255 );
                    drawCircleOutline( streetSegment.p1, 6, 124, 252, 0, 255 );

                }

            }

            //---

            for ( let i = 0, l = graph.segments.length; i < l; i ++ ) {

                const graphSegment = graph.segments[ i ];

                if ( graphSegment.p0 !== null ) {

                    if ( graphSegment.p1 === null && i === l - 1 ) {

                        drawLine( graphSegment.p0.x | 0, graphSegment.p0.y | 0, mouseCursor.position.x | 0, mouseCursor.position.y | 0, 80, 80, 80, 255 );

                        // if ( allowGraphSegmentSplitting === true ) {

                        //     const tempGraphSegment = {

                        //         id: graphSegment.id,
                        //         p0: graphSegment.p0,
                        //         p1: { x: mouseCursor.position.x, y: mouseCursor.position.y }

                        //     };

                        //     showGraphSegmentIntersectionPointsWithLine( tempGraphSegment );

                        // }

                    }

                }

                if ( graphSegment.p1 !== null ) {

                    let graphSegmentLineColor = { r: 0, g: 0, b: 0, a: 0 };

                    if ( graphSegment.walkable === true ) {

                        // drawLine( graphSegment.p0.x | 0, graphSegment.p0.y | 0, graphSegment.p1.x | 0, graphSegment.p1.y | 0, 60, 120, 0, 255 );

                        graphSegmentLineColor.r = 60;
                        graphSegmentLineColor.g = 120;
                        graphSegmentLineColor.b = 0;
                        graphSegmentLineColor.a = 255;

                        drawCircle( graphSegment.centerPoint, 7, 60, 120, 0, 255 );
                        // drawCircle( graphSegment.controlPoint, 5, 60, 120, 0, 255 );

                    } else {

                        // drawLine( graphSegment.p0.x | 0, graphSegment.p0.y | 0, graphSegment.p1.x | 0, graphSegment.p1.y | 0, 178, 34, 34, 255 );

                        graphSegmentLineColor.r = 178;
                        graphSegmentLineColor.g = 34;
                        graphSegmentLineColor.b = 34;
                        graphSegmentLineColor.a = 255;

                        drawCircle( graphSegment.centerPoint, 7, 178, 34, 34, 255 );
                        // drawCircle( graphSegment.controlPoint, 5, 178, 34, 34, 255 );

                    }

                    //drawLine( graphSegment.p0.x | 0, graphSegment.p0.y | 0, graphSegment.p1.x | 0, graphSegment.p1.y | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );

                    drawQuadraticBezier( graphSegment.p0, graphSegment.controlPoint, graphSegment.p1, 25, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );

                    //---
                    //draw debug graphSegment direction stuff

                    //get point on graphSegment depending on percentage value
                    //const interpolationPoint = interpolate( graphSegment.p0, graphSegment.p1, 0.50 );

                    //const cX = interpolationPoint.x;
                    //const cY = interpolationPoint.y;

                    //center x & y
                    const cX = graphSegment.centerPoint.x;// ( ( graphSegment.p0.x + graphSegment.p1.x ) / 2 );
                    const cY = graphSegment.centerPoint.y;// ( ( graphSegment.p0.y + graphSegment.p1.y ) / 2 );

                    //graphSegment angle
                    const angle = Math.atan2( graphSegment.p1.y - graphSegment.p0.y, graphSegment.p1.x - graphSegment.p0.x );

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

                    if ( graphSegment.direction === '><' ) {

                        drawLine( ( sinA * length + pSSX ) | 0, ( -cosA * length + pSSY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );
                        drawLine( ( -sinA * length + pSSX ) | 0, ( cosA * length + pSSY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );

                        drawLine( ( sinA * length + pSEX ) | 0, ( -cosA * length + pSEY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );
                        drawLine( ( -sinA * length + pSEX ) | 0, ( cosA * length + pSEY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );

                    } else if ( graphSegment.direction === '>' ) {

                        drawLine( ( sinA * length + pSEX ) | 0, ( -cosA * length + pSEY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );
                        drawLine( ( -sinA * length + pSEX ) | 0, ( cosA * length + pSEY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );

                    } else if ( graphSegment.direction === '<' ) {

                        drawLine( ( sinA * length + pSSX ) | 0, ( -cosA * length + pSSY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );
                        drawLine( ( -sinA * length + pSSX ) | 0, ( cosA * length + pSSY ) | 0, cX | 0, cY | 0, graphSegmentLineColor.r, graphSegmentLineColor.g, graphSegmentLineColor.b, graphSegmentLineColor.a );

                    }

                }

            }

            for ( let i = 0, l = graph.points.length; i < l; i ++ ) {

                const point = graph.points[ i ];

                if ( getPointByPosition( point ).walkable === true ) {

                    drawCircle( point, 3, 124, 252, 0, 255 );

                    drawCircleOutline( point, 6, 124, 252, 0, 255 );

                } else {

                    drawCircle( point, 3, 178, 34, 34, 255 );

                    drawCircleOutline( point, 6, 178, 34, 34, 255 );

                }

            }

            for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

                const route = graph.routes[ i ];
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

            for ( let i = 0, l = graph.streetSegments.length; i < l; i ++ ) {

                const streetSegment = graph.streetSegments[ i ];

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

        for ( let i = 0, l = tempGraphSegments.length; i < l; i ++ ) {

            const tempGraphSegment = tempGraphSegments[ i ];

            if ( tempGraphSegment.type === 'line' ) {

                drawLine( tempGraphSegment.p0.x | 0, tempGraphSegment.p0.y | 0, tempGraphSegment.p1.x | 0, tempGraphSegment.p1.y | 0, tempGraphSegment.color.r, tempGraphSegment.color.g, tempGraphSegment.color.b, tempGraphSegment.color.a );

            } else if ( tempGraphSegment.type === 'circ' ) {

                drawCircleOutline( tempGraphSegment.position, tempGraphSegment.diameter, tempGraphSegment.color.r, tempGraphSegment.color.g, tempGraphSegment.color.b, tempGraphSegment.color.a );

            } else if ( tempGraphSegment.type === 'circfill' ) {

                drawCircle( tempGraphSegment.position, tempGraphSegment.diameter, tempGraphSegment.color.r, tempGraphSegment.color.g, tempGraphSegment.color.b, tempGraphSegment.color.a );

            } else if ( tempGraphSegment.type === 'bezier' ) {

                drawQuadraticBezier( tempGraphSegment.p0, tempGraphSegment.controlPoint, tempGraphSegment.p1, 25, tempGraphSegment.color.r, tempGraphSegment.color.g, tempGraphSegment.color.b, tempGraphSegment.color.a );

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

            const fileGraph = './img/car_' + fileIndex + '.png'

            const vehicleImage = new Image();

            vehicleImage.crossOrigin = 'anonymous';
            vehicleImage.src = fileGraph;

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

            const graphIndex = 0;

            const graph = graphHolder[ graphIndex ];

            for ( let i = 0, l = graph.routes.length; i < l; i ++ ) {

                const routeIndex = i;
                const route = graph.routes[ routeIndex ];

                if ( route.startPoint === null || route.endPoint === null || route.complete === false || route.graphSegments.length === 0 ) {

                    continue;

                }

                const routePositionObject = getPointAndAngleOnRouteByT( 0, routeIndex );

                if ( routePositionObject === null ) {

                    continue;

                }

                const vehicleImage = vehcileImageHolder[ Math.floor( Math.random() * vehcileImageHolder.length ) ];
                const vehicle = getVehicle( routePositionObject.point, routePositionObject.angle, 0, graphIndex, routeIndex, 0.0015, vehicleImage );

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

    function getVehicle( position, angle = 0, t = 0, graphIndex = 0, routeIndex = 0, speed = 0.0015, image = null ) {

        const vehicle = {

            position: { x: position.x, y: position.y },
            angle: angle,
            t: t,
            graphIndex: graphIndex,
            routeIndex: routeIndex,
            speed: speed,
            image: image

        }

        return vehicle;

    }

    function simulateVehicles() {

        for ( let i = 0, l = vehiclesHolder.length; i < l; i ++ ) {

            const vehicle = vehiclesHolder[ i ];

            const route = graphHolder[ vehicle.graphIndex ].routes[ vehicle.routeIndex ];
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