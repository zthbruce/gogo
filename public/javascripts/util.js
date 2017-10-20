/**
 * 公用的函数和接口
 * Created by Truth on 2017/7/27.
 */

var EARTH_RADIUS = 6378.1370;    //地球的半径(Km)
var PI = Math.PI;

/**
 * 根据经纬度获得两点之间的数值距离
 * @param lon1
 * @param lat1
 * @param lon2
 * @param lat2
 * @returns {number}
 */
function getDistance(lon1, lat1, lon2, lat2){
    return Math.sqrt((lon1 - lon2) * (lon1 - lon2) + (lat1 - lat2) * (lat1 - lat2))
}

/**
 * 将角度转换为弧度
 * @param d
 * @returns {number}
 */
function getRad(d){
    return d * PI / 180.0;
}

/**
 * 计算大圆航线距离
 * @param lon1
 * @param lat1
 * @param lon2
 * @param lat2
 * @returns {number} 单位km
 */
function getGreatCircleDistance(lon1, lat1, lon2, lat2){
    var radLat1 = getRad(lat1);
    var radLat2 = getRad(lat2);
    var a = radLat1 - radLat2;
    var b = getRad(lon1) - getRad(lon2);
    var s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
    s = s*EARTH_RADIUS;
    s = Math.round(s*10000)/10000.0;
    return s;
}

/**
 * 根据当前点坐标获得最近的港口列表
 * 锚地和泊位都有这个需求
 * @param lon
 * @param lat
 * @param portList
 * @param n 最近的n个港口
 */
function getClosePortList(lon, lat, portList, n){
    var len = portList.length;
    var distanceList = [];
    var port;
    var port_lon;
    var port_lat;
    for(var key in portList){
        port = portList[key];
        port_lon = port.LongitudeNumeric;
        port_lat = port.LatitudeNumeric;
        distanceList.push({PortID: key, distance: getDistance(lon, lat, port_lon, port_lat)});
        // i++;
    }
    // sort by distance
    distanceList.sort(function (x, y) {
        if(isNaN(x.distance)){
            return 1
        }
        if(isNaN(y.distance)){
            return -1
        }
        return x.distance - y.distance
    });

    if(len < n){
        n = len;
    }
    var closePortList = new Array(n);
    for(var j = 0; j < n; j++){
        var portID = distanceList[j].PortID;
        port = portList[portID];
        closePortList[j] = {PortID : portID, ENName:port.ENName, CNName: port.CNName}
    }
    return closePortList
}


/**
 * 根据时间生成码头的ID
 * @returns {string}
 */
function generateNewPierKey(){
    //新建码头key值
    var nowdate = new Date();
    var nowday = nowdate.toLocaleDateString();
    // console.log(date);
    // console.log(nowdate);
    var nowDayArr = nowday.split('/');
    nowDayArr[1] = nowDayArr[1].length<2 ? '0'+nowDayArr[1]:nowDayArr[1];
    nowDayArr[2] = nowDayArr[2].length<2 ? '0'+nowDayArr[2]:nowDayArr[2];
    var nowDayStr = nowDayArr.join('');
    var nowdate_hours=nowdate.getHours();
    var nowdate_minutes=nowdate.getMinutes();
    var nowdate_seconds=nowdate.getSeconds();
    nowdate_hours = nowdate_hours<10?'0'+nowdate_hours:nowdate_hours;
    nowdate_minutes = nowdate_minutes<10?'0'+nowdate_minutes:nowdate_minutes;
    nowdate_seconds = nowdate_seconds<10?'0'+nowdate_seconds:nowdate_seconds;
    nowDayStr = nowDayStr + nowdate_hours + nowdate_minutes + nowdate_seconds;
    console.log(nowDayStr);
    return nowDayStr;
}

/**
 * 将数值转化为度分秒
 * @param value
 */
function transLonLat(value) {
    var d1 = parseInt(value); // °
    var d2 = (Math.abs(value - d1) * 60).toFixed(4); // ' 含小数
    // var d3 = parseInt(((value - d1) * 60 - d1) * 60);
    return [d1, d2]
}


/**
 * 将经纬度转化为常用写法
 * @param lat
 * @param lon
 */
function transLonLatToNormal(lat, lon) {
    var latitudeDetail = transLonLat(lat);
    var latitude = latitudeDetail[0] > 0 ? latitudeDetail[0] + "°" + latitudeDetail[1] + "'N": Math.abs(latitudeDetail[0]) + "°" + latitudeDetail[1] + "'S";
    var longitudeDetail = transLonLat(lon);
    var longitude = longitudeDetail[0] > 0 ? longitudeDetail[0] + "°" + longitudeDetail[1] + "'E": Math.abs(longitudeDetail[0]) + "°" + longitudeDetail[1] + "'W";
    return [latitude, longitude]
}

/**
 * 根据保存状态，改变按钮状态
 * @param saveStatus
 */
