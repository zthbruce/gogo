/**
 * Created by Truth on 2017/7/27.
 */

var center = [0, 0];
var range = 0;
var locationList = [];

// var chooseLonLatList = [];
/**
 * 根据经纬度进行钟摆型排序, 以获得锚地区域
 * if x < y return -1
 * if x > y return 1
 * else 0
 * @param x [lon, lat]
 * @param y [lon, lat]
 * @param center
 * @returns {number}
 */
function clockCompare(x, y) {
    var x_lon = x[0];
    var x_lat = x[1];
    var y_lon = y[0];
    var y_lat = y[1];
    var lon_center = center[0];
    var lat_center = center[1];
    if((x_lon - lon_center) >= 0 && (y_lon - lon_center) < 0){
        return -1;
    }
    if((x_lon - lon_center) < 0 && (y_lon - lon_center) >= 0){
        return 1;
    }
    if(x_lon - lon_center === 0 && y_lon - lon_center === 0){
        if(x_lat > y_lat){
            return -1;
        }
        if(x_lat < y_lat){
            return 1;
        }
    }
    // cross product
    var det = (x_lon - lon_center) * (y_lat - lat_center) - (y_lon - lon_center) * (x_lat - lat_center);
    if(det < 0) {
        return -1;
    }
    if(det > 0){
        return 1;
    }

    var d1 = (x_lon - lon_center) * (x_lon - lon_center) + (x_lat - lat_center) * (x_lat - lat_center);
    var d2 = (y_lon - lon_center) * (y_lon - lon_center) + (y_lon - lat_center) * (y_lon - lat_center);
    if(d1 > d2){
        return -1;
    }
    if(d1 < d2){
        return 1;
    }
    return 0
}

/**
 *
 * @param point [lon, lat] 判断点
 * @param vs [[lon, lat], [lon, lat], ...]] 多边形边界点
 * @returns {boolean}
 */
function inside(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];

        var intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

/**
 * 根据输入的部分锚地名来匹配已经存在的锚地名
 * @param anchNameStr
 */
function addAnchName(anchNameStr){
    $.ajax({
        url:'/anch/anchNameSearch',
        type:'get',
        data:{anchNameStr: anchNameStr},
        success: function(data){
            console.log(data);
            $("#anch_name_list").empty();
            if(data[0] === "200"){
                var jsonData = data[1];
                console.log(jsonData.length);
                for(var i=0;i<jsonData.length;i++){
                    var companyName = jsonData[i].Name;
                    var anchKey = jsonData[i].AnchorageKey;
                    var purpose = jsonData[i].Purpose;
                    var des =  jsonData[i].Des;
                    var centerLon =  jsonData[i].centerLon;
                    var centerLat =  jsonData[i].centerLat;
                    // 显示锚地列表
                    $("#anch_name_list").append('<li anchKey= '+ anchKey + ' Purpose=' + purpose + ' Des=' + des + ' centerLon:' + centerLon  + ' centerLat' + centerLat + '>' + companyName + '</li>');
                }
                $("#anch_name_list").slideDown(200);
                // 点击选择按钮
                $('#anch_name_list>li').on('click', function () {
                    console.log($(this).text());
                    // 更新锚地信息
                    $('#anch_name').val($(this).text());
                    $("#anch_purpose").val($(this).attr("Purpose"));
                    $("#anch_Des").val($(this).attr("Des"));
                    // 点击了之后重新加载锚地信息
                    // $(".anchInfo_list").attr("anchKey", $(this).attr("anchKey"));
                    getAnchInfo($(this).attr("anchKey"), $(this).attr("centerLon"), $(this).attr("centerLat") );
                    $(this).slideUp(400)
                });
            }
        },
        error: function(err){
            console.log(err);
        }
    });
}

/**
 * 获取锚地信息
 * @param anchKey
 * @param lon
 * @param lat
 */
