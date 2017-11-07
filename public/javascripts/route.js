/**
 * Created by Truth on 2017/8/21.
 * 标准航线
 */

let routeBasicInfo = {};
let relatePortList = [];
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
 * 获得相关港口, 即存在泊位的港口
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
function showRelatePort(centerLon, centerLat, r) {
    // 显示待选择的港口, 如果不在已增加的列表中
    for(let portID in AllPortBasicList){
        let port = AllPortBasicList[portID];
        if(port !== undefined) {
            let lon = parseFloat(port.LongitudeNumeric);
            let lat = parseFloat(port.LatitudeNumeric);
            if(isNaN(lon) || isNaN(lat)){
                continue;
            }
            // 计算距离
            let distance = getGreatCircleDistance(lon, lat, centerLon, centerLat);
            if(distance > r){
                continue;
            }
            let port_to_choose = new ol.Feature({
                'pointer': 'port',
                type: "toChoose",
                port_id: portID,
                geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
            });
            port_to_choose.setStyle(point_status[1]);
            current.getSource().addFeature(port_to_choose)
        }
    }
}
//
// function showRelatePort() {
//     // 显示待选择的港口, 如果不在已增加的列表中
//     for(let j = 0; j< relatePortList.length; j++ ){
//         let portID = relatePortList[j].portID + '';
//         console.log(portID);
//         // console.log(portID);
//         // 当不在增加列表中
//         // if(portList.indexOf(portID) === -1 && portID !== standardPortID){
//         let port = AllPortBasicList[portID];
//         if(port !== undefined) {
//             let lon = parseFloat(port.LongitudeNumeric);
//             let lat = parseFloat(port.LatitudeNumeric);
//             let port_to_choose = new ol.Feature({
//                 type: "toChoose",
//                 port_id: portID,
//                 geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
//             });
//             port_to_choose.setStyle(port_nor);
//             current.getSource().addFeature(port_to_choose)
//         }
//     }
// }

/**
 * 根据当前的港口列表高亮显示所属泊位
 * @param portList
 */
