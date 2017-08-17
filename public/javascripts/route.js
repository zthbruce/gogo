
/**
 * Created by Truth on 2017/7/12.
 */

/**
 * 由首位两点确定图标的方向
 * @param start
 * @param end
 */
function getRotation(start, end){
    var dx = end[0] - start[0];
    var dy = end[1] - start[1];
    return Math.atan2(dy, dx);
}


// 如果还是同一个航线就不再请求(mmsi#ts1#ts2)
var old_route = '';
function getShipList() {
    $.ajax({
        // async: false,
        // url: OL_Action_Root + "/icon/getInfo",
        url: "/route/getShipInfo",
        dataType: 'json',
        cache: false,
        timeout: 50000,
        type: 'POST',
        success: function (data) {
            var res = data;
            // 返回的代码
            // 成功获取数据,数据结构<MMSI, ENNAME>
            if (res[0] === '200') {
                console.log('成功获取信息');
                var sendData = res[1];
                var shipList = JSON.parse(sendData);
                // console.log(shipList);
                var shipListStr = '';
                console.log(shipList.length);
                $(".ship_list_content").empty();
                for(var i = 0; i< shipList.length; i++){
                    var ele = shipList[i];
                    shipListStr += '<li><span>' + ele.ENNAME + '</span><span>' + ele.MMSI + '</span></li>'
                }
                $(".ship_list_content").append(shipListStr);
                // 列表元素点击事件
                $('.ship_list_content li').off('click').on('click',function(){
                    $(".ship_list_content li").removeClass('active'); // 去掉单击后的属性
                    var MMSI = $(this).children('span:last-child').text();
                    getBasicRouteList(MMSI);
                    $(this).addClass('active'); // 增加单击后的属性
                });

                // $('.ship_list_content li').hover(
                //     function () {
                //         $(this).css({'color':'#fff', 'background':'#2EB1EA'});
                //     },
                //     function () {
                //         $(this).css({'color':'#060205', 'background':'#ffffff'});
                //     }
                // );
            }
        },
        error: function (data, status, e) {
            console.log(e);
        }
    })
}

/**
 * 根据MMSI显示信息列表
 * 展开右边弹出框
 * @param MMSI
 */
function getBasicRouteList(MMSI) {
    $.ajax({
        data: {MMSI: MMSI},
        url: "/route/getBasicRouteInfo",
        dataType: 'json',
        cache: false,
        timeout: 5000,
        type: 'GET',
        success: function (data) {
            var res = data;
            // 返回的代码
            //
            // 成功获取数据,数据结构<MMSI, startPort, endPort, TS1, TS2>
            if (res[0] === '200') {
                console.log('成功获取信息');
                // result <TS1, TS2, startTime, endTime, startingPort, destinationPort>
                var result = JSON.parse(res[1]);
                var routeListInfo = '';
                console.log(result.length);
                $(".oneShip_routeList").empty();
                for(var i = 0; i < result.length; i++){
                    var ele = result[i];
                    routeListInfo += '<li ts1 = ' + ele.TS1 + ' ts2 = ' + ele.TS2 + '><span>' + i + '</span><span>' + ele.startTime + '</span><span>' + ele.endTime+ '</span><span>' +
                        ele.StartingPort + '</span><span>' + ele.DestinationPort + '</span></li>'
                }
                // console.log(routeListInfo);
                $(".oneShip_routeList").append(routeListInfo);
                // 如果没有展开就展开
                if(!oneShipListShow) {
                    $("#route_list").animate({width: "700px"}, 300);
                    oneShipListShow = !oneShipListShow;
                }
                // 航线列表元素点击事件
                $('.oneShip_routeList li').off('click').on('click',function(){
                    var TS1 = $(this).attr("ts1");
                    var TS2 = $(this).attr("ts2");
                    var route = MMSI + "#" + TS1 + "#" + TS2;
                    console.log(route);
                    if( old_route !== route ){
                        $('.oneShip_routeList li').removeClass('active');
                        old_route = route;
                        getDetailRoute(MMSI, TS1, TS2);
                        $("#route_list").animate({width: "300px"},300);
                        oneShipListShow = false;
                        $(this).addClass('active');
                    }
                });
            }
        },
        error: function (data, status, e) {
            console.log(e);
        }
    })
}