function getAnchInfo(anchKey, lon, lat) {
    var centerLon = lon;
    var centerLat = lat;
    locationList = [];
    // 将锚地的key值赋上
    $(".anchInfo_list").attr("anchKey", anchKey);
    $(".IntentPort_list>li:not(.add_port)").remove(); // 目的港口列表初始化
        $.ajax({
            url: '/anch/getAnchInfo',
            type: 'get',
            data: {anchKey: anchKey},
            success: function (data) {
                // 锚地表里有相应的数据
                var belongPortList = [];
                if (data[0] === "200") {
                    var anchInfo = data[1][0];
                    // anchKey = anchInfo.AnchorageKey;
                    // 获取锚地信息
                    $("#anch_name").val(anchInfo.Name);
                    $("#anch_purpose").val(anchInfo.Purpose);
                    $("#anch_Des").val(anchInfo.Des);
                    centerLon = anchInfo.CenterLon;
                    centerLat = anchInfo.CenterLat;
                    center = [centerLon, centerLat];
                    // chooseLonLatList = [];
                    console.log(centerLon);
                    console.log(centerLat);
                    var closeAnchList = getCloseAnchList(centerLon, centerLat, allPoints, 20);
                    $(".selected_LonLat").empty();
                    // $(".unselected_LonLat").empty();
                    console.log("锚地长度:" + closeAnchList.length);
                    // 未选择列表
                    // for (var i = 0; i < closeAnchList.length; i++) {
                    //     var ele = closeAnchList[i];
                    //     normalLonLat = transLonLatToNormal(ele.lon, ele.lat);
                    //     var unselectedLonLatStr = '<li clusterId=' + ele.clusterId + ' lon=' + ele.lon + ' lat=' + ele.lat + '><span>' + (i + 1) + '</span><span class = "anch_notBelong"></span><span>' + normalLonLat[0] + ", " + normalLonLat[1] + '</span></li>';
                    //     $(".unselected_LonLat").append(unselectedLonLatStr);
                    // }
                    // 已选择列表
                    var lonLatList = anchInfo.Location.split(";");
                    for (var j = 0; j < lonLatList.length - 1; j++) {
                        var lonLatInfo = lonLatList[j].split("#");
                        var normalLonLat = transLonLatToNormal(lonLatInfo[0], lonLatInfo[1]);
                        var chooseLonLatStr = '<li clusterId="" lon=' + lonLatInfo[0] + ' lat=' + lonLatInfo[1] + '><span>' + (j + 1) + '</span><span class = "always_belong"></span><span>' + normalLonLat[0] + ", " + normalLonLat[1] + '</span></li>';
                        $(".selected_LonLat").append(chooseLonLatStr);
                        locationList.push([parseFloat(lonLatInfo[0]), parseFloat(lonLatInfo[1])]);
                    }
                    locationList.push(locationList[0]); // 将第一个点做为结尾
                    // locationList.push([lonLatInfo[0], lonLatInfo[1]]);
                    //显示当前的锚地的目的港口
                    console.log(anchInfo.DestinationPort);
                    if(anchInfo.DestinationPort !== '' && anchInfo.DestinationPort !== "undefined") {
                        var destinationPortList = anchInfo.DestinationPort.split(";");
                        for (var k = 0; k < destinationPortList.length; k++) {
                            var destinationportID = destinationPortList[k];
                            belongPortList.push(destinationportID);
                            var port = AllPortBasicList[destinationportID];
                            // 根据全部港口对象获得相应的内容
                            var portStr = '<li portID=' + destinationportID + '><span>' + port.ENName + '</span><i></i></li>';
                            // $(".IntentPort_list").append(portStr);
                            $(".add_port").before(portStr);
                        }
                    }
                }
                else{
                    // 中心点为本点
                    console.log(centerLon + "," + centerLat);
                    center = [centerLon, centerLat];
                    locationList = [[centerLon, centerLat]];
                    // chooseLonLatList = [[lon, lat]];
                    // 锚地信息初始化
                    $(".anchInfo_list>.pier_info>input").val(""); //初始化输入
                    // 未选择列表中
                    var closeAnchList = getCloseAnchList(centerLon, centerLat, allPoints, 20);
                    // 将当前点排除掉
                    $(".selected_LonLat").empty();
                    $(".unselected_LonLat").empty();
                    console.log("锚地长度:" + closeAnchList.length);
                    for(var i = 0; i< closeAnchList.length; i++){
                        var ele = closeAnchList[i];
                        if(i === 0){
                            // 在选择列表中只有本锚地信息lon, lat
                            var normalLonLat = transLonLatToNormal(centerLon, centerLat);
                            // var chooseLonLatStr = '<li clusterId=' + ele.clusterId + ' lon=' + lon + ' lat=' + lat + '><span>1</span><span class = "anch_belong"></span><span>' +  normalLonLat[0] + ", " + normalLonLat[1] + '</span></li>';
                            var chooseLonLatStr = '<li clusterId=' + ele.clusterId + ' lon=' + centerLon + ' lat=' + centerLat + '><span>1</span><span class = "always_belong"></span><span>' +  normalLonLat[0] + ", " + normalLonLat[1] + '</span></li>';
                            $(".selected_LonLat").append(chooseLonLatStr);
                        }else {
                            normalLonLat = transLonLatToNormal(ele.lon, ele.lat);
                            var unchoosedLonLatStr = '<li clusterId=' + ele.clusterId + ' lon=' + ele.lon + ' lat=' + ele.lat +'><span>' + i + '</span><span class = "anch_notBelong"></span><span>' + normalLonLat[0] + ", " + normalLonLat[1] + '</span></li>';
                            $(".unselected_LonLat").append(unchoosedLonLatStr);
                        }
                    }
                }
                // 获得里该中心点最近的20个港口
                console.log(centerLon + "," + centerLat);
                var closePortList = getClosePortList(centerLon, centerLat, AllPortBasicList, 20);
                // console.log(closePortList);
                /* 港口列表模块 */
                $("#port_list_to_choose").empty();
                for(var i = 0; i < closePortList.length; i++){
                    var port = closePortList[i];
                    if(belongPortList.indexOf(port.PortID) === -1) {
                        $("#port_list_to_choose").append('<li portID="' + port.PortID + '">' + port.ENName + '</li>');
                    }
                }
                // 将曲线的点(勾)画出来
                console.log("画出点");
                // anch.getSource().clear(); // 将锚地层清空
                current.getSource().clear(); // 清空当前图层
                // 更新轮廓
                updateLocationList();
                // 根据当前所选点，画出轮廓线
                writeContourLine(locationList);
                // for(var i = 0; i < locationList.length - 1; i++) {
                //     var ele = locationList[i];
                //     var lon = ele[0];
                //     var lat = ele[1];
                //     console.log(lon + "," + lat);
                //     var anch_choosed = new ol.Feature({
                //         'number': i + 1,
                //         'id' : 'choosed',
                //         'lon' : lon,
                //         'lat': lat,
                //         'type': 0,
                //         // 'anchKey': anchKey,
                //         // 'cluster_id' : key,
                //         geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
                //     });
                //     anch_choosed.setStyle(choosed);
                //     current.getSource().addFeature(anch_choosed);
                //     // features.push(park_feature);
                // }
            },
            error: function (err) {
                console.log(err);
            }
        });
    // }

}