function showSelectedBerth(portList) {
    for(let key in allPoints){
        // 后面需要根据航线的类型进行筛选
        let ele = allPoints[key];
        let lon = ele['lon'];
        let lat = ele['lat'];
        let type = ele['type']; // 属于哪一类， 目前有0：锚地， 1：泊位， 2：未知区域
        let portID = ele['PortID'];
        if(type === 1 && portList.indexOf(portID) !==-1){
            // 这是当前选择的
            let berth_choosed = new ol.Feature({
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
    for(let i = 0; i< portList.length; i++){
        let portID = portList[i];
        console.log(portID);
        let port = AllPortBasicList[portID];
        let lon = parseFloat(port.LongitudeNumeric);
        let lat = parseFloat(port.LatitudeNumeric);
        let feature = {
            port_id: portID,
            geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
        };
        if(portID !== standardPortID){
            feature["type"] = "choosed";
        }
        let port_choosed = new ol.Feature(feature);
        // 设置相应的图标
        port_choosed.setStyle(point_status[0]);
        // port_choosed.setStyle(port_yes);
        current.getSource().addFeature(port_choosed)
    }
    // 显示目前已经选择的泊位
    showSelectedBerth(portList)
}

/**
 * 移除所选的港口
 * @param current_li
 * @param current_feature
 */
function removePort(current_li, current_feature) {
    console.log("取消");
    // 将港口取消高亮
    current_feature.set("type", "toChoose");
    current_feature.setStyle(point_status[1]);
    // 泊位取消高亮
    let portID = current_li.attr("portID");
    let features = current.getSource().getFeatures();
    for(let i=0; i< features.length; i++) {
        let feature = features[i];
        if(feature.get('portId') === portID){
            current.getSource().removeFeature(feature);
        }
    }
    // 移除列表中的元素
    current_li.remove();
}
// function removePort(portID, current_feature) {
//     console.log("取消");
//     // 将港口取消高亮
//     current_feature.set("type", "toChoose");
//     current_feature.setStyle(port_nor);
//     // 泊位取消高亮
//     let features = current.getSource().getFeatures();
//     for(let i=0; i< features.length; i++) {
//         let feature = features[i];
//         if(feature.get('portId') === portID){
//             current.getSource().removeFeature(feature);
//         }
//     }
//     // 移除列表中的元素
//     let portList = port_ul.children("li");
//     for(let j=0; j< portList.length; j++){
//         let li = portList.eq(j);
//         li.remove();
//     }
// }

/**
 * 获取航线的货物
 * @param routeId
 */
function getRouteCargoList(routeId) {
    let cargoType_ul = $(".route_CargoType>ul");
    // 初始化
    let cargo_ele = $(".route_CargoType input");
    cargo_ele.val('');
    let cargo_num_ele = cargo_ele.next();
    cargo_num_ele.text('');
    $.ajax({
        url:"/berth/getCargoType",
        type:'get',
        success: function(data){
            let cargoInfo = data[1];
            $.ajax({
                url: "/route/getCargo2Route",
                type: 'get',
                data:{RouteId: routeId},
                success: function (data) {
                    // 获取货物信息
                    // 内容显示
                    let cargoList2Terminal = [];
                    if(data[0] === '200') {
                        let cargoInfoList = data[1];
                        let cargoNum = cargoInfoList.length;
                        let cargoType = '';
                        for (let i = 0; i < cargoNum; i++) {
                            let cargo = cargoInfoList[i];
                            if (i > 0) {
                                cargoType += ", "
                            }
                            cargoList2Terminal.push(cargo.CargoTypeKey);
                            // console.log(cargo.Name);
                            cargoType += cargo.Name;
                        }
                        cargo_ele.val(cargoType);
                        cargo_num_ele.text("(" + cargoNum + ")");
                    }
                    // 列表显示
                    cargoType_ul.empty(); // 初始化
                    let str = '';
                    console.log(cargoList2Terminal);
                    for(let i = 0; i < cargoInfo.length; i++){
                        let cargoType = cargoInfo[i];
                        console.log(cargoType.ID);
                        if(cargoList2Terminal.indexOf(cargoType.ID) !== -1){
                            str += '<li><label for=' + cargoType.ID +'><input type="checkbox" checked="checked" id=' + cargoType.ID + '>' +
                                cargoType.Name + '</label></li>'
                        }
                        else{
                            str += '<li><label for=' + cargoType.ID +'><input type="checkbox"  id=' + cargoType.ID + '>' +
                                cargoType.Name + '</label></li>'
                        }
                    }
                    cargoType_ul.append(str);
                    // cargoType_ul.empty(); // 初始化
                    // let cargoList2Route = data[1];
                    // let str = '';
                    // console.log(cargoList2Route);
                    // for(let i = 0; i < cargoInfo.length; i++){
                    //     let cargoType = cargoInfo[i];
                    //     console.log(cargoType.ID);
                    //     if(cargoList2Route.indexOf(cargoType.ID) !== -1){
                    //         str += '<li><label for=' + cargoType.ID +'><input type="checkbox" checked="checked" id=' + cargoType.ID + '>' +
                    //             cargoType.Name + '</label></li>'
                    //     }
                    //     else{
                    //         str += '<li><label for=' + cargoType.ID +'><input type="checkbox"  id=' + cargoType.ID + '>' +
                    //             cargoType.Name + '</label></li>'
                    //     }
                    // }
                    // cargoType_ul.append(str);
                }
            })
        }
    })
}






/*********************************分割线*******************************************************************************/
// 交互事件模块
/**
 * 地图弹出框拖动事件
 */
let routeInfoDown = false; //航线信息管理弹出框
let LeaseRouteInfoDown = false; //期租航线信息管理弹出框
// let DivLeft;
// let DivTop;
$('.fleet_title').mousedown(function(event){
    let changeDivId = $(this).parent().attr('id');
    if(changeDivId=='routeInfo'){routeInfoDown = true;}
    if(changeDivId=='LeaseRouteInfo'){LeaseRouteInfoDown = true;}
    DivLeft = event.clientX - $(this).offset().left;
    DivTop = event.clientY - $(this).offset().top;
});
// let fleetDivZIndex = 0;
$('#LeaseRouteInfoDown,#routeInfo').click(function(){
    fleetDivZIndex++;
    $(this).css('zIndex',fleetDivZIndex);
});
$('.fleet_title').mouseup(function(){
    let changeDivId = $(this).parent().attr('id');
    if(changeDivId==='LeaseRouteInfo'){LeaseRouteInfoDown = false;}
    if(changeDivId==='routeInfo'){routeInfoDown = false;}
    $(this).css('cursor','auto');
});
$(window).mousemove(function(event){
    let newLeft = event.clientX-DivLeft;
    let newTop = event.clientY-DivTop;
    if(newLeft<=0){newLeft = 0;}
    if(newTop<=0){newTop = 0;}
    if(LeaseRouteInfoDown){
        if(newLeft>$(document).width()-$('#LeaseRouteInfo>.fleet_title').width()){newLeft = $(document).width()-$('#LeaseRouteInfo>.fleet_title').width();}
        if(newTop>$(window).height()-$('#LeaseRouteInfo>.fleet_title').height()){newTop = $(window).height()-$('#LeaseRouteInfo>.fleet_title').height();}
        $('#LeaseRouteInfo').offset({top:newTop,left:newLeft});
    }else if(routeInfoDown){
        if(newLeft>$(document).width()-$('#routeInfo>.fleet_title').width()){newLeft = $(document).width()-$('#routeInfo>.fleet_title').width();}
        if(newTop>$(window).height()-$('#routeInfo>.fleet_title').height()){newTop = $(window).height()-$('#routeInfo>.fleet_title').height();}
        $('#routeInfo').offset({top:newTop,left:newLeft});
    }
});


/** 点击最外层航线按钮 */
$(".route_Info_btn").click(function () {
    // 初始化所选
    $('.routeType_list>li').removeClass("choose");
    $('.routeType_list').fadeToggle(300);
    $('.oneRoute_List').fadeOut(300);
    $('#routeInfo').fadeOut(600);
    $('#LeaseRouteInfo').fadeOut(600);
    //隐藏船队列表和航次相关弹出框
    $('.Fleet_List_ul').fadeOut(300);
    $('#fleet').fadeOut(600);
    $('#searchShipList').fadeOut(600);
    $('#shipDetails').fadeOut(600);
    $('#voyageList').fadeOut(600);
    $('#voyageDetails').fadeOut(600);
    $('#voyage_StandardRoute').fadeOut(600);
    $('#voyage_StandardGoods').fadeOut(600);
});

/** 鼠标移动到航线上显示航线的二级信息*/
$('.routeType_list>li').mouseenter(function(){
    console.log("here");
    let routeType = $(this).attr("type");
    // 清空所选
    $('.routeType_list>li').removeClass("choose");
    $(this).addClass("choose");
    let route_ul = $('.oneRoute_List');
    //航线列表第一次需要初始化
    route_ul.empty();
    let routeInfo = routeBasicInfo[routeType];
    for(let i = 0; i< routeInfo.length; i++) {
        let info = routeInfo[i];
        // console.log(info);
        let routeId = info.RouteId;
        let name = info.Name;
        route_ul.append('<li routeId=' + routeId + '>' + name + '</li>');
    }
    // 显示航线信息
    route_ul.css('display','block');
});


let standardPortID;
let allPortList;
let port_type;
let allDeparturePortList;
let allArrivalPortList;
let routeId; //放在内存中
// let routerCenter = [0, 0];

/**
 * 鼠标点击某一条具体的航线
 */
$('.oneRoute_List').delegate("li", 'click', function () {
    // 航线列表的显示操作
    $('.routeType_list').fadeToggle(300);
    $('.oneRoute_List').fadeOut(300);
    routeId = $(this).attr("routeId");
    $('.oneRoute_List>li').removeClass("choose");
    $(this).addClass("choose");
    // 显示详细信息
    let type = routeId[0];
    // 程租(Travel)
    if(type === "T"){
        console.log("程租");
        allDeparturePortList = [];
        allArrivalPortList = [];
        $.ajax({
            url: "/route/getRouteDetailInfo",
            type: "get",
            data:{RouteId: routeId},
            success:function (data) {
                if(data[0] === '200'){
                    console.log("获取数据成功");
                    let routeInfo = data[1][0]; // 航线信息
                    // let routeName = routeInfo.Name; // 名称
                    let standardDeparturePortID = routeInfo.StandardDeparturePort; // portID
                    let standardArrivalPortID = routeInfo.StandardArrivalPort; // portID
                    let departurePort = routeInfo.DeparturePort; // PortIDListStr
                    let arrivalPort = routeInfo.ArrivalPort; // PortIDListStr
                    let DWT = routeInfo.DWT === null? "":routeInfo.DWT;
                    // let LOA = routeInfo.LOA === null? "":routeInfo.LOA;
                    // let beam = routeInfo.Beam === null? "":routeInfo.Beam;
                    let draft =  routeInfo.Draft === null? "":routeInfo.Draft;
                    let max_age = routeInfo.MaxAge === null?"":routeInfo.MaxAge;
                    let weight = routeInfo.Weight === null ?"":routeInfo.Weight;
                    // 装载信息
                    let loadingWaitTime = routeInfo.LoadingWaitTime === null? "":routeInfo.LoadingWaitTime;
                    let load_TPH = routeInfo.LoadTPH === null? "":routeInfo.LoadTPH;
                    let load_DTPH =  routeInfo.LoadDWTPH === null? "":routeInfo.LoadDWTPH;
                    let load_Sun_Holiday = routeInfo.LoadSunHoliday === null? "":routeInfo.LoadSunHoliday;
                    // 卸载信息
                    let dischargeWaitTime = routeInfo.DischargeWaitTime === null? "":routeInfo.DischargeWaitTime;
                    let discharge_DTPH = routeInfo.DischargeDWTPH === null? "":routeInfo.DischargeDWTPH;
                    let discharge_TPH = routeInfo.DischargeTPH === null? "":routeInfo.DischargeTPH;
                    let discharge_Sun_Holiday = routeInfo.DischargeSunHoliday === null? "":routeInfo.DischargeSunHoliday;
                    let ENDes  = routeInfo.ENDes === null? "":routeInfo.ENDes;
                    let CNDes = routeInfo.CNDes === null? "":routeInfo.CNDes;
                    // 标题
                    let nameI = $('.routeType_list>.choose').text();
                    let nameII = $('.oneRoute_List>.choose').text();
                    console.log(nameI + "." + nameII);
                    let title = $('#routeInfo>.fleet_title>span');
                    title.text(nameI + " / " + nameII);
                    title.attr("routeId", routeId);

                    // 标准出发港显示
                    let standardDeparturePort_span = $('#routeInfo .routePort_Start>.routePoint_infoShow');
                    standardDeparturePort_span.val(""); // 初始化
                    // standardDeparturePort_span.text(""); // 初始化
                    if(standardDeparturePortID !== '') {
                        console.log(standardDeparturePortID);
                        let departure_port = AllPortBasicList[standardDeparturePortID];
                        standardDeparturePort_span.val(departure_port.ENName);
                        // standardDeparturePort_span.text(departure_port.ENName);
                        standardDeparturePort_span.attr("portID",  standardDeparturePortID);
                        standardDeparturePort_span.attr("lon", departure_port.LongitudeNumeric);
                        standardDeparturePort_span.attr("lat", departure_port.LatitudeNumeric);
                        allDeparturePortList.push(standardDeparturePortID)
                    }
                    // 标准目的港显示
                    let standardArrivalPort_span = $('#routeInfo .routePort_End>.routePoint_infoShow');
                    standardArrivalPort_span.val(""); // 初始化
                    // standardArrivalPort_span.text(""); // 初始化
                    if(standardArrivalPortID !== ''){
                        console.log(standardArrivalPortID);
                        let arrival_port = AllPortBasicList[standardArrivalPortID];
                        standardArrivalPort_span.val(arrival_port.ENName);
                        // standardArrivalPort_span.text(arrival_port.ENName);
                        standardArrivalPort_span.attr("portID",  standardArrivalPortID);
                        standardArrivalPort_span.attr("lon",  arrival_port.LongitudeNumeric);
                        standardArrivalPort_span.attr("lat",  arrival_port.LatitudeNumeric);
                        allArrivalPortList.push(standardArrivalPortID);
                    }
                    // 显示目的港口和出发港口列表
                    $(".StartEndPort_List>li:not(.add_port)").remove();// 清空信息初始化
                    // 出发港列表
                    if(departurePort !== null && departurePort !== ""){
                        let departurePortList = departurePort.split("#");
                        for(let i = 0; i < departurePortList.length; i++ ){
                            let portID = departurePortList[i];
                            allDeparturePortList.push(portID);
                            let port = AllPortBasicList[portID];
                            let port_li =  '<li portID='+ portID+'><span>'+ port.ENName + '</span><i class="close"></i></li>';
                            $("#routeInfo .routeStartPort_Select .StartEndPort_List").append(port_li)
                        }
                    }
                    // 目的港列表
                    if(arrivalPort !== null && arrivalPort !== ""){
                        let arrivalPortList = arrivalPort.split("#");
                        for(let i = 0; i < arrivalPortList.length; i++ ){
                            let portID = arrivalPortList[i];
                            allArrivalPortList.push(portID);
                            console.log(portID);
                            let port = AllPortBasicList[portID];
                            let port_li =  '<li portID='+ portID+'><span>'+ port.ENName + '</span><i class="close"></i></li>';
                            $("#routeInfo .routeEndPort_Select .StartEndPort_List").append(port_li)
                        }
                    }
                    let info_li = $(".routeInfo_List>li");
                    // 填上输入值
                    // 基本信息
                    info_li.eq(0).children('input').val(DWT);
                    info_li.eq(1).children('input').val(draft);
                    info_li.eq(2).children('input').val(max_age);
                    info_li.eq(3).children('input').val(weight);
                    // $(".routeInfo_List>li:nth-child(4)>input").val(draft);
                    // 装载港信息
                    info_li.eq(5).children('input').val(loadingWaitTime);
                    info_li.eq(6).children('input').val(load_TPH);
                    info_li.eq(7).children('input').val(load_DTPH);
                    // $(".routeInfo_List>li:nth-child(8)>input").val(load_Sun_Holiday);
                    // 装载港信息
                    info_li.eq(10).children('input').val(dischargeWaitTime);
                    info_li.eq(11).children('input').val(discharge_TPH);
                    info_li.eq(12).children('input').val(discharge_DTPH);
                    // $(".routeInfo_List>li:nth-child(13)>input").val(discharge_Sun_Holiday);
                    // 周日假期休息框
                    // 装载
                    // console.log(load_Sun_Holiday);
                    if(load_Sun_Holiday === "1"){
                        // console.log("here");
                        info_li.eq(8).children('input').prop("checked", true)
                    }
                    else{
                        // info_li.eq(7).children('input').removeAttr("checked")
                        info_li.eq(8).children('input').prop("checked", false)
                    }
                    //卸载
                    if(discharge_Sun_Holiday === "1"){
                        info_li.eq(13).children('input').prop("checked", true)
                    }
                    else{
                        info_li.eq(13).children('input').prop("checked", false)
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
    }
    // 期租(Lease)
    else if(type === "L"){
        console.log("期租");
        allDeparturePortList = [];
        allArrivalPortList = [];
        $.ajax({
            url: "/route/getLeaseRouteDetailInfo",
            type: "get",
            data: {RouteId: routeId},
            success: function (data) {
                if (data[0] === '200') {
                    console.log("获取数据成功");
                    let routeInfo = data[1][0]; // 航线信息
                    // 标题
                    let nameI = $('.routeType_list>.choose').text();
                    let nameII = $('.oneRoute_List>.choose').text();
                    console.log(nameI + "." + nameII);
                    let title = $('#LeaseRouteInfo>.fleet_title>span');
                    title.text(nameI + " / " + nameII);
                    title.attr("routeId", routeId);
                    // 交船还船范围
                    let deliveryArea = routeInfo.DeliveryArea;
                    let deliveryLon = routeInfo.DeliveryCenterLon === null? 0 : routeInfo.DeliveryCenterLon;
                    let deliveryLat = routeInfo.DeliveryCenterLat === null? 0 : routeInfo.DeliveryCenterLat;
                    let redeliveryArea = routeInfo.RedeliveryArea;
                    let redeliveryLon = routeInfo.RedeliveryCenterLon === null? 0 : routeInfo.RedeliveryCenterLon;
                    let redeliveryLat = routeInfo.RedeliveryCenterLat === null? 0 : routeInfo.RedeliveryCenterLat;
                    // 交船还船港口
                    let deliveryPort = routeInfo.DeliveryPort;
                    let redeliveryPort = routeInfo.RedeliveryPort;
                    // 船舶基本信息
                    let DWT = routeInfo.DWT === null? "":routeInfo.DWT;
                    let LOA = routeInfo.LOA === null? "":routeInfo.LOA;
                    let beam = routeInfo.Beam === null? "":routeInfo.Beam;
                    let draft =  routeInfo.Draft === null? "":routeInfo.Draft;
                    let max_age = routeInfo.MaxAge === null?"":routeInfo.MaxAge;
                    let volume = routeInfo.Volume === null?"":routeInfo.Volume;
                    // 航线信息
                    let weight = routeInfo.Weight === null?"":routeInfo.Weight;
                    let commission = routeInfo.Commission === null?"":routeInfo.Commission;
                    let min_lease_term = routeInfo.Min_Lease_Term === null?"":routeInfo.Min_Lease_Term;
                    let max_lease_term = routeInfo.Max_Lease_Term === null?"":routeInfo.Max_Lease_Term;
                    let no_diesel_at_sea = routeInfo.No_Diesel_At_Sea === null?'0':routeInfo.No_Diesel_At_Sea;
                    // 航速
                    let emptyLoad_Speed = routeInfo.EmptyLoad_Speed===null?'':routeInfo.EmptyLoad_Speed;
                    let fullLoad_Speed = routeInfo.FullLoad_Speed===null?'':routeInfo.FullLoad_Speed;
                    // 油耗
                    let emptyLoad_Fuel_Consumption = routeInfo.EmptyLoad_Fuel_Consumption === null? '':routeInfo.EmptyLoad_Fuel_Consumption;
                    let fullLoad_Fuel_Consumption = routeInfo.FullLoad_Fuel_Consumption === null? '':routeInfo.FullLoad_Fuel_Consumption;
                    // 描述信息
                    let ENDes  = routeInfo.ENDes === null? "":routeInfo.ENDes;
                    let CNDes = routeInfo.CNDes === null? "":routeInfo.CNDes;

                    // 交船区域显示
                    let delivery_ele = $("#LeaseRouteInfo .routePort_Start>.routePoint_infoShow");
                    delivery_ele.val(deliveryArea);
                    // delivery_ele.text(deliveryArea);
                    delivery_ele.attr("lon", deliveryLon);
                    delivery_ele.attr("lat", deliveryLat);
                    // 还船区域显示
                    let redelivery_ele = $("#LeaseRouteInfo .routePort_End>.routePoint_infoShow");
                    redelivery_ele.val(redeliveryArea);
                    // redelivery_ele.text(redeliveryArea);
                    redelivery_ele.attr("lon", redeliveryLon);
                    redelivery_ele.attr("lat", redeliveryLat);
                    // 交船港口显示
                    let delivery_port_ul = $("#LeaseRouteInfo .routeStartPort_Select>span>.StartEndPort_List");
                    delivery_port_ul.empty();
                    if(deliveryPort !== null && deliveryPort !== ''){
                        let deliveryPortList = deliveryPort.split("#");
                        let port_li = '';
                        for(let i =0; i < deliveryPortList.length; i++){
                            let portID = deliveryPortList[i];
                            allDeparturePortList.push(portID);
                            let port = AllPortBasicList[portID];
                            if(port !== undefined) {
                                port_li += '<li portID=' + portID + '><span>' + port.ENName + '</span><i class="close"></i></li>';
                            }
                        }
                        delivery_port_ul.append(port_li)
                    }
                    // 还船港口显示
                    let redelivery_port_ul = $("#LeaseRouteInfo .routeEndPort_Select>span>.StartEndPort_List");
                    redelivery_port_ul.empty();
                    if(redeliveryPort !== null && redeliveryPort !== ''){
                        let redeliveryPortList = redeliveryPort.split("#");
                        let port_li = '';
                        for(let i =0; i < redeliveryPortList.length; i++){
                            let portID = redeliveryPortList[i];
                            allArrivalPortList.push(portID);
                            let port = AllPortBasicList[portID];
                            if(port !== undefined) {
                                port_li += '<li portID=' + portID + '><span>' + port.ENName + '</span><i class="close"></i></li>';
                            }
                        }
                        redelivery_port_ul.append(port_li)
                    }
                    // 显示货物信息
                    // getRouteCargoList(routeId);
                    // 信息显示
                    let info_li = $(".LeaseRouteInfo_List>li");
                    info_li.eq(0).children('input').val(weight);
                    info_li.eq(1).children('input').val(commission);
                    info_li.eq(2).children('input').eq(0).val(min_lease_term);
                    info_li.eq(2).children('input').eq(1).val(max_lease_term);
                    info_li.eq(3).children('input').val(max_age);
                    info_li.eq(4).children('input').val(DWT);
                    info_li.eq(5).children('input').val(volume);
                    info_li.eq(6).children('input').val(LOA);
                    info_li.eq(7).children('input').val(beam);
                    info_li.eq(8).children('input').val(draft);
                    // 海上耗油的设置
                    if(no_diesel_at_sea === "0"){
                        info_li.eq(9).children('input').prop("checked", false);
                    }
                    else{
                        info_li.eq(9).children('input').prop("checked", true);
                    }
                    info_li.eq(10).children('input').val(emptyLoad_Speed);
                    info_li.eq(11).children('input').val(emptyLoad_Fuel_Consumption);
                    info_li.eq(12).children('input').val(fullLoad_Speed);
                    info_li.eq(13).children('input').val(fullLoad_Fuel_Consumption);
                    // 中英文说明
                    $(".LeaseRouteDes>.routeDes_Chinese>textarea").val(CNDes);
                    $(".LeaseRouteDes>.routeDes_English>textarea").val(ENDes);
                }
                else{
                    console.log(data);
                }
            }
        });
        $('#LeaseRouteInfo').fadeIn(300);
    }
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

$(".LeaseRouteInstall_CancelBtn").click(function(){
    $('#LeaseRouteInfo').fadeOut(300); //界面消失
    routeStatus = false; // 退出航线模式
    current.getSource().clear(); // 清空临时层
});


// 这本来应该定位到相应的地方, 但是前提是两个标准港口必须要有相应的位置
/**
 * 出发港增加港口
 */
// $(".add_StartPort").click(function () {
//     let startPort = $('.routePort_Start>.routePoint_infoShow');
//     let lon = startPort.attr("lon");
//     let lat = startPort.attr("lat");
//     let closePortList = getClosePortList(lon, lat, AllPortBasicList, 20);
//     // console.log(closePortList);
//     /* 港口列表模块 */
//     let startPort_ul = $(".startPort");
//     startPort_ul.empty();
//     for(let i = 0; i < closePortList.length; i++){
//         let port = closePortList[i];
//         startPort_ul.append('<li portID="'+ port.PortID+'">'+port.ENName+'</li>');
//     }
// });

/**
 * 目的港增加港口
 */
$(".add_EndPort").click(function () {
    let endPort = $('.routePort_Start>.routePoint_infoShow');
    let lon = endPort.attr("lon");
    let lat = endPort.attr("lat");
    let closePortList = getClosePortList(lon, lat, AllPortBasicList, 20);
    // console.log(closePortList);
    /* 港口列表模块 */
    let endPort_ul = $(".endPort");
    endPort_ul.empty();
    for(let i = 0; i < closePortList.length; i++){
        let port = closePortList[i];
        endPort_ul.append('<li portID="'+ port.PortID+'">'+port.ENName+'</li>');
    }
});

/**
 *
 */
$('.StartEndPort_List').delegate('li>.close', 'click', function () {
   let port_li = $(this).parent();
   let current_feature;
    // port_li.remove(); // 将相应的li删除
    // 然后重新计算相应的停泊区域, 将PortID对应的PortID删除了
    // let m = 0;
    let portID = port_li.attr("portID");
    let current_features = current.getSource().getFeatures();
    for(let i =0; i< current_features.length; i++){
        let feature = current_features[i];
        if(feature.get('port_id') === portID){
            // m++;
            current_feature = feature;
            // current_feature.set("type", "toChoose");
            // current_feature.setStyle(port_nor);
            break;
        }
    }
    removePort(port_li, current_feature);
    // console.log(current_feature.get('port_id'));

    // removePort(portID, current_feature);
});

/**
 * 点击定位按钮事件
 * 定位到相应位置
 * 进入航线模式，泊位图标可点击
 */
$('.routePort_Select i').click(function () {
    let info_span = $(this).prev();
    let info_div = $(this).parent();
    let port_class = info_div.attr("class");
    let lon = parseFloat(info_span.attr("lon"));
    let lat = parseFloat(info_span.attr("lat"));
    // 定位至港口相应的位置
    let view = map.getView();
    // view.setZoom(14);
    let pan = ol.animation.pan({
        //动画持续时间
        duration: 2000,
        source:view.getCenter()
    });
    //在地图渲染之前执行平移动画
    map.beforeRender(pan);
    view.setCenter(ol.proj.fromLonLat([lon, lat]));
    // 放大动画
    let zoom = ol.animation.zoom({
        duration: 2000,
        resolution: view.getResolution()
    });
    map.beforeRender(zoom);
    view.setZoom(14);
    // map.getView().setZoom(14);
    // 进入航线模式
    routeStatus = true;
    // 清空临时操作层
    current.getSource().clear();
    // let title = $(this).parent().parent().parent().prev().;
    // let title = $('#LeaseRouteInfo>.fleet_title>span');
    // let routeId = title.attr("routeId");
    let type = routeId[0];
    // 显示相关的港口, 以供选择
    // let r = 50; // 默认程租是50km
    // if(type === 'L'){
    //     // 期租范围比较大
    //     r = 1000
    // }
    let r = 100000000000000000000;
    // 显示有关的港口
    showRelatePort(lon, lat, r);
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
    // console.log("选择港口" + standardPortID);
    // 显示
    // 高亮已增加的港口和泊位
    updateBerth2Port(allPortList);
});

/**
 * 程租点击保存
 */
$('.routeInstall_SaveBtn').click(function () {
    let departurePort = "";
    let departure_li = $("#routeInfo .routeStartPort_Select .StartEndPort_List>li");
    for(let i = 0; i< departure_li.length;i++){
        if(i > 0){
            departurePort += "#";
        }
        let portID =  departure_li.eq(i).attr("portID");
        departurePort += portID;
    }
    // 目的港口
    let arrivalPort = "";
    let arrival_li = $("#routeInfo .routeEndPort_Select .StartEndPort_List>li");
    for(let i = 0; i< arrival_li.length;i++){
        if(i > 0){
            arrivalPort += "#";
        }
        portID =  arrival_li.eq(i).attr("portID");
        arrivalPort += portID;
    }
    let info_li = $(".routeInfo_List>li");
    let DWT = info_li.eq(0).children('input').val();
    let draft = info_li.eq(1).children('input').val();
    let max_age = info_li.eq(2).children('input').val();
    let weight = info_li.eq(3).children('input').val();
    weight = weight === ''?'null' : weight;
    let loadingWaitTime = info_li.eq(5).children('input').val();
    let load_TPH = info_li.eq(6).children('input').val();
    let load_DTPH = info_li.eq(7).children('input').val();
    let dischargeWaitTime = info_li.eq(10).children('input').val();
    let dischargeTPH = info_li.eq(11).children('input').val();
    let discharge_DTPH = info_li.eq(12).children('input').val();
    let load_Sun_Holiday = "0";
    if(info_li.eq(8).children('input').prop("checked")){
        load_Sun_Holiday  = "1";
    }
    let discharge_Sun_Holiday = "0";
    if(info_li.eq(13).children('input').prop("checked")){
        discharge_Sun_Holiday = "1";
    }
    // 中英文说明
    let CNDes = $(".routeDes_Chinese>textarea").val();
    let ENDes = $(".routeDes_English>textarea").val();
    let reqParam = {RouteId:routeId, DeparturePort:departurePort, ArrivalPort:arrivalPort, DWT: DWT, MaxAge: max_age, Draft:draft,
        LoadingWaitTime:loadingWaitTime, LoadSunHoliday:load_Sun_Holiday, LoadTPH:load_TPH, LoadDWTPH:load_DTPH,
        DischargeWaitTime:dischargeWaitTime, DischargeSunHoliday: discharge_Sun_Holiday, DischargeDWTPH: discharge_DTPH,
        DischargeTPH: dischargeTPH, ENDes:ENDes, CNDes:CNDes, Weight: weight};
    // console.log(reqParam);
    // let reqParam = {};
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
    $('#routeInfo').fadeOut(300); //界面消失
    routeStatus = false; // 退出航线模式
    current.getSource().clear(); // 清空临时层
});

/**
 * 期租航线保存
 */
$('.LeaseRouteInstall_SaveBtn').click(function () {
    // let title = $('#LeaseRouteInfo>.fleet_title>span');
    // 获取routeId
    // let routeId = title.attr("routeId");
    // 交船信息
    let delivery_ele = $("#LeaseRouteInfo .routePort_Start>.routePoint_infoShow");
    let deliveryArea = delivery_ele.val();
    // let deliveryArea = delivery_ele.text();
    let deliveryLon = delivery_ele.attr("lon");
    let deliveryLat = delivery_ele.attr("lat");
    // 还船信息
    let redelivery_ele = $("#LeaseRouteInfo .routePort_End>.routePoint_infoShow");
    let redeliveryArea = redelivery_ele.val();
    // let redeliveryArea = redelivery_ele.text();
    let redeliveryLon = redelivery_ele.attr("lon");
    let redeliveryLat = redelivery_ele.attr("lat");
    // 交船港口
    let deliveryPort = '';
    let delivery_li = $("#LeaseRouteInfo .routeStartPort_Select>span>.StartEndPort_List>li");
    let delivery_lon_sum = 0;
    let delivery_lat_sum = 0;
    let delivery_num = 0;
    let redelivery_lon_sum = 0;
    let redelivery_lat_sum = 0;
    let redelivery_num = 0;
    for(let i = 0; i< delivery_li.length;i++){
        if(i > 0){
            deliveryPort += "#";
        }
        let portID =  delivery_li.eq(i).attr("portID");
        let port = AllPortBasicList[portID];
        let lon = parseFloat(port.LongitudeNumeric);
        let lat = parseFloat(port.LatitudeNumeric);
        if(isNaN(lon) || isNaN(lat)){
            continue;
        }
        delivery_num += 1;
        delivery_lon_sum += lon;
        delivery_lat_sum += lat;
        deliveryPort += portID;
    }
    if(delivery_num > 0){
        deliveryLon = delivery_lon_sum / delivery_num;
        deliveryLat = delivery_lat_sum / delivery_num;
    }
    // 还船港口
    let redeliveryPort = '';
    let redelivery_li = $("#LeaseRouteInfo .routeEndPort_Select>span>.StartEndPort_List>li");
    for(let i = 0; i< redelivery_li.length;i++){
        if(i > 0){
            redeliveryPort += "#";
        }
        let portID =  redelivery_li.eq(i).attr("portID");
        let port = AllPortBasicList[portID];
        let lon = parseFloat(port.LongitudeNumeric);
        let lat = parseFloat(port.LatitudeNumeric);
        if(isNaN(lon) || isNaN(lat)){
            continue;
        }
        redelivery_num += 1;
        redelivery_lon_sum += lon;
        redelivery_lat_sum += lat;
        redeliveryPort += portID;
    }
    if(redelivery_num > 0) {
        redeliveryLon = redelivery_lon_sum / redelivery_num;
        redeliveryLat = redelivery_lat_sum / redelivery_num;
    }
    let info_li = $(".LeaseRouteInfo_List>li");
    let weight = info_li.eq(0).children('input').val();
    let commission = info_li.eq(1).children('input').val();
    let min_lease_term = info_li.eq(2).children('input').eq(0).val();
    let max_lease_term = info_li.eq(2).children('input').eq(1).val();
    let max_age = info_li.eq(3).children('input').val();
    let DWT = info_li.eq(4).children('input').val();
    let volume = info_li.eq(5).children('input').val();
    let LOA = info_li.eq(6).children('input').val();
    let beam = info_li.eq(7).children('input').val();
    let draft = info_li.eq(8).children('input').val();
    let no_diesel_at_sea = info_li.eq(9).children('input').prop("checked") === true? "1":"0";
    let emptyLoad_Speed = info_li.eq(10).children('input').val();
    let emptyLoad_Fuel_Consumption = info_li.eq(11).children('input').val();
    let fullLoad_Speed = info_li.eq(12).children('input').val();
    let fullLoad_Fuel_Consumption = info_li.eq(13).children('input').val();
    // 中英文说明
    let CNDes = $(".LeaseRouteDes>.routeDes_Chinese>textarea").val();
    let ENDes = $(".LeaseRouteDes>.routeDes_English>textarea").val();
    let reqParam = {RouteId:routeId, DeliveryArea:deliveryArea, RedeliveryArea:redeliveryArea, DeliveryCenterLon: deliveryLon,
        DeliveryCenterLat:deliveryLat, RedeliveryCenterLon: redeliveryLon, RedeliveryCenterLat: redeliveryLat, DeliveryPort: deliveryPort,
        RedeliveryPort: redeliveryPort, Weight: weight, Commission:commission, Min_Lease_Term: min_lease_term, Max_Lease_Term: max_lease_term,
        DWT: DWT, MaxAge: max_age, Draft:draft, Volume: volume, LOA: LOA, Beam: beam, No_Diesel_At_Sea:no_diesel_at_sea,
        EmptyLoad_Speed: emptyLoad_Speed, EmptyLoad_Fuel_Consumption: emptyLoad_Fuel_Consumption,FullLoad_Speed:fullLoad_Speed,
        FullLoad_Fuel_Consumption: fullLoad_Fuel_Consumption, ENDes:ENDes, CNDes:CNDes
    };
    $.ajax({
        url:'/route/saveLeaseRouteDetailInfo',
        type: "get",
        dataType: 'json',
        data: reqParam,
        success:function (data) {
            console.log(data[1])
        },
        error:function (err) {
            console.log(err);
        }
    });
    // // 保存货物信息
    // let choose_ele_list = $('.route_CargoType>ul').find("input:checked");
    // let cargoList = [];
    // console.log(choose_ele_list.length);
    // for(let j = 0; j < choose_ele_list.length; j++){
    //     // console.log(choose_ele_list.eq(j).attr("id"));
    //     cargoList.push(choose_ele_list.eq(j).attr("id"));
    // }
    // // console.log(cargoList);
    // $.ajax({
    //     url: '/route/saveCargoInfo',
    //     type: 'get',
    //     data: {RouteId: routeId, CargoList: cargoList},
    //     success: function (data) {
    //         console.log(data[1])
    //     },
    //     error: function (err) {
    //         console.log(err);
    //     }
    // });
    $('#LeaseRouteInfo').fadeOut(300); //界面消失
    routeStatus = false; // 退出航线模式
    current.getSource().clear(); // 清空临时层
});




/**
 * 期租航线货物选择
 */
// 输入下拉框
$('.LeaseRouteInfo_List>li:nth-child(1)>span:nth-child(2)').click(function(){
    $(this).next('ul').slideDown(200);
});

$('.LeaseRouteInfo_List>li:nth-child(1)').mouseleave(function(){
    $(this).children('ul').slideUp(200);
});
// //货物多选按钮
// $('.LeaseRouteInfo_List>li:nth-child(3)>ul>li').click(function(){
//     let CargoTextArr = [];
//     let CargoTextStr = '';
//     let CargoTextLength = $(this).parent().find('input:checked').length;
//     for(let i=0;i<CargoTextLength;i++){
//         if(i>0){CargoTextStr+='、';}
//         let CargoText = $(this).parent().find('input:checked').eq(i).parent().text();
//         CargoTextArr.push(CargoText);
//         CargoTextStr += CargoText;
//     }
//     // console.log(CargoTextArr);
//     // console.log(CargoTextStr);
//     $(this).parent().prev().children('input').val(CargoTextStr);
//     $(this).parent().prev().children('span').text('('+CargoTextLength+')');
//     // changeBerthSaveButton(true);
// });
// 货物多选的选择
$('.route_CargoType>ul').delegate("li", "click", function(){
    // console.log("here");
    let CargoTextArr = [];
    let CargoTextStr = '';
    let CargoTextLength = $(this).parent().find('input:checked').length;
    for(let i=0;i<CargoTextLength;i++){
        if(i>0){CargoTextStr+=", ";}
        let CargoText = $(this).parent().find('input:checked').eq(i).parent().text();
        CargoTextArr.push(CargoText);
        CargoTextStr += CargoText;
    }
    let cargo_ele = $(this).parent().prev();
    cargo_ele.children('input').val(CargoTextStr);
    cargo_ele.children('span').text('('+ CargoTextLength+ ')');
    changeBerthSaveButton(true);
});