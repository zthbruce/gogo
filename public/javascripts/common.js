
var weixing = blmol.layer.createTianDiSatelliteTile('weixiang');
var haitu = blmol.layer.createBaseSeaTile('haitu');
var tiandi = blmol.layer.createTianDiTile('tiandi');

function setMapShow() {
    weixing.setVisible(false);
    haitu.setVisible(false);
    tiandi.setVisible(false);
    if($('.map_mouse_select').index() == 0){
        haitu.setVisible(false);
        tiandi.setVisible(true);
        weixing.setVisible(false);
        $(".basic_map_list>div").eq(0).addClass("map_mouse_select");
    }else if($('.map_mouse_select').index() == 1){
        weixing.setVisible(true);
        haitu.setVisible(false);
        tiandi.setVisible(false);
        $(".basic_map_list>div").eq(1).addClass("map_mouse_select");
    }else if($('.map_mouse_select').index() == 3){
        weixing.setVisible(false);
        haitu.setVisible(true);
        tiandi.setVisible(true);
        $(".basic_map_list>div").eq(2).addClass("map_mouse_select");
    }else{
        weixing.setVisible(true);
    }
    $('#weitu').on('click',function () {
        weixing.setVisible(true);
        haitu.setVisible(false);
        tiandi.setVisible(false);
    });
    $('#haitu').on('click',function () {
        weixing.setVisible(false);
        haitu.setVisible(true);
        tiandi.setVisible(false);
    });
    $('#ditu').on('click',function () {
        haitu.setVisible(false);
        tiandi.setVisible(true);
        weixing.setVisible(false);
    });
}

/*************************************************页面全屏相关方法******************************************************/
/**
 * 进入全屏方法
 */
function enterFullScreen() {
    var de = document.documentElement;
    if (de.requestFullscreen) {
        de.requestFullscreen();
    } else if (de.mozRequestFullScreen) {
        de.mozRequestFullScreen();
    } else if (de.webkitRequestFullScreen) {
        de.webkitRequestFullScreen();
    }
}

/**
 * 退出全屏方法
 */
function exitFullScreen() {
    var de = document;
    if (de.exitFullscreen) {
        de.exitFullscreen();
    } else if (de.mozCancelFullScreen) {
        de.mozCancelFullScreen();
    } else if (de.webkitCancelFullScreen) {
        de.webkitCancelFullScreen();
    }
}

/**
 * 点击地图放大按钮事件监听方法
 */
$(".map-big").on("click", function () {
    blmol.operation.zoomOut(map);
});
/**
 * 点击地图缩小按钮事件监听方法
 */
$(".map-small").on("click", function () {
    blmol.operation.zoomIn(map);
});

/**
 * 记录当前网页是否全屏状态
 * @type {boolean}
 */
var isfullscreen = false;

/**
 *  监听地图全屏显示按钮点击方法
 */
$(".map-Full-screen").on("click", function () {
    if(isfullscreen == false){
        enterFullScreen();
    }else {
        exitFullScreen()
    }
    isfullscreen = !isfullscreen;
});