/**
 * 获得该锚地中心点80公里范围内的静止区域
 * 与泊位不同的是，一旦确定为某个大锚地，则会将小锚地
 * @param centerLon  中心点经度
 * @param centerLat 中心点纬度
 * @param allPoints 目前所有的静止区域
 * @param n 获取的上限
 */
function getCloseAnchList(centerLon, centerLat, allPoints, n){
    var distanceList = [];
    // var num = 0;
    // 遍历所有静止区域中心点
    for(var key in allPoints) {
        var ele = allPoints[key];
        var type = ele['type']; // 属于哪一类， 目前有0：锚地， 1：泊位， 2：未知区域
        if(type === 0){
            var lon = ele['lon'];
            var lat = ele['lat'];
            var distance = getGreatCircleDistance(centerLon, centerLat, lon, lat);
            if(distance <= 80.0){
                distanceList.push({clusterId: key, lon: lon, lat: lat, distance: distance})
            }
        }
    }
    n = Math.min(n, distanceList.length);

    distanceList.sort(function (x, y) {
        return x.distance - y.distance
    });

    // 取前n个锚地
    return distanceList.slice(0, n)
}

// 改变锚地保存状态
function changeAnchSaveButton(saveStatus) {
    if(saveStatus){
        $('#anch_save').removeAttr("style");
        $('#anch_save').removeAttr("disabled")
    }
    else{
        $('#anch_save').attr("style", "background:#ccc");
        $('#anch_save').attr("disabled", "disabled")
    }
}
// 更新位置信息
function updateLocationList(){
    // 更新之前先清空一次
    locationList = [];
    var num = 0;
    var lonSum  = 0;
    var latSum  = 0;
    $(".selected_LonLat >li").each(function () {
        num++;
        var lon = parseFloat($(this).attr("lon"));
        var lat = parseFloat($(this).attr("lat"));
        lonSum += lon;
        latSum += lat;
        locationList.push([lon, lat])
    });

    // 已选择列表数据更新
    // var lonLatList = anchInfo.Location.split(";");
    // // 将几个点的定位显示
    // var positionFeatureList = [];
    // for( var i = 0; i < lonLatList.length; i++){
    //     var lon_lat = lonLatList[i];
    //     var position_feature = new ol.Feature({
    //         geometry: new ol.geom.Point(ol.proj.fromLonLat([lon_lat[0], lon_lat[1]]))
    //     });
    //     position_feature.setStyle(position_style);
    //     positionFeatureList.push(position_feature)
    // }
    // position.getSource().clear();
    // position.getSource().addFeatures(positionFeatureList);

    center = [lonSum / num, latSum / num];
    console.log("中心点为: " + center);
    // 计算range
    range = 0;
    for(var i = 0; i< locationList.length; i++){
        var lon_lat = locationList[i];
        var distance = getDistance(center[0], center[1], lon_lat[0], lon_lat[1]);
        if(distance > range){
            range = distance;
        }
    }
    range = range.toFixed(4);
    console.log("范围为: " + range);
    // 顺时针排序
    locationList.sort(clockCompare);
    // 刷新已选锚地列表
    var chooseLonLatStr = '';
    var selected_lon_lat_list = $(".selected_LonLat");
    for (var j = 0; j < locationList.length; j++) {
        var lonLatInfo = locationList[j];
        var normalLonLat = transLonLatToNormal(lonLatInfo[0], lonLatInfo[1]);
        chooseLonLatStr += '<li clusterId="" lon=' + lonLatInfo[0] + ' lat=' + lonLatInfo[1] + '><span>' + (j + 1) + '</span><span class = "always_belong"></span><span>' + normalLonLat[0] + ", " + normalLonLat[1] + '</span></li>';
    }
    selected_lon_lat_list.empty();
    selected_lon_lat_list.append(chooseLonLatStr);
    // 顺时针方向
    var firstPoint = locationList[0];
    locationList.push(firstPoint);
}

