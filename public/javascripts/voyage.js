
/**
 * Created by Truth on 2017/7/12.
 *
 */

// 如果还是同一个航线就不再请求(mmsi#ts1#ts2)
let old_route = '';

/**
 * 由首位两点确定图标的方向
 * @param start
 * @param end
 */
function getRotation(start, end){
    let dx = end[0] - start[0];
    let dy = end[1] - start[1];
    return Math.atan2(dy, dx);
}

/**
 * 根据ais_info中的ETA获得预计到达时间
 * @param ETA
 */
function getArrivalTime(ETA) {
    let month = Math.floor(ETA/65536.0);  //月
    let day = Math.floor((ETA - month * 65536)/2048.0);   //日
    let hour = Math.floor((ETA - month * 65536 - day * 2048)/64.0);  //小时
    let min = ETA - month * 65536 - day * 2048 - hour * 64;     //分
    if(month<=0||month>=13)
        return "~";  //无效的ETA
    let current_time = new Date();
    let year = current_time.getFullYear();
    let current_month = current_time.getMonth() + 1;
    if(current_month > month){
        year = year + 1;
    }
    return year + "-" + (month < 10 ? '0' + month:month) + "-" + (day < 10? '0' + day: day) +
        " " + (hour < 10? '0' + hour: hour) + ":" + (min < 10? '0' + min: min)
}