/**
 * 获取具体的某条航线
 * @param MMSI
 * @param startTime
 * @param stopTime
 */
function getDetailRoute(MMSI, startTime, stopTime) {
    $.ajax({
        data: {MMSI: MMSI, startTime: startTime, stopTime: stopTime},
        url: "/route/getDetailRouteInfo",
        dataType: 'json',
        cache: false,
        timeout: 5000,
        type: 'GET',
        success: function (data) {
            var res = data;
            // 返回的代码
            // 成功获取数据,数据结构<MMSI, EName>
            if (res[0] === '200') {
                console.log('成功获取信息');
                // 先清空一会
                route.getSource().clear();
                var sendData = res[1];
                var pointList = JSON.parse(sendData);
                var lonLatInfo = pointList['lat_lon_info'];
                var num = lonLatInfo.length;
                var arrow_features = [];
                for(var i = 0; i < num; i++){
                    var ele = lonLatInfo[i];
                    lonLatInfo[i] = ol.proj.fromLonLat([parseFloat(ele[0]), parseFloat(ele[1])]);
                    if(i > 0 && i % 30 === 0){
                        var start = lonLatInfo[i - 10];
                        var end= lonLatInfo[i];
                        var rotation = getRotation(start, end);
                        var arrow_feature = new ol.Feature({
                            geometry: new ol.geom.Point(end)
                        });
                        arrow_feature.setStyle(arrow_style(rotation));
                        arrow_features.push(arrow_feature)
                    }
                }
                var feature = new ol.Feature({
                    id: MMSI,
                    geometry: new ol.geom.LineString(lonLatInfo)
                });
                feature.setStyle(contour_style);
                route.getSource().addFeature(feature);
                // 将箭头加入
                route.getSource().addFeatures(arrow_features);
                // 开始点
                var start_point = new ol.Feature({
                    geometry: new ol.geom.Point(lonLatInfo[0])
                });
                // 结束点
                var end_point = new ol.Feature({
                    geometry: new ol.geom.Point(lonLatInfo[num - 1])
                });
                start_point.setStyle(start_style);
                end_point.setStyle(end_style);
                // start_end.getSource().addFeatures([start_point, end_point]);
                route.getSource().addFeatures([start_point, end_point]);
                map.getView().setCenter(lonLatInfo[0])
            }
        },
        error: function (data, status, e) {
            console.log(e);
        }
    })
}

/**
 * 航线管理
 */
//航线图标单击事件
$('#route_Show .route_Ship_btn').click(function(){
    $("#route_list").animate({
        width: "300px",
        height: "400px",
        top: "140px",
        opacity:'1'
    },500);
    // 获得航船列表
    getShipList();
});

// 关闭按钮
$('#route_list .route_title_offbtn').click(function(){
    $("#route_list").animate({
        width: "0px",
        height: "0px",
        top: "400px",
        opacity:'0'
    },500);
    oneShipListShow = false;
    route.getSource().clear();
    old_route = '';
});

//船名筛选
$('#route_list input').keyup(function(){
    // console.log($(this).val());
    $('.ship_list_content>li').css('display', 'block');
    if($(this).val()!='') {
        var shipStr = '';
        var mmsiStr = '';
        for (var i = 0; i < $('.ship_list_content>li').length; i++) {
            shipStr = $('.ship_list_content>li').eq(i).children('span:first-child').text();
            mmsiStr = $('.ship_list_content>li').eq(i).children('span:last-child').text();
            if (shipStr.indexOf($(this).val()) == -1 && mmsiStr.indexOf($(this).val()) == -1) {
                $('.ship_list_content>li').eq(i).css('display', 'none');
            }
        }
    }
});

//单个船舶航线列表显示
var oneShipListShow = false;
$('.oneShip_listShow_btn').click(function(){
    if(!oneShipListShow){
        $("#route_list").animate({width: "700px"},300);
    }else{
        $("#route_list").animate({width: "300px"},300);
    }
    oneShipListShow = !oneShipListShow;
});