// 画出锚地的轮廓线
// 再画上边界点
function writeContourLine(lonLatList) {
    var lonLatInfo = [];
    for(var i = 0; i < lonLatList.length; i++){
        var ele = lonLatList[i];
        lonLatInfo.push(ol.proj.fromLonLat([ele[0], ele[1]]));
    }
    // 将当前的锚地删除
    if(anch.getSource().getFeatureById("current") !== null){
        anch.getSource().removeFeature(anch.getSource().getFeatureById("current"));
    }
    // 添加新的feature, 表示当前正在操作的feature
    var feature = new ol.Feature({
        type: 0,
        lon: center[0],
        lat: center[1],
        geometry: new ol.geom.Polygon([lonLatInfo])
    });
    feature.setId('current');
    anch.getSource().addFeature(feature);
    // 显示边界点
    current.getSource().clear(); // 清空图层
    for(var i = 0; i < locationList.length - 1; i++) {
        var ele = locationList[i];
        var lon = ele[0];
        var lat = ele[1];
        var anch_choosed = new ol.Feature({
            'id' : 'choosed',
            'lon' : lon,
            'lat': lat,
            'anchKey': "",
            'number' : i + 1,
            geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
        });
        anch_choosed.setStyle(choosed);
        current.getSource().addFeature(anch_choosed);
    }
}



/*********************************分割线 *******************************************************************************/