function changeBerthSaveButton(saveStatus) {
    if(saveStatus){
        $('#berth_save').removeAttr("style");
        $('#berth_save').removeAttr("disabled")
    }
    else{
        $('#berth_save').attr("style", "background:#ccc");
        $('#berth_save').attr("disabled", "disabled")
    }
}







/*********************************分割线*******************************************************************************/
/**
 * 地图图标单击事件入口(真实入口)
 */
var routeStatus = false;
var old_feature;
var port_ul;
var status;
mapImgClick = blmol.bind.addOnClickListener(map, function (map, coordinate, feature, evt) {
    if (feature.length !== 0) {
        var current_feature =  feature[0];
        if (current_feature.get('port_id') !== undefined) {
            if(routeStatus){
                // 如果是已选的话，点击标为未选
                var portID = current_feature.get('port_id');
                if(port_type === 0){
                    if(routeId[0] === "T"){
                        port_ul = $("#routeInfo .routeStartPort_Select .StartEndPort_List");
                    }
                    else{
                        port_ul = $("#LeaseRouteInfo .routeStartPort_Select .StartEndPort_List");
                    }
                }
                else{
                    if(routeId[0] === "T") {
                        port_ul = $("#routeInfo .routeEndPort_Select .StartEndPort_List");
                    }
                    else{
                        port_ul = $("#LeaseRouteInfo .routeEndPort_Select .StartEndPort_List");
                    }
                }
                if(current_feature.get("type") === "choosed"){
                    // var portList = port_ul.children("li");
                    var current_li = port_ul.find("[portid=" + portID +"]");
                    // for(var j=0; j< portList.length; j++) {
                    //     var li = portList.eq(j);
                    //     if(li.attr('portID') === portID){
                    //         current_li = li;
                    //     }
                    // }
                    removePort(current_li, current_feature);
                }
                // 如果是未选的话，点击标为选择
                else if(current_feature.get("type") === "toChoose"){
                    console.log("增加");
                    // 将港口高亮
                    current_feature.set("type", "choosed");
                    current_feature.setStyle(port_yes);
                    // 增加港口
                    var port = AllPortBasicList[portID];
                    var port_li =  '<li portID='+ portID+'><span>'+ port.ENName + '</span><i class = "close"></i></li>';
                    port_ul.append(port_li);
                    // 将对应的港口下的泊位高亮
                    showSelectedBerth([portID])
                }
            }
            // 普通模式
            else{
                // 点击港口图标
                console.log(current_feature.get('port_id'));
                var portId = current_feature.get('port_id');
                reqOnePortBasicInfo(portId);
            }
        }
        // 点击锚地的图标
        else if (current_feature.get('cluster_id') !== undefined || current_feature.get('anchKey') !== undefined) {
            var type = current_feature.get('type');
            var lon = current_feature.get('lon');
            var lat = current_feature.get('lat');
            var staticAreaKey = current_feature.get("cluster_id");
            console.log("静止区域ID: " + staticAreaKey);
            // 锚地状态
            if(anchStatus){
                var id = current_feature.get("id");
                // 当属于本锚地时，点击之后取消选定
                if(id === "choosed"){
                    // 获取行号
                    var number = current_feature.get("number");
                    console.log("行号" + number + "将被取消");
                    var ele = $(".selected_LonLat>li:eq(" + (number - 1) + ")");
                    var lon = parseFloat(ele.attr("lon"));
                    var lat = parseFloat(ele.attr("lat"));
                    var clusterId = ele.attr("clusterId"); // 不重新赋予新的
                    // var number = parseInt($(".unselected_LonLat>li:last-child>span:first-child").text()) + 1;
                    // number = isNaN(number) ? 1: number;
                    // var normalLonLatStr = $(this).next().text();
                    // var chooseStr = '<li clusterId=' + ele.attr("clusterId") + ' lon=' + ele.attr("lon")  + ' lat=' + ele.attr("lat") +'><span>' + number + '</span><span class = "anch_notBelong"></span><span>' + normalLonLatStr + '</span></li>';
                    // $(".unselected_LonLat").append(chooseStr);
                    // 移除本行
                    // var nextDomList = ele.nextAll();
                    // for(var i = 0; i < nextDomList.length; i++){
                    //     var num = parseInt(nextDomList.eq(i).children("span:first-child").text()) -1;
                    //     nextDomList.eq(i).children("span:first-child").text(num);
                    // }
                    ele.remove();
                    updateLocationList();
                    // 根据当前点画出轮廓线
                    // current.getSource().removeFeature(current_feature); // 将本标签删除
                    writeContourLine(locationList);
                    // 将下一层进行还原
                    // if(feature[1] !== undefined){
                    //     var icon_feature = feature[1];
                    //     console.log(icon_feature);
                    //     icon_feature.setStyle(park_style[0])
                    // }
                    // 将删除的点重新拿出来, 显示在地图上, 以备选择, 目前没有保留clusterID这个字段
                    // var feature = new ol.Feature({
                    //     'lon' : lon,
                    //     'lat': lat,
                    //     'name': "park_icon",
                    //     'type': 0,
                    //     'cluster_id' : clusterId,
                    //     geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
                    // });
                    // feature.setStyle(park_style[0]); // 还原成锚地图标
                    // icon.getSource().addFeature(feature);
                    changeAnchSaveButton(true);
                }
                else{
                    // 如果不属于本锚地, 点击之后标为选定
                    var clusterId = current_feature.get('cluster_id');
                    var anchKey = current_feature.get('anchKey') === undefined ? "" : current_feature.get('anchKey');
                    console.log(anchKey);
                    // 如果点击旧锚地图标, 将其加入选择列表
                    if (type === 0 && clusterId !== undefined) {
                        console.log("加入");
                        var number = parseInt($(".selected_LonLat>li:last-child>span:first-child").text()) + 1;
                        number = isNaN(number) ? 1 : number;
                        var normalLonLatStr = transLonLatToNormal(lon, lat);
                        console.log(clusterId);
                        var chooseStr = '<li clusterId= "' + clusterId +  '" lon=' + lon + ' lat=' + lat + '><span>' + number + '</span><span class = "anch_belong"></span><span>' + normalLonLatStr + '</span></li>';
                        // console.log(chooseStr);
                        // 添加到最后一行
                        $(".selected_LonLat").append(chooseStr);
                        // 更新轮廓点
                        updateLocationList();
                        // console.log(locationList);
                        // 根据当前所选点，画出轮廓线
                        writeContourLine(locationList);
                        changeAnchSaveButton(true);
                    }
                }
            }
            //
            // else if(routeStatus){
                // var zoom =  blmol.operation.getZoom(map);
                // // 如果zoom >= 10 且点击的是泊位图标
                // if(zoom >= 10 && type === 1){
                //     var id = current_feature.getId();
                //     console.log(id);
                //     // 如果当前是选择的，那么删除该选择的区域
                //     if(id === "choosed"){
                //         console.log("删去");
                //         // current_feature.setStyle();
                //         current.getSource().removeFeature(current_feature);
                //         // $(".routeStartPort_Select>.StartEndPort_List>li['portID' = " + portID +"]").remove();
                //     }
                //     else{
                //         // 添加该图标
                //         console.log("增加");
                //         // current_feature.setStyle(choosed);
                //         // current_feature.setId("choosed");
                //         // current.getSource().addFeature(current_feature);
                //         // 克隆一下, 当下
                //         feature = current_feature.clone();
                //         feature.setStyle(choosed);
                //         feature.setId("choosed");
                //         current.getSource().addFeature(feature);
                //         // 获取 portID 和 portName
                //         // var port_li =  '<li portID='+ portID+'><span>'+ portName + '</span><i></i></li>';
                //         // $('.add_StartPort').before(port_li)
                //     }
                // }
            // }
            // 原始模式
            else {
                // var status = current_feature.get("status");
                var name = current_feature.get('name');
                console.log(name);
                if (name === 'parkArea') {
                    console.log("here");
                    changeBerthSaveButton(false); // 初始化泊位保存状态
                    // 初始化锚地保存状态
                    // 锚地管理弹出框, 不管是原生锚地区域还是锚地聚类区域, type都设为0, 表示锚地
                    if (type === 0) {
                        // 锚地弹出框
                        $("#newAnch").fadeIn("normal");
                        anchStatus = true; // 表示进入锚地状态
                        var anchKey = current_feature.get('anchKey') === undefined ? "" : current_feature.get('anchKey');
                        console.log(anchKey);
                        changeAnchSaveButton(false);
                        old_feature = current_feature;
                        current_feature.setId("current"); // 将当前的设为current
                        getAnchInfo(anchKey, lon, lat); // 获取信息
                    }
                    // 泊位管理弹出框
                    if (type === 1) {
                        var clusterId = current_feature.get('cluster_id');
                        // 弹出泊位的弹出框
                        $('#newBerth').fadeIn("normal");
                        // 请求码头整体信息
                        getPierInfo(clusterId, lon, lat);
                    }
                }
                // 点击确认按钮
                else{
                    console.log("here");
                    // console.log("here");
                    // if(status===0) {
                    //     status = 1;
                    // }else{
                    //     status = 0;
                    // }
                    // 改变状态
                    // current_feature.set('status', status);
                    // current_feature.setStyle(point_status[status]);
                    // current_fearure.setStyle(point_status[status]);
                    var choosed_ele = $('.oneBerth_info>li [staticAreaKey="' + staticAreaKey + '"]');
                    updateChooseBerth(choosed_ele.parent().prev().children("span"), current_feature); // 更新列表里面对应的信息
                }
            }
        }
    }
});


