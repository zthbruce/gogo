/**
 * Created by Truth on 2017/8/21.
 * 标准航线
 */
var routeBasicInfo = {};
var relatePortList = [];
getRouteBasicInfo(); // 获取航线基本信息
getRelatePortList(); // 获取相关的港口列表

/**
 * 获取航线的基本信息
 */
function getRouteBasicInfo(){
    $.ajax({
        url: '/route/getRouteBasicInfo',
        type: 'get',
        success:function (data) {
            if(data[0] === "200"){
                routeBasicInfo = data[1]
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
}

/**
 * 获得相关港口
 */
function getRelatePortList() {
    $.ajax({
        url: '/route/getRelatePort',
        type: 'get',
        success:function (data) {
            if(data[0] === "200"){
                relatePortList = data[1]
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
}

/**
 * 显示存在泊位下的港口
 */
function showRelatePort() {
    // 显示待选择的港口, 如果不在已增加的列表中
    for(var j = 0; j< relatePortList.length; j++ ){
        var portID = relatePortList[j].portID + '';
        // console.log(portID);
        // 当不在增加列表中
        // if(portList.indexOf(portID) === -1 && portID !== standardPortID){
        var port = AllPortBasicList[portID];
        var lon = parseFloat(port.LongitudeNumeric);
        var lat = parseFloat(port.LatitudeNumeric);
        var port_to_choose = new ol.Feature({
            type: "toChoose",
            port_id: portID,
            geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
        });
        port_to_choose.setStyle(port_nor);
        current.getSource().addFeature(port_to_choose)
    }
}

/**
 * 根据当前的港口列表高亮显示所属泊位
 * @param portList
 */
function showSelectedBerth(portList) {
    for(var key in allPoints){
        // 后面需要根据航线的类型进行筛选
        var ele = allPoints[key];
        var lon = ele['lon'];
        var lat = ele['lat'];
        var type = ele['type']; // 属于哪一类， 目前有0：锚地， 1：泊位， 2：未知区域
        var portID = ele['PortID'];
        if(type === 1 && portList.indexOf(portID) !==-1){
            // 这是当前选择的
            var berth_choosed = new ol.Feature({
                // 'lon': lon,
                // 'lat': lat,
                'portId': portID,
                'type': 1,
                'cluster_id' : key,
                geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
            });
            // 表示已经选择的泊位
            berth_choosed.setStyle(choosed);
            current.getSource().addFeature(berth_choosed);
        }
    }

}
/**
 * 将已选港口显示，将港口下的泊位高亮显示
 */

function updateBerth2Port(portList){
    // 显示目前已经选择的港口
    for(var i = 0; i< portList.length; i++){
        var portID = portList[i];
        var port = AllPortBasicList[portID];
        var lon = parseFloat(port.LongitudeNumeric);
        var lat = parseFloat(port.LatitudeNumeric);
        // console.log(lon +"," + lat);
        var feature = {
            port_id: portID,
            geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
        };
        if(portID !== standardPortID){
            feature["type"] = "choosed";
        }
        var port_choosed = new ol.Feature(feature);
        port_choosed.setStyle(port_yes);
        current.getSource().addFeature(port_choosed)
    }
    // 显示目前已经选择的泊位
    showSelectedBerth(portList)
}

/**
 * 移除所选的港口
 * @param portID
 * @param current_feature
 */
function removePort(portID, current_feature) {
    console.log("取消");
    // 将港口取消高亮
    current_feature.set("type", "toChoose");
    current_feature.setStyle(port_nor);
    // 泊位取消高亮
    var features = current.getSource().getFeatures();
    for(var i=0; i< features.length; i++) {
        var feature = features[i];
        if(feature.get('portId') === portID){
            current.getSource().removeFeature(feature);
        }
    }
    // 移除列表中的元素
    var portList = port_ul.children("li");
    for(var j=0; j< portList.length; j++){
        var li = portList.eq(j);
        li.remove();
    }
}








/*********************************分割线*******************************************************************************/
// 交互事件模块

/** 点击最外层航线按钮 */
$(".route_Info_btn").click(function () {
    $('.routeType_list').fadeToggle(300);
    $('.oneRoute_List').fadeOut(300);
    $('#routeInfo').fadeOut(600);
    //隐藏船队列表和相关弹出框
    $('.Fleet_List_ul').fadeOut(300);
    $('#fleet').fadeOut(600);
    $('#searchShipList').fadeOut(600);
    $('#shipDetails').fadeOut(600);
});

/** 鼠标移动到航线上显示航线的二级信息*/
$('.routeType_list>li').mouseenter(function(){
    console.log("here");
    var routeType = $(this).attr("type");
    // 清空所选
    $('.routeType_list>li').removeClass("choose");
    $(this).addClass("choose");
    var route_ul = $('.oneRoute_List');
    //航线列表第一次需要初始化
    route_ul.empty();
    var routeInfo = routeBasicInfo[routeType];
    for(var i = 0; i< routeInfo.length; i++) {
        var info = routeInfo[i];
        // console.log(info);
        var routeId = info.RouteId;
        var name = info.Name;
        route_ul.append('<li routeId=' + routeId + '>' + name + '</li>');
    }
    // 显示航线信息
    route_ul.css('display','block');
});

// var standardDeparturePortID;
// var standardArrivalPortID;
var standardPortID;
var allPortList;
var port_type;
var allDeparturePortList;
var allArrivalPortList;

/**
 * 鼠标点击某一条具体的航线
 */
$('.oneRoute_List').delegate("li", 'click', function () {
    allDeparturePortList = [];
    allArrivalPortList = [];
    $('.routeType_list').fadeToggle(300);
    $('.oneRoute_List').fadeOut(300);
    var routeId = $(this).attr("routeId");
    $('.oneRoute_List>li').removeClass("choose");
    $(this).addClass("choose");
    console.log(routeId);
    $.ajax({
        url: "/route/getRouteDetailInfo",
        type: "get",
        data:{RouteId: routeId},
        success:function (data) {
            if(data[0] === '200'){
                console.log("获取数据成功");
                var routeInfo = data[1][0]; // 航线信息
                // var routeName = routeInfo.Name; // 名称
                var standardDeparturePortID = routeInfo.StandardDeparturePort; // portID
                var standardArrivalPortID = routeInfo.StandardArrivalPort; // portID
                var departurePort = routeInfo.DeparturePort; // PortIDListStr
                var arrivalPort = routeInfo.ArrivalPort; // PortIDListStr
                var DWT = routeInfo.DWT === null? "":routeInfo.DWT;
                var LOA = routeInfo.LOA === null? "":routeInfo.LOA;
                var beam = routeInfo.Beam === null? "":routeInfo.Beam;
                var draft =  routeInfo.Draft === null? "":routeInfo.Draft;
                var loadingWaitTime = routeInfo.LoadingWaitTime === null? "":routeInfo.LoadingWaitTime;
                var dischargeWaitTime = routeInfo.DischargeWaitTime === null? "":routeInfo.DischargeWaitTime;
                var DWTPH =  routeInfo.DWTPH === null? "":routeInfo.DWTPH;
                var Sun_Holiday = routeInfo.Sun_Holiday === null? "":routeInfo.Sun_Holiday;
                var ENDes  = routeInfo.ENDes === null? "":routeInfo.ENDes;
                var CNDes = routeInfo.CNDes === null? "":routeInfo.CNDes;
                // 标题
                var nameI = $('.routeType_list>.choose').text();
                var nameII = $('.oneRoute_List>.choose').text();
                console.log(nameI + "." + nameII);
                var title = $('#routeInfo>.fleet_title>span');
                title.text(nameI + " / " + nameII);
                title.attr("routeId", routeId);

                // 标准出发港显示
                var standardDeparturePort_span = $('.routePort_Start>.routePoint_infoShow');
                standardDeparturePort_span.text(""); // 初始化
                if(standardDeparturePortID !== null) {
                    console.log(standardDeparturePortID);
                    var departure_port = AllPortBasicList[standardDeparturePortID];
                    standardDeparturePort_span.text(departure_port.ENName);
                    standardDeparturePort_span.attr("portID",  standardDeparturePortID);
                    standardDeparturePort_span.attr("lon", departure_port.LongitudeNumeric);
                    standardDeparturePort_span.attr("lat", departure_port.LatitudeNumeric);
                    allDeparturePortList.push(standardDeparturePortID)
                }
                // 标准目的港显示
                var standardArrivalPort_span = $('.routePort_End>.routePoint_infoShow');
                standardArrivalPort_span.text(""); // 初始化
                if(standardArrivalPortID !== null){
                    console.log(standardArrivalPortID);
                    var arrival_port = AllPortBasicList[standardArrivalPortID];
                    standardArrivalPort_span.text(arrival_port.ENName);
                    standardArrivalPort_span.attr("portID",  standardArrivalPortID);
                    standardArrivalPort_span.attr("lon",  arrival_port.LongitudeNumeric);
                    standardArrivalPort_span.attr("lat",  arrival_port.LatitudeNumeric);
                    allArrivalPortList.push(standardArrivalPortID);
                }
                // 显示目的港口和出发港口列表
                $(".StartEndPort_List>li:not(.add_port)").remove();// 清空信息初始化
                // 出发港列表
                if(departurePort !== null && departurePort !== ""){
                    var departurePortList = departurePort.split("#");
                    for(var i = 0; i < departurePortList.length; i++ ){
                        var portID = departurePortList[i];
                        allDeparturePortList.push(portID);
                        var port = AllPortBasicList[portID];
                        var port_li =  '<li portID='+ portID+'><span>'+ port.ENName + '</span><i></i></li>';
                        $(".routeStartPort_Select .StartEndPort_List").append(port_li)
                    }
                }
                // 目的港列表
                if(arrivalPort !== null && arrivalPort !== ""){
                    var arrivalPortList = arrivalPort.split("#");
                    for(var i = 0; i < arrivalPortList.length; i++ ){
                        var portID = arrivalPortList[i];
                        allArrivalPortList.push(portID);
                        console.log(portID);
                        var port = AllPortBasicList[portID];
                        var port_li =  '<li portID='+ portID+'><span>'+ port.ENName + '</span><i></i></li>';
                        $(".routeEndPort_Select .StartEndPort_List").append(port_li)
                    }
                }
                // 填上输入值
                $(".routeInfo_List>li:nth-child(1)>input").val(DWT);
                $(".routeInfo_List>li:nth-child(2)>input").val(LOA);
                $(".routeInfo_List>li:nth-child(3)>input").val(beam);
                $(".routeInfo_List>li:nth-child(4)>input").val(draft);
                $(".routeInfo_List>li:nth-child(5)>input").val(loadingWaitTime);
                $(".routeInfo_List>li:nth-child(6)>input").val(dischargeWaitTime);
                $(".routeInfo_List>li:nth-child(7)>input").val(DWTPH);
                // 周日假期休息框
                if(Sun_Holiday === "1"){
                    $(".routeInfo_List>li:nth-child(8)>input").attr("checked", true)
                }
                else{
                    $(".routeInfo_List>li:nth-child(8)>input").attr("checked", false)
                }
                // 中英文说明
                $(".routeDes_Chinese>textarea").val(CNDes);
                $(".routeDes_English>textarea").val(ENDes);
            }
            else{
                console.log(data);
            }
        }
    });
    $('#routeInfo').fadeIn(300);
});


/**
 * 点击取消按钮
 *
 */
$(".routeInstall_CancelBtn").click(function(){
    $('#routeInfo').fadeOut(300); //界面消失
    routeStatus = false; // 退出航线模式
    current.getSource().clear(); // 清空临时层
});


// 这本来应该定位到相应的地方, 但是前提是两个标准港口必须要有相应的位置
/**
 * 出发港增加港口
 */
$(".add_StartPort").click(function () {
    var startPort = $('.routePort_Start>.routePoint_infoShow');
    var lon = startPort.attr("lon");
    var lat = startPort.attr("lat");
    var closePortList = getClosePortList(lon, lat, AllPortBasicList, 20);
    // console.log(closePortList);
    /* 港口列表模块 */
    var startPort_ul = $(".startPort");
    startPort_ul.empty();
    for(var i = 0; i < closePortList.length; i++){
        var port = closePortList[i];
        startPort_ul.append('<li portID="'+ port.PortID+'">'+port.ENName+'</li>');
    }
});

/**
 * 目的港增加港口
 */
$(".add_EndPort").click(function () {
    var endPort = $('.routePort_Start>.routePoint_infoShow');
    var lon = endPort.attr("lon");
    var lat = endPort.attr("lat");
    var closePortList = getClosePortList(lon, lat, AllPortBasicList, 20);
    // console.log(closePortList);
    /* 港口列表模块 */
    var endPort_ul = $(".endPort");
    endPort_ul.empty();
    for(var i = 0; i < closePortList.length; i++){
        var port = closePortList[i];
        endPort_ul.append('<li portID="'+ port.PortID+'">'+port.ENName+'</li>');
    }
});

/**
 *
 */
$('.StartEndPort_List').delegate('li>.close', 'click', function () {
   console.log("here");
   var port_li = $(this).parent();
    port_li.remove(); // 将相应的li删除
    // 然后重新计算相应的停泊区域, 将PortID对应的PortID删除了
    var m = 0;
    var portID = port_li.attr("portID");
    var current_features = current.getSource().getFeatures();
    for(var i =0; i< current_features.length; i++){
        var feature = current_features[i];
        if(feature.get('port_id') === portID){
            m++;
            console.log(m)
            var current_feature = feature;
            current_feature.set("type", "toChoose");
            current_feature.setStyle(port_nor);
            // break;
        }
    }
    console.log(current_feature.get('port_id'));
    removePort(portID, current_feature);
});

/**
 * 点击定位按钮事件
 * 定位到相应位置
 * 进入航线模式，泊位图标可点击
 */

$('.routePort_Select i').click(function () {

    var info_span = $(this).prev();
    var info_div = $(this).parent();
    var port_class = info_div.attr("class");
    var lon = parseFloat(info_span.attr("lon"));
    var lat = parseFloat(info_span.attr("lat"));
    // 定位至港口相应的位置
    var view = map.getView();
    // view.setZoom(14);
    var pan = ol.animation.pan({
        //动画持续时间
        duration: 2000,
        source:view.getCenter()
    });
    //在地图渲染之前执行平移动画
    map.beforeRender(pan);
    view.setCenter(ol.proj.fromLonLat([lon, lat]));
    // 放大动画
    var zoom = ol.animation.zoom({
        duration: 2000,
        resolution: view.getResolution()
    });
    map.beforeRender(zoom);
    view.setZoom(14);
    map.getView().setZoom(14);
    // 进入航线模式
    routeStatus = true;
    // 清空临时操作层
    current.getSource().clear();
    // 显示相关的港口, 以供选择
    showRelatePort();
    // 增加港口列表
    if(port_class ==="routePort_Start"){
        port_type = 0; // 表示出发港
        allPortList = allDeparturePortList;
    }
    else{
        port_type = 1; // 表示目的港
        allPortList = allArrivalPortList;
    }
    // 标准港口ID
    standardPortID = info_span.attr("portID");
    console.log("选择港口" + standardPortID);
    // 显示增家
    // 高亮已增加的港口和泊位
    // cosonle.log(allPortList);
    updateBerth2Port(allPortList);

});

/**
 * 点击保存
 */
$('.routeInstall_SaveBtn').click(function () {
    var title = $('#routeInfo>.fleet_title>span');
    // 获取routeId
    var routeId = title.attr("routeId");
    // 出发港口
    var departurePort = "";
    var departure_li = $(".routeStartPort_Select .StartEndPort_List>li");
    for(var i = 0; i< departure_li.length;i++){
        if(i > 0){
            departurePort += "#";
        }
        var portID =  departure_li.eq(i).attr("portID");
        departurePort += portID;
    }
    // 目的港口
    var arrivalPort = "";
    var arrival_li = $(".routeEndPort_Select .StartEndPort_List>li");
    for(var i = 0; i< arrival_li.length;i++){
        if(i > 0){
            arrivalPort += "#";
        }
        portID =  arrival_li.eq(i).attr("portID");
        arrivalPort += portID;
    }
    // 信息
    var DWT = $(".routeInfo_List>li:nth-child(1)>input").val();
    var LOA = $(".routeInfo_List>li:nth-child(2)>input").val();
    var beam = $(".routeInfo_List>li:nth-child(3)>input").val();
    var draft = $(".routeInfo_List>li:nth-child(4)>input").val();
    var loadingWaitTime = $(".routeInfo_List>li:nth-child(5)>input").val();
    var dischargeWaitTime = $(".routeInfo_List>li:nth-child(6)>input").val();
    var DWTPH = $(".routeInfo_List>li:nth-child(7)>input").val();
    var Sun_Holiday = "0";
    if($(".routeInfo_List>li:nth-child(8)>input").attr("checked")){
        Sun_Holiday  = "1";
    }
    // 中英文说明
    var CNDes = $(".routeDes_Chinese>textarea").val();
    var ENDes = $(".routeDes_English>textarea").val();
    var reqParam = {RouteId:routeId, DeparturePort:departurePort, ArrivalPort:arrivalPort, DWT:DWT, LOA:LOA, Beam:beam,
        Draft:draft, LoadingWaitTime:loadingWaitTime, DischargeWaitTime:dischargeWaitTime, DWTPH:DWTPH,
        Sun_Holiday:Sun_Holiday, ENDes:ENDes, CNDes:CNDes};
    console.log(reqParam);
    // var reqParam = {};
    $.ajax({
        url:'/route/saveRouteDetailInfo',
        type: "get",
        dataType: 'json',
        data: reqParam,
        success:function (data) {
            console.log(data)
        },
        error:function (err) {
            console.log(err);
        }
    });
    // $.ajax({
    //     url: "/route/getRouteDetailInfo",
    //     type: "get",
    //     data: {
    //         RouteId: routeId, DeparturePort: departurePort, ArrivalPort: arrivalPort, DWT: DWT, LOA: LOA, Beam: beam,
    //         Draft: draft, LoadingWaitTime: loadingWaitTime, DischargeWaitTime: dischargeWaitTime, DWTPH: DWTPH,
    //         Sun_Holiday: Sun_Holiday, ENDes: ENDes, CNDes: CNDes
    //     },
    //     success: function (data) {
    //         console.log(data);
    //     }
    // });
    $('#routeInfo').fadeOut(300); //界面消失
    routeStatus = false; // 退出航线模式
    current.getSource().clear(); // 清空临时层
});