// 搜索锚地名
$('.anchName_select>input').keyup(function(){
    console.log("输入信息");
    var nowVal = $(this).val();
    // 清空列表
    $("#anchName_list").empty();
    // 做一下规范化,将" '等符号正则化
    nowVal = nowVal.replace(/[\'\"]/g,"");
    // 根据输入字符串请求数据
    addAnchName(nowVal);
    // 根据字符串向数据库请求
});




// 点击对应的锚地列表行， 在地图上突出显示
// $(".unselected_LonLat:not(.anch_notBelong)").delegate("li", "click",function(){
//     var lon = parseFloat($(this).attr("lon"));
//     var lat = parseFloat($(this).attr("lat"));
//     console.log(lon + "," + lat);
//     var position_feature = new ol.Feature({
//         geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
//     });
//     position_feature.setStyle(position_style);
//     position.getSource().clear();
//     // console.log(position_feature);
//     position.getSource().addFeatures([position_feature]);
// });

// 监听输入的改变
$('.anchInfo_list>.pier_info').bind('input propertychange',function() {
    // 将状态保存为可保存状态
    changeAnchSaveButton(true);
});

// 保存按钮事件
$('#anch_save').click(function(){
    console.log("保存当前信息");
    changeAnchSaveButton(false); // 改变按钮状态
    $('#newAnch').fadeOut("normal");
    // 开始计算
    var anchKey = $(".anchInfo_list").attr("anchKey");
    // 当还不是锚地的时候，生成一个锚地key值
    if(anchKey === ""){
        anchKey = 'A' + generateNewPierKey();
    }
    var anchName = $("#anch_name").val();
    console.log(anchName);
    var purpose = $("#anch_purpose").val();
    console.log(purpose);
    var des = $("#anch_Des").val();
    console.log(des);

    // // 将不再需要的静止区域ID从表中删除
    // var addClusterIDList = [];
    // for(var i = 0; i < $(".anch_belong").length; i++ ){
    //     addClusterIDList.push("'" + $(".anch_belong").eq(i).parents().attr("clusterID") + "'");
    // }
    // console.log(addClusterIDList);

    // // 将包含在区域内部的点也删去
    // for(var i = 0; i < $(".anch_belong").length; i++ ){
    //     addClusterIDList.push("'" + $(".anch_belong").eq(i).parents().attr("clusterID") + "'");
    // }
    // console.log(addClusterIDList);




    // // 取得所有需要写入的静止区域ID：**；**；**；
    // var allbelongClusterIDStr =  addClusterIDList.concat(originalClusterIDList).join(";");
    // console.log(allbelongClusterIDStr);

    // 取得所有需要记录的港口ID
    var portListStr = '';
    console.log($(".IntentPort_list>li:not(.add_port)").length);
    for(var i = 0; i < $(".IntentPort_list>li:not(.add_port)").length; i++){
        if(i > 0){
            portListStr += ";";
        }
        portListStr +=  $(".IntentPort_list>li").eq(i).attr("portID")
    }
    console.log(portListStr);

    // var addClusterIdList = $(".selected_LonLat").children(".anch_belong").attr("clusterID");
    // console.log(addClusterIdList);
        // /deleteStaticArea

    // 删除已选的静止区域
    // var addClusterIDList = [];
    // // var locationList = [];
    // for(var j = 0; j < $(".selected_LonLat>li").length; j++ ){
    //     var ele = $(".selected_LonLat>li").eq(j);
    //     var clusterID = ele.attr("clusterID");
    //     console.log(clusterID);
    //     if(clusterID !== "") {
    //         addClusterIDList.push(clusterID);
    //         // 删除相应的图标
    //         delete allPoints[clusterID];
    //     }
    // }

    // 删除包含的未选静止区域
    // for(var k = 0; k <  $(".unselected_LonLat>li").length; k++){
    //     var ele = $(".unselected_LonLat>li").eq(k);
    //     lon = parseFloat(ele.attr("lon"));
    //     lat = parseFloat(ele.attr("lat"));
    //     if(inside([lon, lat], locationList)){
    //         var clusterID = ele.attr("clusterID");
    //         console.log("包含区域 " +  clusterID);
    //         delete allPoints[clusterID];
    //         addClusterIDList.push(clusterID);
    //     }
    // }

    // var closeAnchList = getCloseAnchList(center[0], center[1], allPoints, 20);
    // for(var k = 0; k <  closeAnchList.length; k++){
    //     var ele = closeAnchList[k];
    //     lon = ele.lon;
    //     lat = ele.lat;
    //     if(inside([lon, lat], locationList)){
    //         var clusterID = ele.clusterId;
    //         console.log("包含区域 " +  clusterID);
    //         delete allPoints[clusterID];
    //         // addClusterIDList.push(clusterID);
    //     }
    // }

    // 把需要的点记录下来
    var location = "";
    for(var l = 0; l < locationList.length; l++){
        if(l > 0){
            location += ";"
        }
        var lon = locationList[l][0];
        var lat = locationList[l][1];
        location +=  lon + "#" + lat;
    }
    // console.log(location);
    var center_lon = center[0].toFixed(4);
    var center_lat = center[1].toFixed(4);
    var anchInfo = {AnchorageKey: anchKey, Name: anchName, Purpose: purpose,
        Des: des, CenterLon: center_lon, CenterLat: center_lat,
        Location: location, DestinationPort: portListStr, Range: range}; // 向后台请求保存
    console.log(anchInfo);

    // // 删除对应的静止区域
    // $.ajax({
    //     url: '/anch/deleteStaticArea',
    //     type: 'get',
    //     data: {clusterIDList: addClusterIDList},
    //     success: function (data) {
    //         console.log(data[1])
    //     },
    //     error: function (err) {
    //         console.log(err);
    //     }
    // });
    $.ajax({
        url: '/anch/saveAnchInfo',
        type: 'get',
        data: {anchInfo: anchInfo},
        success: function (data) {
            console.log(data[1]);
            getAllAnch(); // 刷新锚地信息
        },
        error: function (err) {
            console.log(err);
        }
    });
    // 锚地样式
    var anch_style =  new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'blue',
            lineDash: [1, 2, 3, 4, 5, 6],
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.1)'
        }),
        text : new ol.style.Text({
            // font: '10px sans-serif' 默认这个字体，可以修改成其他的，格式和css的字体设置一样
            text: anchName !== "" ? anchName : "未命名锚地",
            fill: new ol.style.Fill({
                color: 'black'
            }),
            textAlign:"center"
        })
    });
    // console.log("保存该锚地");
    // 将操作状态转换为显示状态
    anch.getSource().getFeatureById("current").setStyle(anch_style);
    anch.getSource().getFeatureById("current").set("anchKey", anchKey);
    anchStatus = false; // 将锚地状态还原
    current.getSource().clear(); // 当前图层
});

