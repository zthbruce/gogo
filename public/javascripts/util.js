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
    // for(var i = 0; i< len; i++){
    //     port = portList[i];
    //     port_lon = port.LongitudeNumeric;
    //     port_lat = port.LatitudeNumeric;
    //     distanceList[i] = {index: i, distance: getDistance(lon, lat, port_lon, port_lat)}
    // }
    // var i = 0;
    for(var key in portList){
        port = portList[key];
        port_lon = port.LongitudeNumeric;
        port_lat = port.LatitudeNumeric;
        distanceList.push({PortID: key, distance: getDistance(lon, lat, port_lon, port_lat)});
        // i++;
    }
    // sort by distance
    distanceList.sort(function (x, y) {
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
 * 地图图标单击事件入口
 */
var anchStatus = false;
mapImgClick = blmol.bind.addOnClickListener(map, function (map, coordinate, feature, evt) {
    console.log(anchStatus);
    if (feature.length !== 0) {
        if (feature[0].get('port_id') !== undefined) {
            console.log(feature[0].get('port_id'));
            var portId = feature[0].get('port_id');
            reqOnePortBasicInfo(portId);
        } else if (feature[0].get('cluster_id') !== undefined || feature[0].get('anchKey') !== undefined) {
            // console.log(feature[0].get('cluster_id'));
            // console.log(feature[0].get('type'));
            var type = feature[0].get('type');
            var lon = feature[0].get('lon');
            var lat = feature[0].get('lat');
            // 如果不是anchStatus状态
            if (!anchStatus) {
                changeBerthSaveButton(false); // 初始化泊位保存状态
                // 初始化锚地保存状态
                // 锚地管理弹出框, 不管是原生锚地区域还是锚地聚类, type都设为0, 表示锚地
                if (type === 0) {
                    $("#newAnch").fadeIn("normal");
                    anchStatus = !anchStatus;
                    var anchKey = feature[0].get('anchKey') === undefined ? "" : feature[0].get('anchKey');
                    console.log(anchKey);
                    changeAnchSaveButton(false);
                    feature[0].setId("current");
                    // feature[0]['anchKey']  = '';
                    getAnchInfo(anchKey, lon, lat);
                }
                // 泊位管理弹出框
                if (type === 1) {
                    var clusterId = feature[0].get('cluster_id');
                    // 弹出泊位的弹出框
                    $('#newBerth').fadeIn("normal");
                    // 请求码头整体信息
                    getPierInfo(clusterId, lon, lat);
                }
            }
            // 如果
            else{
                var clusterId = feature[0].get('cluster_id');
                var anchKey = feature[0].get('anchKey') === undefined ? "" : feature[0].get('anchKey');
                console.log(anchKey);
                // 如果点击旧锚地图标, 将其加入选择列表
                if( type === 0){
                    var number = parseInt($(".selected_LonLat>li:last-child>span:first-child").text()) + 1;
                    number = isNaN(number) ? 1: number;
                    var normalLonLatStr = transLonLatToNormal(lon, lat);
                    var chooseStr = '<li clusterId=' + clusterId + ' lon=' + lon  + ' lat=' + lat +'><span>' + number + '</span><span class = "anch_belong"></span><span>' + normalLonLatStr + '</span></li>';
                    $(".selected_LonLat").append(chooseStr);
                    changeAnchSaveButton(true);
                    // 更新轮廓点
                    updateLocationList();
                    // 根据当前所选点，画出轮廓线
                    writeContourLine(locationList);
                }
            }
        }
    }
});