function getShipList() {
    $.ajax({
        // async: false,
        // url: OL_Action_Root + "/icon/getInfo",
        url: "/voyage/getShipInfo",
        dataType: 'json',
        cache: false,
        timeout: 50000,
        type: 'POST',
        success: function (data) {
            let res = data;
            // 返回的代码
            // 成功获取数据,数据结构<MMSI, ENNAME>
            if (res[0] === '200') {
                console.log('成功获取信息');
                let sendData = res[1];
                let shipList = JSON.parse(sendData);
                // console.log(shipList);
                let shipListStr = '';
                console.log(shipList.length);
                $(".ship_list_content").empty();
                for(let i = 0; i< shipList.length; i++){
                    let ele = shipList[i];
                    shipListStr += '<li><span>' + ele.ENNAME + '</span><span>' + ele.MMSI + '</span></li>'
                }
                $(".ship_list_content").append(shipListStr);
                // 列表元素点击事件
                $('.ship_list_content li').off('click').on('click',function(){
                    $(".ship_list_content li").removeClass('active'); // 去掉单击后的属性
                    let MMSI = $(this).children('span:last-child').text();
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
        url: "/voyage/getBasicRouteInfo",
        dataType: 'json',
        cache: false,
        timeout: 5000,
        type: 'GET',
        success: function (data) {
            let res = data;
            // 返回的代码
            //
            // 成功获取数据,数据结构<MMSI, startPort, endPort, TS1, TS2>
            if (res[0] === '200') {
                console.log('成功获取信息');
                // result <TS1, TS2, startTime, endTime, startingPort, destinationPort>
                let result = JSON.parse(res[1]);
                let routeListInfo = '';
                console.log(result.length);
                $(".oneShip_routeList").empty();
                for(let i = 0; i < result.length; i++){
                    let ele = result[i];
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
                    let TS1 = $(this).attr("ts1");
                    let TS2 = $(this).attr("ts2");
                    let route = MMSI + "#" + TS1 + "#" + TS2;
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
    if(stopTime === null || stopTime === 0 || stopTime === undefined){
        stopTime = new Date().getTime().toString().slice(0, 10);
        console.log(stopTime);
    }
    console.log(startTime + "," + stopTime);
    route.getSource().clear(); // 初始化清空
    let mileage = 0;
    let voyage_info_ul = $('.oneVoyageInfo>ul');
    $.ajax({
        data: {MMSI: MMSI, startTime: startTime, stopTime: stopTime},
        url: "/voyage/getDetailRouteInfo",
        dataType: 'json',
        cache: false,
        timeout: 5000000,
        type: 'GET',
        beforeSend: function () {
            voyage_info_ul.css("background", 'url("/images/ajax-loader.gif") no-repeat center');
        },
        success: function (data) {
            let res = data;
            // 返回的代码
            // 成功获取数据,数据结构<MMSI, EName>
            if (res[0] === '200') {
                console.log('成功获取信息');
                // 先清空一会
                let sendData = res[1];
                let pointList = JSON.parse(sendData);
                let lonLatInfo = pointList['lat_lon_info'];
                let ETA = pointList['ETA'];
                let arrivalPort = pointList['ArrivalPort'];
                let lonLatList = [];
                let num = lonLatInfo.length;
                // console.log('点数为:' + num );
                let arrow_features = [];
                let last_lon;
                let last_lat;
                let last_time;
                for(let i = 0; i < num; i++){
                    let ele = lonLatInfo[i];
                    let lat_lon = WGS84transformer(parseFloat(ele[1]), parseFloat(ele[0]));
                    let lon = lat_lon[1];
                    let lat = lat_lon[0];
                    let time = parseInt(ele[2]);
                    // 计算航程里程
                    let sub_mileage = 0;
                    let sub_speed = 0;
                    if( i > 0){
                        sub_mileage = getGreatCircleDistance(last_lon, last_lat, lon, lat) / 1.85200;
                        sub_speed = sub_mileage  /((time - last_time) / 3600)
                    }
                    // lonLatList.push(ol.proj.fromLonLat([lon, lat]));
                    // mileage += sub_mileage;
                    if(sub_speed < 100){
                        lonLatList.push(ol.proj.fromLonLat([lon, lat]));
                        mileage += sub_mileage;
                    }
                    last_lon = lon;
                    last_lat = lat;
                    last_time = time;
                    // lonLatInfo[i] = ol.proj.fromLonLat([lon, lat]);
                    // mileage += sub_mileage
                    // last_lon = lon;
                    // last_lat = lat;
                    // last_time = time;
                }
                let sailTime = parseInt(info_li.eq(6).attr('time')) / 3600;
                /* 画航迹 */
                let feature = new ol.Feature({
                    id: MMSI,
                    geometry: new ol.geom.LineString(lonLatList)
                    // geometry: new ol.geom.LineString(lonLatInfo)
                });
                feature.setStyle(contour_style);
                route.getSource().addFeature(feature);
                // 将箭头加入
                // 添加箭头
                for(let i =0; i< lonLatList.length; i++) {
                    if (i > 0 && i % 80 === 0) {
                    // if( i > 10){
                        let start = lonLatList[i - 10];
                        let end = lonLatList[i];
                        let rotation = getRotation(start, end);
                        let arrow_feature = new ol.Feature({
                            geometry: new ol.geom.Point(end)
                        });
                        arrow_feature.setStyle(arrow_style(rotation));
                        arrow_features.push(arrow_feature)
                    }
                }
                route.getSource().addFeatures(arrow_features);
                /* 开始图标和结束图标 */
                // 开始点
                let start_point = new ol.Feature({
                    geometry: new ol.geom.Point(lonLatList[0])
                    // geometry: new ol.geom.Point(lonLatInfo[0])
                });
                // 结束点
                let end_point = new ol.Feature({
                    geometry: new ol.geom.Point(lonLatList[lonLatList.length - 1])
                    // geometry: new ol.geom.Point(lonLatInfo[num - 1])
                });
                start_point.setStyle(start_style);
                end_point.setStyle(end_style);
                route.getSource().addFeatures([start_point, end_point]);
                let view = map.getView();
                let pan = ol.animation.pan({
                    //动画持续时间
                    duration: 2000,
                    source:view.getCenter()
                });
                //在地图渲染之前执行平移动画
                map.beforeRender(pan);
                // 放大动画
                let zoom = ol.animation.zoom({
                    duration: 2000,
                    resolution: view.getResolution()
                });
                map.beforeRender(zoom);
                view.setCenter(lonLatInfo[0]);
                view.setZoom(2);
                /* 填充对应信息 */
                let arrivalTimeEst = getArrivalTime(ETA);
                let arrivalTimestamp = Date.parse(new Date(arrivalTimeEst)) / 1000;
                let arrival_ele = info_li.eq(5).children('input');
                let arrivalTime_ele = arrival_ele.next().next();
                arrival_ele.css('color', 'white');
                arrivalTime_ele.css('color', 'white');
                if(arrivalTimestamp > startTime){
                    // 到达港
                    if(arrival_ele.val() === '~' && arrivalPort !== ''){
                        arrival_ele.val(arrivalPort);
                        arrival_ele.css('color', 'orange');
                    }
                    if(arrivalTime_ele.text() === '~' && ETA !== ''){
                        arrivalTime_ele.text(arrivalTimeEst);
                        arrivalTime_ele.css('color', 'orange');
                    }
                }
                info_li.eq(7).text('航速：' + (mileage / sailTime).toFixed(4) +'kts'); // 航速
                info_li.eq(8).text('航程：' + mileage.toFixed(4) + "nm"); // 航程
            }
        },
        error: function (data, status, e) {
            console.log(e);
        },
        complete: function () {
            console.log("加载结束");
            $('.oneVoyageInfo>ul>li').show();
            voyage_info_ul.css("background", "");
        // shipList.css("background", ""); // 清除背景
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
    if($(this).val()!== '') {
        let shipStr = '';
        let mmsiStr = '';
        for (let i = 0; i < $('.ship_list_content>li').length; i++) {
            shipStr = $('.ship_list_content>li').eq(i).children('span:first-child').text();
            mmsiStr = $('.ship_list_content>li').eq(i).children('span:last-child').text();
            if (shipStr.indexOf($(this).val()) == -1 && mmsiStr.indexOf($(this).val()) == -1) {
                $('.ship_list_content>li').eq(i).css('display', 'none');
            }
        }
    }
});

//单个船舶航线列表显示
let oneShipListShow = false;
$('.oneShip_listShow_btn').click(function(){
    if(!oneShipListShow){
        $("#route_list").animate({width: "700px"},300);
    }else{
        $("#route_list").animate({width: "300px"},300);
    }
    oneShipListShow = !oneShipListShow;
});