// //获取一条直线线与X轴方向的夹角
// function getAngleByOneLine(line) {
//     var angle = getMinAngle([[0,0],[200,0]],line);
//     if(line[1][1] - line[0][1]<0){
//         angle = 360 - angle;
//     }
//     return angle;
// }
// console.log('线与X轴夹角');
// console.log(getAngleByOneLine([[-1,0],[1,1]]));
// //获取两条线最小夹角
// function getMinAngle(line1,line2) {
//     var x1 = line1[0][0];
//     var y1 = line1[0][1];
//     var x2 = line1[1][0];
//     var y2 = line1[1][1];
//     var x3 = line2[0][0];
//     var y3 = line2[0][1];
//     var x4 = line2[1][0];
//     var y4 = line2[1][1];
//     var x11 = x2-x1;
//     var y11 = y2-y1;
//     var x22 = x4-x3;
//     var y22 = y4-y3;
//     var angle = Math.acos((x11*x22+y11*y22)/(Math.sqrt(x11*x11+y11*y11)*Math.sqrt(x22*x22+y22*y22)));
//     angle = (angle/(2*Math.PI))*360;
//     return angle;
// }
// //获取从第一条线开始逆时针旋转到第二天线的夹角
// function getReallyAngle(line1,line2) {
//     var angle1 = getAngleByOneLine(line1);
//     var angle2 = getAngleByOneLine(line2);
//     if(angle2 - angle1>0){
//         return angle2 - angle1;
//     }else{
//         return 360 + (angle2 - angle1);
//     }
// }
// console.log('两条线的夹角');
// console.log(getReallyAngle([[1,100],[-1,-1]],[[-1,-1],[1,10]]));
// //获取两条线交点
// function getMeetPoint(line1,line2) {
//     var x0 = line1[0][0];
//     var y0 = line1[0][1];
//     var x1 = line1[1][0];
//     var y1 = line1[1][1];
//     var x2 = line2[0][0];
//     var y2 = line2[0][1];
//     var x3 = line2[1][0];
//     var y3 = line2[1][1];
//     var y = ((y0-y1)*(y3-y2)*x0+(y3-y2)*(x1-x0)*y0 +(y1-y0)*(y3-y2)*x2+(x2-x3)*(y1-y0)*y2)/((x1-x0)*(y3-y2)+(y0-y1)*(x3-x2) );
//     var x = x2 + (x3-x2)*(y-y2) / (y3-y2);
//     if(y1-y0==0){
//         y=y1;
//         x = x2 + (x3-x2)*(y-y2) / (y3-y2);
//     }else if(y3-y2==0){
//         y=y3;
//         x = x0 + (x1-x0)*(y-y0) / (y1-y0);
//     }else if(x1-x0==0){
//         x=x1;
//         y = y2 + (y3-y2)*(x-x2)/(x3-x2);
//     }else if(x3-x2==0){
//         x=x3;
//         y = y0 + (y1-y0)*(x-x0)/(x1-x0);
//     }
//     return [x,y];
// }
// console.log('获取两条线交点');
// console.log(getMeetPoint([[15,1.9],[0.5,-1]],[[1,0],[-1,2]]));
// //获取一点到直线的最近点或斜点 angle point与线交点到point点方向与线方向交点( 0< angle < 180)
// function getLinePoint(line,point,angle) {
//     //点到直线最近的点
//     var onepoint = [];
//     //要请求的交点
//     var twopoint = [];
//     //已知直线的斜率
//     var k = (line[1][1] - line[0][1])/(line[1][0] - line[0][0]);
//     var k1 = (line[1][1] - point[1])/(line[1][0] - point[0]);
//     if(k==k1 || point == line[0] || point == line[1]){return point;}
//     var x = point[0]+1;
//     //直线与X轴平行
//     if(k==0){
//         x = point[0];
//         onepoint = getMeetPoint(line,[point,[x,point[1]+1]]);
//     }else if(line[1][0] - line[0][0]==0){
//         onepoint = getMeetPoint(line,[point,[line[1][0],point[1]]]);
//     }else{
//         onepoint = getMeetPoint(line,[point,[x,-k*x+point[1]+ k*point[0]]]);
//     }
//     if(angle == null || angle == '' || angle == undefined || angle == 90){
//         twopoint = onepoint;
//     }else{
//         //点到直线的最近距离
//         var length =Math.sqrt((point[1]-onepoint[1])*(point[1]-onepoint[1])+(point[0]-onepoint[0])*(point[0]-onepoint[0]));
//         var angle1 = 0;
//         if(angle>90){
//             angle1 = 180-angle;
//         }else{
//             angle1 = angle;
//         }
//         //两直线交点到点到直线映射点的距离
//         var lineLen = length/Math.tan((angle1/180)*Math.PI);
//         var x1 = Math.cos(Math.atan(Math.abs(k)))*lineLen;
//         var y1 = Math.sin(Math.atan(Math.abs(k)))*lineLen;
//         var point1 = [];
//         var point2 = [];
//         var pointNum = 1;
//         //对直线斜率进行分类考虑
//         if(k>0){
//             point1 = [onepoint[0]+x1,onepoint[1]+y1];
//             point2 = [onepoint[0]-x1,onepoint[1]-y1];
//         }else if(k<0){
//             point1 = [onepoint[0]+x1,onepoint[1]-y1];
//             point2 = [onepoint[0]-x1,onepoint[1]+y1];
//         }else{
//             pointNum = 0;
//             point1 = [onepoint[0]+x1,onepoint[1]];
//             point2 = [onepoint[0]-x1,onepoint[1]];
//         }
//         //对点到直线教的进行考虑
//         if(angle>90){
//             if((point1[pointNum]-onepoint[pointNum])*(line[1][pointNum]-line[0][pointNum])>0){
//                 twopoint =  point1;
//             }else{
//                 twopoint =  point2;
//             }
//         }else{
//             if((point1[pointNum]-onepoint[pointNum])*(line[1][pointNum]-line[0][pointNum])<0){
//                 twopoint =   point1;
//             }else{
//                 twopoint =  point2;
//             }
//         }
//
//     }
//     return twopoint;
// }
// console.log('角度');
// console.log(getLinePoint([[0,10],[0,-10]],[10,0],135).toString());
// //通过两点连线获取两个矩形 isIn 是否外接
// function getPolygonsByLine(line,height,isIn) {
//     var x1 = line[0][0];
//     var y1 = line[0][1];
//     var x2 = line[1][0];
//     var y2 = line[1][1];
//     var point10 = [];
//     var point11 = [];
//     var point20 = [];
//     var point21 = [];
//     var x;
//     var y;
//     var kLine;
//     if(y2 == y1){
//         y=1*height;x=0*height;
//     }else if(x2 == x1){
//         y=0*height;x=1*height;
//     }else{
//         kLine = (y2-y1)/(x2-x1);
//         var angle = Math.atan(Math.abs(kLine));
//         y = Math.cos(angle)*height;
//         x = Math.sin(angle)*height;
//     }
//     var xb = x2-x1;
//     var yb = y2-y1;
//     if(xb<0){
//         y = -y;
//     }
//     if(yb>0){
//         x = -x;
//     }
//     point10 = [x1+x,y1+y];
//     point11 = [x2+x,y2+y];
//     point20 = [x1-x,y1-y];
//     point21 = [x2-x,y2-y];
//    if(isIn == false){
//        return [[line[0],point10,point11,line[1],line[0]],[line[0],point20,point21,line[1],line[0]]];
//    }else{
//        var minx = Math.min.apply(null,[line[0][0],point10[0],point11[0],line[1][0]]);
//        var maxx = Math.max.apply(null,[line[0][0],point10[0],point11[0],line[1][0]]);
//        var miny = Math.min.apply(null,[line[0][1],point10[1],point11[1],line[1][1]]);
//        var maxy = Math.max.apply(null,[line[0][1],point10[1],point11[1],line[1][1]]);
//        var minx1 = Math.min.apply(null,[line[0][0],point20[0],point21[0],line[1][0]]);
//        var maxx1 = Math.max.apply(null,[line[0][0],point20[0],point21[0],line[1][0]]);
//        var miny1 = Math.min.apply(null,[line[0][1],point20[1],point21[1],line[1][1]]);
//        var maxy1 = Math.max.apply(null,[line[0][1],point20[1],point21[1],line[1][1]]);
//        return [[[minx,maxy],[maxx,maxy],[maxx,miny],[minx,miny],[minx,maxy]],
//            [[minx1,maxy1],[maxx1,maxy1],[maxx1,miny1],[minx1,miny1],[minx1,maxy1]]];
//
//    }
// }
//
// console.log('输出矩形');
// console.log(getPolygonsByLine([[13,-11],[-3,9]],10,false));
// //获取多点线段扩展矩形左右两个
// function getPolygonsBylines(line,height) {
//     //存放线两侧的点集合
//     var line1 = [];
//     var line2 = [];
//     for(var i =0;i<line.length-1;i++){
//        var polygons = getPolygonsByLine([line[i],line[i+1]],height,false);
//         line1.push(polygons[0][1]);
//         line1.push(polygons[0][2]);
//         line2.push(polygons[1][1]);
//         line2.push(polygons[1][2]);
//     }
//     //线两侧点计算连接
//     var line3 = [];
//     var line4 = [];
//     line3.push(line1[0]);
//     line4.push(line2[0]);
//     for(var i =0;i<line1.length/2-1;i++){
//         var point1 =  getMeetPoint([line1[2*i],line1[2*i+1]],[line1[2*i+2],line1[2*i+3]]);
//         var point2 =  getMeetPoint([line2[2*i],line2[2*i+1]],[line2[2*i+2],line2[2*i+3]]);
//         line3.push(point1);
//         line4.push(point2);
//     }
//     line3.push(line1[line1.length-1]);
//     line4.push(line2[line2.length-1]);
//     var polygon1 = [];
//     var polygon2 = [];
//     for(var i = 0;i<line.length;i++){
//         polygon1.push(line[i]);
//         polygon2.push(line[i]);
//     }
//     for(var i = 0;i<line3.length;i++){
//         polygon1.push(line3[line3.length-i-1]);
//         polygon2.push(line4[line4.length-i-1]);
//     }
//     polygon1.push(line[0]);
//     polygon2.push(line[0]);
//     return [polygon1,polygon2];
// }
// var stArr = [];
// console.log(getPolygonsBylines([[20,10],[10,10],[0,20],[-10,10],[-10,-10],[0,-20],[10,-10],[20,-10],[20,0],[25,-3]],2));
// var polygon = blmol.marker.createLine('pol'+i,getPolygonsBylines([[20,10],[10,10],[0,20],[-10,10],[-10,-10],[0,-20],[10,-10],[20,-10],[20,0],[25,-3]],2)[0]);
// var polygon1 = blmol.marker.createLine('pol'+i,getPolygonsBylines([[20,10],[10,10],[0,20],[-10,10],[-10,-10],[0,-20],[10,-10],[20,-10],[20,0],[25,-3]],2)[1]);
// polygon = blmol.marker.createLine('88',[[20,8],[9.17157,8],[-0,17.1716],[-8,9.17157],[-8,-9.17157],[-0,-17.1716],[9.1715,-8],[18,-8],[18,3.53238],[26.029,-1.28501],[25,-3],[20,0],[20,0],[20,-10],[10,-10],[0,-20],[-10,-10],[-10,10],[0,20],[10,10],[20,10],[20,8]]);
//
// //stArr.push(polygon);
//
// //stArr.push(polygon1);
//
// var layerarr = blmol.layer.createVectorLayer('arr', 0, 28, stArr);