// 取消按钮点击之后
$('#anch_cancel').click(function(){
    $('#newAnch').fadeOut("normal");
    // 将定位图层清空
    // position.getSource().clear();
    // 如果有画图未保存的图层, 清空当前的画图区域
    if(anch.getSource().getFeatureById("current") !== null && anch.getSource().getFeatureById("current").get("anchKey") === ""){
        // 删去正在画的那一层, 还原成
        anch.getSource().removeFeature(anch.getSource().getFeatureById("current"));
        anch.getSource().addFeature(old_feature);
    }
    // 回到非锚地状态
    anchStatus = false;
    anchLayer(zoom);
    // 将选择勾去掉
    current.getSource().clear();
});


// 可点击选择港口
$('#port_list_to_choose').delegate('li', 'click', function () {
    var portStr = '<li portID=' + $(this).attr("portID") +'><span>' + $(this).text() + '</span><i class = "close"></i></li>';
    // $(".IntentPort_list").append(portStr);
    $(".add_port").before(portStr);
    changeAnchSaveButton(true);
    $(this).remove();
    $(this).parent().slideUp(200);
    // 滚动条到达最右边
    $('.anch_IntentPort>span:nth-child(2)').scrollLeft($('.IntentPort_list>li:last-child').position().left);
    // $('.anch_IntentPort>span:nth-child(2)').scrollLeft(4000);
});

// 已选港口列表关闭按钮
$(".IntentPort_list").delegate('.close', 'click', function () {
    var ele = $(this).parent(); // li元素
    // 添加至下面
    $('#port_list_to_choose').append('<li portID=' + ele.attr("portID") +'>' + $(this).prev().text() +'</li>');
    ele.remove();
});

// 点击添加按钮
$(".anch_IntentPort").delegate('.add_port', 'click' , function(){
    $('.AllIntentPort_List').slideToggle(200);
});

// 离开对应区域
$('.AllIntentPort_List').mouseleave(function () {
    $('.AllIntentPort_List').slideUp(200);
});



