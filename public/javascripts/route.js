/**
 * Created by Truth on 2017/8/21.
 * 标准航线
 */
var routeBasicInfo = {};
getRouteBasicInfo();
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
        console.log(info);
        var routeId = info.RouteId;
        var name = info.Name;
        route_ul.append('<li routeId=' + routeId + '>' + name + '</li>');
    }
    // 显示航线信息
    route_ul.css('display','block');
});


/**
 * 鼠标点击某一条具体的航线
 */
$('.oneRoute_List').delegate("li", 'click', function () {
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
                var standardDeparturePort = routeInfo.StandardDeparturePort; // {portId:[]}
                var standardArrivalPort = routeInfo.StandardArrivalPort; // {portId:[]}
                var departurePort = routeInfo.DeparturePort; // {portId:[], portId:[]}
                var arrivalPort = routeInfo.ArrivalPort; // {portId:[], portId:[]}
                var DWT = routeInfo.DWT === null? "":routeInfo.DWT;
                var LOA = routeInfo.LOA === null? "":routeInfo.LOA;
                var beam = routeInfo.Beam === null? "":routeInfo.Beam;
                var draft =  routeInfo.Draft === null? "":routeInfo.Draft;
                var loadingWaitTime = routeInfo.LoadingWaitTime === null? "":routeInfo.LoadingWaitTime;
                var dischargeWaitTime = routeInfo.DischargeWaitTime === null? "":routeInfo.DischargeWaitTime;
                var DWTPH=  routeInfo.DWTPH === null? "":routeInfo.DWTPH;
                var Sun_Holiday = routeInfo.Sun_Holiday === null? "":routeInfo.Sun_Holiday;
                var ENDes  = routeInfo.ENDes === null? "":routeInfo.ENDes;
                var CNDes = routeInfo.CNDes === null? "":routeInfo.CNDes;
                // 标题
                var nameI = $('.routeType_list>.choose').text();
                var nameII = $('.oneRoute_List>.choose').text();
                console.log(nameI + "." + nameII);
                $('.fleet_title>span').text(nameI + " / " + nameII);
                // 标准出发港显示
                if(departurePort !== null){
                    var standardDeparturePortList = JSON.parse(standardDeparturePort);
                    for(var portId in standardDeparturePortList){
                        var port = AllPortBasicList[portId];
                        var standardDeparturePort_span = $('.routePort_Start>.routePoint_infoShow');
                        standardDeparturePort_span.text(port.ENName);
                        standardDeparturePort_span.attr("lon", port.lon);
                        standardDeparturePort_span.attr("lat", port.lat);
                    }
                }
                // 标准目的港显示
                if(departurePort !== null){
                    var standardArrivalPortList = JSON.parse(standardArrivalPort);
                    for(var portId in standardArrivalPortList ){
                        var port = AllPortBasicList[portId];
                        var standardArrivalPort_span = $('.routePort_End>.routePoint_infoShow');
                        standardArrivalPort_span.text(port.ENName);
                        standardArrivalPort_span.attr("lon", port.lon);
                        standardArrivalPort_span.attr("lat", port.lat);
                    }
                }
                // 显示目的港口和出发港口列表
                $(".StartEndPort_List>li:not(.add_port)").remove();// 清空信息初始化
                // 出发港列表
                if(departurePort !== null){
                    var departurePortList = JSON.parse(departurePort);
                    for(var portId in departurePortList){
                        var port = AllPortBasicList[portId];
                        var port_li =  '<li portId='+ portId+'><span>'+ port.ENName + '</span><i></i></li>';
                        $('.add_StartPort').before(port_li)
                    }
                }
                // 显示目的港列表
                if(arrivalPort !== null){
                    var arrivalPortList = JSON.parse(arrivalPort);
                    for(var portId in arrivalPortList){
                        var port = arrivalPortList[portId];
                        var port_li =  '<li portId='+ portId+'><span>'+ port.ENName + '</span><i></i></li>';
                        $('.add_EndPort').before(port_li)
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
    console.log("here");
    $('#routeInfo').fadeOut(300); //界面消失
    routeStatus = false; // 退出航线模式
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

$('.StartEndPort_List>li>.close').click(function () {
   console.log("here");
   $(this).parent().remove() // 将相应的li删除
    // 然后重新计算相应的停泊区域
});

/**
 * 点击定位按钮事件
 * 定位到相应位置
 * 进入航线模式，泊位图标可点击
 */

$('.routePort_Select i').click(function () {
    var info_span = $(this).prev();
    var lon = parseFloat(info_span.attr("lon"));
    var lat = parseFloat(info_span.attr("lat"));
    // 定位至港口相应的位置
    map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
    // 进入航线模式
    routeStatus = true;
    // 显示目前已经选择的泊位
    // current.getSource().clear(); // 清空当前图层
    // //根据clusterID进行选择
    // for(var i = 0; i < locationList.length - 1; i++) {
    //     var ele = locationList[i];
    //     var lon = ele[0];
    //     var lat = ele[1];
    //     // 这是当前选择的
    //     var berth_choosed = new ol.Feature({
    //         'id': 'choosed',
    //         'lon': lon,
    //         'lat': lat,
    //         'type': 1,
    //         geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
    //     });
    //     // 表示已经选择
    //     berth_choosed.setStyle(choosed);
    //     current.getSource().addFeature(berth_choosed);
    // }
});

