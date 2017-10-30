/**
 * Created by Truth on 2017/9/5.
 * 航次管理
 */



/**
 * 根据复选框显示信息
 */
var lastFleetNumber = "";
var lastToCheckStatus = true;
var lastCheckedStatus = false;

// 保存和确认信息
var standardGoodsStatus = false;
var standardRouteStatus = false;
var voyageBtn_ConfirmStatus = false;
var voyageBtn_saveStatus = false;

//
// var purposeMap = {};
var purposeMap = [];
var cargoMap = [];

/**
 * 更新是否已经确认的信息
 */
function updateByCheckSelect(){
    var toCheckStatus = $(".voyage_toCheck").prop("checked");
    var checkedStatus = $(".voyage_checked").prop("checked");
    if(lastToCheckStatus !== toCheckStatus){
        if (!toCheckStatus) {
            $(".voyageList_content>.toCheck").hide()
        }
        else{
            $(".voyageList_content>.toCheck").show()
        }
        lastToCheckStatus = toCheckStatus
    }
    if(lastCheckedStatus !== checkedStatus){
        // 如果没勾上的话
        var checked = $(".voyageList_content>.checked");
        console.log(checked);
        if (!checkedStatus){
            checked.hide() // 默认隐藏已经确认的选项
        }
        // checked.find("span").css("color", "#1aea1a");
        else{
            checked.show()
        }
        lastCheckedStatus = checkedStatus
    }
}

/**
 * 更新航次列表
 */
function updateVoyageList(fleetNumber){
    $(".voyageList_content").empty(); // 初始化
    lastFleetNumber = fleetNumber;
    var voyageList = $("#voyageList_List");
    $.ajax({
        url: "/voyageManagement/getVoyageList",
        data: {FleetNumber: fleetNumber},
        type: "GET",
        beforeSend: function () {
            console.log("loading");
            voyageList.css("background", 'url("/images/ajax-loader.gif") no-repeat center');
        },
        success: function (data) {
            if (data[0] === "200") {
                console.log("获取数据成功");
                var result = data[1];
                var voyage_ul = ""; // 列表元素
                for (var i = 0; i < result.length; i++) {
                    var ele = result[i];
                    var shipName = ele.LocalName.trim();
                    if(shipName === ''){
                        shipName = ele.Name
                    }
                    var startPortName = "";
                    var stopPortName = "";
                    var startPort = AllPortBasicList[ele.DeparturePortID];
                    var stopPort = AllPortBasicList[ele.ArrivalPortID];
                    if (startPort !== undefined) {
                        startPortName = startPort.ENName;
                    }
                    if (stopPort !== undefined) {
                        stopPortName = stopPort.ENName;
                    }
                    var startTime = getRealTime(ele.DepartureTime).slice(0, 10);
                    var stopTime = getRealTime(ele.ArrivalTime).slice(0, 10);
                    var checked = ele.Checked;
                    if (checked === "1") {
                        voyage_ul += "<li class=checked ShipNumber=" + ele.ShipNumber + " voyageID=" + ele.VoyageKey + "><span>" + shipName + "</span>" +
                            "<span>" + ele.IMO + "</span><span>" + startPortName + "</span><span>" + startTime + "</span><span>" +
                            stopPortName + "</span><span>" + stopTime + "</span></li>";
                    } else {
                        voyage_ul += "<li class=toCheck ShipNumber=" + ele.ShipNumber + " voyageID=" + ele.VoyageKey + "><span>" + shipName + "</span>" +
                            "<span>" + ele.IMO + "</span><span>" + startPortName + "</span><span>" + startTime + "</span><span>" +
                            stopPortName + "</span><span>" + stopTime + "</span></li>";
                    }
                    // $(".voyageList_content").append(voyage_li);
                }
                var voyageList_ul = $(".voyageList_content");
                voyageList_ul.append(voyage_ul);
                voyageList_ul.children(".checked").hide(); // 默认隐藏已经确认的
                voyageList_ul.find('li:nth-child(n+51)').hide(); // 默认只显示50条
            }
        },
        complete: function () {
            console.log("加载结束");
            voyageList.css("background", ""); // 清除背景
        }
    })
}

/**
 * 根据操作更新确认信息
 */
function updateCheckInfo(){
    // voyageBtn_saveStatus = true;
    updateSaveStatus(true);
    var saveButton = $(".voyageBtn_SaveOrConfirm");
    var checkedNum = $(".oneVoyageInfo>ul .checked").length;
    if(checkedNum === 3){
        console.log("三项全部确认");
        voyageBtn_ConfirmStatus = true;
        // standardGoodsStatus  = true;
        // standardRouteStatus = true;
        // var saveButton = $(".voyageBtn_SaveOrConfirm")
        // var detailButton = $(".voyageDetails_btn");
        // saveButton.css("background", "#4d90fe");// 蓝底
        // saveButton.css("color", "#FFF"); // 白字
        saveButton.text("确认");
    }
    else{
        voyageBtn_ConfirmStatus = false;
        // standardGoodsStatus  = false;
        // standardRouteStatus = false;
        // var routeAndGoods = $(".voyageBtn_StandardRoute, .voyageBtn_StandardGoods");
        // routeAndGoods.css("background", "#ccc"); // 灰底
        // routeAndGoods.css("color", "#060205"); // 黑字
        // updateSaveStatus();
        saveButton.text("保存");
    }
}

/**
 * 改变保存状态
 */
function updateSaveStatus(voyageBtn_saveStatus) {
    var saveButton = $(".voyageBtn_SaveOrConfirm");
    if(voyageBtn_saveStatus){
        saveButton.css("background", "#4d90fe");// 蓝底
        saveButton.css("color", "#FFF"); // 白字
    }
    else{
        saveButton.css("background", "#ccc"); // 灰底
        saveButton.css("color", "#060205"); // 黑字
        saveButton.text("保存");
    }
}

/**
 * 获取一艘船的历史航次列表
 */
function getVoyageList2Ship(shipNumber, voyageKey){
    /* 显示历史航次列表 */
    var voyageList2Ship_ele = $('.shipVoyageList_List');
    // 初始化
    voyageList2Ship_ele.css("width", 0);
    voyageList2Ship_ele.empty();
    $.ajax({
        url:'/voyageManagement/getVoyageList2Ship',
        type:'GET',
        data: {ShipNumber: shipNumber},
        dataType: 'json',
        success: function (data) {
            var signal = data[0];
            var content = data[1];
            if(signal === '200'){
                var li_str = '';
                for(var i = 0; i< content.length; i++){
                    var info = content[i];
                    var departureTime = getRealTime(info.DepartureTime).slice(0, 10);
                    li_str += '<li><div voyageKey=' + info.VoyageKey + '></div><span>' + departureTime + '</span></li>'
                }
                voyageList2Ship_ele.append(li_str);
                voyageList2Ship_ele.css("width", 80 * content.length);
                /* 将图标定位当前时间点 */
                var div_ele =  voyageList2Ship_ele.find('li>div[voyageKey="' + voyageKey +'"]');
                console.log(div_ele);
                div_ele.attr('class', 'active');
                var seq =  voyageList2Ship_ele.children('li').index(div_ele.parent()) + 1;
                console.log('-' + Math.floor(seq / 7) * 560);
                voyageList2Ship_ele.css('margin-left', '-' + Math.floor(seq / 7) * 560 + 'px')
            }else{
                console.log(content);
            }
        }
    });
}
//
// '<select><option value="01">装货</option>' +
// '<option value="02" selected="selected">卸货' +
// '<option value="03">加油</option>' +
// '<option value="04">补给</option>' +
// '<option value="05">修船</option>' +
// '<option value="06">不明</option>' +
// '<option value="07">航行</option>' +
// '<option value="08">暂停</option></select>';


// var purposeMap = {"01": '装货', "02": '卸货', "03": '加油', "04": '补给',
//     "05": '修船', "06": '不明', "07": '航行', "08": '暂停'};
function getPurposeMap() {
    $.ajax({
        url: '/voyageManagement/getPurpose',
        type:'GET',
        dataType: 'json',
        success: function (data) {
            var signal = data[0];
            var content = data[1];
            if(signal === '200'){
                purposeMap = content;
                // for(var i = 0; i < content.length; i++){
                //     var info = content[i];
                //     purposeMap[info.ID] = info.Purpose;
                // }
            }
            else{
                console.log(content);
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
}
getPurposeMap(); // 获取用途


/**
 * 获取货物类型
 */
function getCargoMap() {
    $.ajax({
        url: '/berth/getCargoType',
        type:'GET',
        dataType: 'json',
        success: function (data) {
            var signal = data[0];
            var content = data[1];
            if(signal === '200'){
                cargoMap = content;
                // for(var i = 0; i < content.length; i++){
                //     var info = content[i];
                //     cargoMap[info.ID] = info.Name;
                // }
            }
            else{
                console.log(content);
            }
        },
        error: function (err) {
            console.log(err);
        }
    })
}

getCargoMap(); // 获取货物类型



/**
 * 获取航次内容
 * @param voyageKey
 */
function getVoyageContent(voyageKey) {
    updateSaveStatus(false); // 保存按钮初始化
    $("#voyageDetails").find(".fleet_title").attr('voyageKey', voyageKey);
    /* 获取航次具体内容 */
    var info_li = $('.oneVoyageInfo>ul>li');
    $.ajax({
        url:'/voyageManagement/getVoyage',
        type:'GET',
        data: {VoyageKey: voyageKey},
        dataType: 'json',
        success: function (data) {
            var signal = data[0];
            var content = data[1][0];
            if( signal === '200'){
                /* 显示标题 */
                var checked = content.Checked;
                var check_ele = $(".voyage_title>span:nth-child(2)");
                console.log(typeof checked);
                if(checked === '0'){
                    check_ele.text("(未确认)");
                }
                else{
                    check_ele.text("(已确认)");
                    // 显示为绿色
                    check_ele.css({'color':'#00ff00'});
                }
                // 显示详细内容
                var shipName = content.LocalName;
                if(shipName === '' || shipName === ' '){
                    shipName = content.Name
                }
                var cargo = content.Cargo;
                var cargoChecked = content.CargoChecked;
                var departurePortID = content.DeparturePortID;
                var departurePort = AllPortBasicList[departurePortID];
                var departurePortName = '';
                if(departurePort !== undefined) {
                    departurePortName = departurePort.ENName;
                }
                var departurePortChecked = content.DeparturePortChecked;
                var departureTime = content.DepartureTime;
                var arrivalPortID = content.ArrivalPortID;
                var arrivalPortName = '';
                var arrivalPort = AllPortBasicList[arrivalPortID];
                if(arrivalPort !== undefined){
                    arrivalPortName = arrivalPort.ENName;
                }
                var arrivalPortChecked = content.ArrivalPortChecked;
                var arrivalTime = content.ArrivalTime;
                /* 航线展示 */
                var MMSI = content.MMSI;
                // console.log(MMSI);
                getDetailRoute(MMSI, departureTime, arrivalTime);
                /* 表信息填充 */
                info_li.eq(0).children('input').val(shipName); // 船名
                info_li.eq(1).text('IMO: ' + content.IMO); // IMO
                var cargo_select = $('.cargo_type_list');
                cargo_select.empty();
                // 货物
                var cargo_ele = '<select><option value="00"></option>';
                for(var i = 0; i < cargoMap.length; i++){
                    var cargo_info = cargoMap[i];
                    var key = cargo_info.ID;
                    if(key === cargo){
                        cargo_ele += '<option value=' + key + ' selected="selected">' +  cargo_info.Name + '</option>'
                    }
                    else{
                        cargo_ele += '<option value=' + key + '>' + cargo_info.Name + '</option>'
                    }
                }
                // for(var key in cargoMap){
                //     if(key === cargo){
                //         cargo_ele += '<option value=' + key + ' selected="selected">' + cargoMap[key] + '</option>'
                //     }
                //     else{
                //         cargo_ele += '<option value=' + key + '>' + cargoMap[key] + '</option>'
                //     }
                // }
                cargo_ele += '</select>';
                cargo_select.append(cargo_ele);
                // 货物确认信息
                var cargo_checked_ele = cargo_select.next();
                if(cargoChecked === '1'){
                    cargo_checked_ele.attr('class', 'checked');
                }
                else{
                    cargo_checked_ele.attr('class', 'toCheck');
                }
                // 吨位信息
                info_li.eq(3).children('input').val(content.DWT);
                /* 出港 */
                // 出发港
                var departure_ele = info_li.eq(4).children('input');
                departure_ele.val(departurePortName);
                departure_ele.attr('portID', departurePortID);
                // 出发港确认信息
                var departure_checked_ele = departure_ele.next();
                if(departurePortChecked === '1'){
                    departure_checked_ele.attr('class', 'checked');
                }
                else{
                    departure_checked_ele.attr('class', 'toCheck');
                }
                // 出港时间
                var departure_time_ele = departure_checked_ele.next();
                // departure_time_ele.text(departureTime);
                departure_time_ele.text(getRealTime(departureTime));
                /* 抵港 */
                // 抵达港
                var arrival_ele = info_li.eq(5).children('input');
                arrival_ele.val(arrivalPortName);
                arrival_ele.attr('portID', arrivalPortID);
                // 抵达港确认信息
                var arrival_checked_ele = arrival_ele.next();
                if(arrivalPortChecked === '1'){
                    arrival_checked_ele.attr('class', 'checked');
                }
                else{
                    arrival_checked_ele.attr('class', 'toCheck');
                }
                // 抵港时间
                var arrival_time_ele = arrival_checked_ele.next();
                arrival_time_ele.text(getRealTime(arrivalTime));
            }
            else{
                console.log(content)
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
    /* 获得航次详细流水信息 */
    // 初始化
    var voyageDetail_ele = $('.oneVoyage_DockedList');
    voyageDetail_ele.empty();
    $.ajax({
        url: '/voyageManagement/getVoyageDetail',
        type:'GET',
        data: {VoyageKey: voyageKey},
        dataType: 'json',
        success: function (data) {
            var signal = data[0];
            var content = data[1];
            if( signal === '200'){
                var li_str = '';
                for(var i = 0; i< content.length; i++){
                    var info = content[i];
                    var purpose = info.Purpose;
                    var select_ele = '<select>';
                    for(var j = 0; j < purposeMap.length; j++){
                        var purpose_info = purposeMap[j];
                        var key = purpose_info.ID;
                        if(key === purpose){
                            select_ele += '<option value=' + key + ' selected="selected">' + purpose_info.Purpose + '</option>'
                        }
                        else{
                            select_ele += '<option value=' + key + '>' + purpose_info.Purpose + '</option>'
                        }
                    }
                    // for(var key in purposeMap){
                    //     if(key === purpose){
                    //         select_ele += '<option value=' + key + ' selected="selected">' + purposeMap[key] + '</option>'
                    //     }
                    //     else{
                    //         select_ele += '<option value=' + key + '>' + purposeMap[key] + '</option>'
                    //     }
                    // }
                    select_ele += '</select>';
                    var departureTime = info.DepartureTime;
                    var arrivalTime = info.ArrivalTime;
                    var stationaryAreaKey = info.StationaryAreaKey;
                    var duration_second = arrivalTime - departureTime;
                    console.log(duration_second);
                    var duration = getDuration(duration_second); // 获得历时多长时间
                    // 做相应处理
                    li_str += '<li duration=' + duration_second + ' purpose=' + purpose + ' stationaryAreaKey=' + stationaryAreaKey +
                        ' DepartureTime=' + departureTime+ ' ArrivalTime=' + arrivalTime +'><span>' + (i + 1) +
                        '</span><span>'+ getRealTime(departureTime).slice(0, 16) + '至' + getRealTime(arrivalTime).slice(0, 16) + '</span><span>' +
                        duration + '</span><span>' + select_ele + '</span><div class="oneVoyage_EndBtn" style="display: none;">航次结束</div></li>'
                }
                voyageDetail_ele.append(li_str);
                /* 计算统计量 */
                // 加油总时长
                var loadTime = 0;
                var dischargeTime = 0;
                var refuelTime = 0;
                var supplyTime = 0;
                var repairTime = 0;
                var unknownTime = 0;
                var loadWaitTime = 0;
                var dischargeWaitTime = 0;
                var parkTotalTime = 0;
                var totalTime = arrivalTime - departureTime;
                var li_ele = $('.oneVoyage_DockedList>li');
                for(var j = 0; j < li_ele.length; j++){
                    var ele = li_ele.eq(j);
                    var sn_purpose = ele.attr('purpose');
                    var sn_duration = parseInt(ele.attr('duration'));
                    parkTotalTime += sn_duration;
                    switch(sn_purpose){
                        case '01':
                            loadTime += sn_duration;
                            break;
                        case '02':
                            dischargeTime += sn_duration;
                            break;
                        case '03':
                            refuelTime += sn_duration;
                            break;
                        case '04':
                            supplyTime += sn_duration;
                            break;
                        case '05':
                            repairTime += sn_duration;
                            break;
                        case '06':
                            unknownTime += sn_duration;
                            break;
                        case '07':
                            loadWaitTime += sn_duration;
                            break;
                        case '08':
                            dischargeWaitTime += sn_duration;
                            break;
                        default:
                            console.log("目的不纯");
                    }
                }
                var sailingTime = totalTime - parkTotalTime;
                info_li.eq(6).text('航行时长：' + getDuration(sailingTime));
                // info_li.eq(7).text('航速：' )
                // // info_li.eq(8).text('航程：' + content.Mileage);
                info_li.eq(9).text('停泊总时长：' + getDuration(parkTotalTime));
                info_li.eq(10).text('加油时长：' + getDuration(refuelTime));
                info_li.eq(11).text('补给时长：' + getDuration(supplyTime));
                info_li.eq(12).text('修船时长：' + getDuration(repairTime));
                info_li.eq(13).text('未明时长：' + getDuration(unknownTime));
                info_li.eq(14).text('装货时长：' + getDuration(loadTime));
                info_li.eq(15).text('装货等待时长：' + getDuration(loadWaitTime));
                info_li.eq(16).text('卸货时长：' + getDuration(dischargeTime));
                info_li.eq(17).text('卸货等待时长：' + getDuration(dischargeWaitTime));
            }
        },
        error: function (err) {
            console.log(err);
        }

    })
}






/**************************************************************分割线*******************************************/

/**
 * 地图弹出框拖动事件
 */
var voyageListDown = false; //航次列表弹出框
var voyageDetailsDown = false; //航次详情弹出框
var voyageStandardRouteDown = false; //标准航线管理弹出框
var voyageStandardGoodsDown = false; //船舶备注信息管理弹出框
var DivLeft;
var DivTop;

$('.fleet_title').mousedown(function(event){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId=='voyageList'){voyageListDown = true;}
    if(changeDivId=='voyageDetails'){voyageDetailsDown = true;}
    if(changeDivId=='voyage_StandardRoute'){voyageStandardRouteDown = true;}
    if(changeDivId=='voyage_StandardGoods'){voyageStandardGoodsDown = true;}
    DivLeft = event.clientX - $(this).offset().left;
    DivTop = event.clientY - $(this).offset().top;
});
var fleetDivZIndex = 0;

$('#voyageList,#voyageDetails,#voyage_StandardRoute,#voyage_StandardGoods').click(function(){
    fleetDivZIndex++;
    $(this).css('zIndex',fleetDivZIndex);
});

$('.fleet_title').mouseup(function(){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId=='voyageList'){voyageListDown = false;}
    if(changeDivId=='voyageDetails'){voyageDetailsDown = false;}
    if(changeDivId=='voyage_StandardRoute'){voyageStandardRouteDown = false;}
    if(changeDivId=='voyage_StandardGoods'){voyageStandardGoodsDown = false;}
    $(this).css('cursor','auto');
});

$(window).mousemove(function(event){
    var newLeft = event.clientX-DivLeft;
    var newTop = event.clientY-DivTop;
    if(newLeft<=0){newLeft = 0;}
    if(newTop<=0){newTop = 0;}
    if(voyageListDown){
        if(newLeft>$(document).width()-$('#voyageList>.fleet_title').width()){newLeft = $(document).width()-$('#voyageList>.fleet_title').width();}
        if(newTop>$(window).height()-$('#voyageList>.fleet_title').height()){newTop = $(window).height()-$('#voyageList>.fleet_title').height();}
        $('#voyageList').offset({top:newTop,left:newLeft});
    }else if(voyageDetailsDown){
        if(newLeft>$(document).width()-$('#voyageDetails>.fleet_title').width()){newLeft = $(document).width()-$('#voyageDetails>.fleet_title').width();}
        if(newTop>$(window).height()-$('#voyageDetails>.fleet_title').height()){newTop = $(window).height()-$('#voyageDetails>.fleet_title').height();}
        $('#voyageDetails').offset({top:newTop,left:newLeft});
        // updateCalenderPosition();
    }else if(voyageStandardRouteDown){
        if(newLeft>$(document).width()-$('#voyage_StandardRoute>.fleet_title').width()){newLeft = $(document).width()-$('#voyage_StandardRoute>.fleet_title').width();}
        if(newTop>$(window).height()-$('#voyage_StandardRoute>.fleet_title').height()){newTop = $(window).height()-$('#voyage_StandardRoute>.fleet_title').height();}
        $('#voyage_StandardRoute').offset({top:newTop,left:newLeft});
    }else if(voyageStandardGoodsDown){
        if(newLeft>$(document).width()-$('#voyage_StandardGoods>.fleet_title').width()){newLeft = $(document).width()-$('#voyage_StandardGoods>.fleet_title').width();}
        if(newTop>$(window).height()-$('#voyage_StandardGoods>.fleet_title').height()){newTop = $(window).height()-$('#voyage_StandardGoods>.fleet_title').height();}
        $('#voyage_StandardGoods').offset({top:newTop,left:newLeft});
    }
});

/**
 * 点击航次管理按钮实现
 */
$(".route_Voyage_btn").click(function () {
    console.log("航次管理");
    // 默认
    var defaultFleetNumber = "F2";
    updateVoyageList(defaultFleetNumber);
    var voyageList = $("#voyageList");
    fleetDivZIndex++;
    console.log(fleetDivZIndex);
    voyageList.css('zIndex',fleetDivZIndex);
    voyageList.fadeIn(500);
    $('.route_List_ul').fadeOut(300);
    $(".Fleet_List_ul").fadeOut(300);
    // 隐藏船队相关弹出框和标准航线相关弹出框
    $("#fleet").fadeOut(300);
    $("#shipDetails").fadeOut(300);
    $("#routeInfo").fadeOut(300);
    $("#LeaseRouteInfo").fadeOut(300);
});

/**
 * 点击船队出现下拉列表
 */
$(".voyageList_select .selected_fleet").click(function () {
    $(".FleetList").slideToggle(300);
});

/**
 * 点击船队列表中元素表示选择
 */
$(".FleetList>li").click(function () {
    $(".FleetList").slideUp(200);
    var select = $(".voyageList_select .selected_fleet");
    var fleetNumber = $(this).attr("FleetNumber");
    select.attr("FleetNumber", fleetNumber);
    select.text($(this).text());
    if(fleetNumber !== lastFleetNumber){
        console.log("新的fleetNumber");
        updateVoyageList(fleetNumber)
    }
});


/**
 * 离开列表区域
 */
$(".fleet_select").mouseleave(function () {
    $(".FleetList").slideUp(300);
});

/**
 * 点击复选框会刷新列表
 */
$(".voyage_toCheck, .voyage_checked").click(function () {
    updateByCheckSelect()
});

/**
 * 点击航次列表的每一行获取航次详情
 */
$(".voyageList_content").delegate("li", "click", function (event) {
    fleetDivZIndex++;
    var voyageDetails = $('#voyageDetails');
    voyageDetails.css('zIndex',fleetDivZIndex);
    var voyageKey = $(this).attr('voyageId');
    var shipNumber = $(this).attr('shipNumber');
    /* 获取历史航次列表 */
    getVoyageList2Ship(shipNumber, voyageKey);
    /* 获取具体内容 */
    getVoyageContent(voyageKey);
    event.stopPropagation();
    voyageDetails.fadeIn(300);
});



// 历史列表点击右箭头
$('.shipVoyageList_rightbtn').click(function(){
    var timePoint_ul = $('.shipVoyageList_List');
    var timeLeft = parseInt(timePoint_ul.css('margin-left'));
    var width = parseInt(timePoint_ul.css("width"));
    if(timeLeft - 560 + width  > 0) {
        timePoint_ul.animate({"margin-left" : "-=560"}, 300);
    }
});

// 历史列表点击左箭头
$('.shipVoyageList_leftbtn').click(function(){
    var timePoint_ul = $('.shipVoyageList_List');
    var timeLeft = parseInt(timePoint_ul.css('margin-left'));
    if(timeLeft < 0){
        timePoint_ul.animate({"margin-left" : "+=560"}, 300);
    }
});


//标准货物弹出框——添加按钮单击事件模拟
$('.ProductDifference_addBtn').click(function(){
    $('.StandardGoods_List').append('<ul><li class="ComparedSelect_ProductInfo"><span><select>' +
        '<option value="">大商所</option><option value="">巴西</option><option value="">印度</option>' +
        '</select></span><span>00.00%</span><span>00.0000%</span><span>00.0000%</span><span>0.0000%</span><span>0.0000%</span><span>00.0000%</span><span>00.0000%</span><span>+00.00mm:00.00% -00.00mm:00.00% +00.00mm:00.00%</span><span><input type="text" value="品位较高、粒度好，烧结较好，但含碱金属，不宜多用" title="品位较高、粒度好，烧结较好，但含碱金属，不宜多用" disabled></span></li>' +
        '<li class="ProductDifference"><span>差值</span><span>+00.00%</span><span>+00.0000%</span><span>+00.0000%</span><span>+0.0000%</span><span>+0.0000%</span><span>+00.0000%</span><span>+00.0000%</span><span>符合</span><span></span></li>' +
        '<div class="ProductDifference_ModulusCount"><div><span>吨位:</span> <input type="text" value="000.00%"></div> ' +
        '<div><span>价格:</span> <input type="text"></div> <div><span>总系数:</span> <span>000.00%</span></div></div>' +
        '</ul>');
    var nowWidth = parseInt($('#voyage_StandardGoods').height());
    $('#voyage_StandardGoods').css('height',nowWidth+59);
});


/**
 * 确认小按钮的切换
 */
$(".oneVoyageInfo>ul").delegate(".checked", "click", function () {
    console.log("here");
    $(this).attr("class", "toCheck");
    updateCheckInfo();
});


$(".oneVoyageInfo>ul").delegate(".toCheck", "click", function () {
    $(this).attr("class", "checked");
    updateCheckInfo();
});

/**
 * 点击标准航线按钮
 */
$(".voyageBtn_StandardRoute").click(function (event) {
    if (standardRouteStatus) {
        console.log("标准航线");
        fleetDivZIndex++;
        console.log(fleetDivZIndex);
        var standardRouteDetails = $("#voyage_StandardRoute");
        standardRouteDetails.css('zIndex',fleetDivZIndex);
        event.stopPropagation();
        standardRouteDetails.fadeIn(300)
    }
});

/**
 * 点击标准货物按钮
 */
$(".voyageBtn_StandardGoods").click(function(event){
    if(standardGoodsStatus){
        console.log("标准货物");
        // 等待数据填充
        fleetDivZIndex++;
        console.log(fleetDivZIndex);
        var standardGoodsDetails = $("#voyage_StandardGoods");
        standardGoodsDetails.css('zIndex',fleetDivZIndex);
        event.stopPropagation();
        standardGoodsDetails.fadeIn(300)
    }
});


/**
 * 确认或保存按钮点击之后都是会保存的
 */
$(".voyageBtn_SaveOrConfirm").click(function(){
    var voyage_checked = "0"; // 初始化为0
    // voyageBtn_saveStatus = false; // 状态发生改变
    var title = $("#voyageDetails").find(">.fleet_title>span:nth-child(2)");
    var routeAndGoods = $(".voyageBtn_StandardRoute, .voyageBtn_StandardGoods");
    // 如果当前是确认, 保存相应信息
    if(voyageBtn_ConfirmStatus){
        $(".voyageBtn_SaveOrConfirm").text("保存");
        voyage_checked = "1"; // check状态信息
        title.text("(已确认)");
        // 标准航线和标准货物可点击
        standardGoodsStatus  = true;
        standardRouteStatus = true;
        routeAndGoods.css("background", "#4d90fe");// 蓝底
        routeAndGoods.css("color", "#FFF"); // 白字
    }
    else{
        title.text("(未确认)");
        // 标准航线和标准货物不能点击
        standardGoodsStatus  = false;
        standardRouteStatus = false;
        routeAndGoods.css("background", "#ccc"); // 灰底
        routeAndGoods.css("color", "#060205"); // 黑字
    }
    updateSaveStatus(false); // 更新保存按钮状态
    /* 保存航次信息 */
    var voyageKey = $("#voyageDetails").find('.fleet_title').attr('voyageKey');

});


/**
 * 监听select的变化
 */
$(".oneVoyageInfo").delegate("select", "change", function () {
    // console.log("change");
    // voyageBtn_saveStatus = true;
    updateSaveStatus(true); // 更新保存按钮状态
});


/**
 * 监听DWT的变化
 */
$(".oneVoyageInfo .DWT").bind("input", function () {
    // voyageBtn_saveStatus = true;
    updateSaveStatus(true); // 更新保存按钮状态
});


/**
 * 悬浮在停靠列表上时会出现结束航次按钮
 */
$(".oneVoyage_DockedList").delegate('li', 'mouseover', function () {
    console.log('here');
    var endButton = $(this).find(".oneVoyage_EndBtn");
    endButton.css("display", "block");
});

/**
 * 离开列表
 */
$(".oneVoyage_DockedList").delegate('li', 'mouseout', function () {
    console.log('here');
    var endButton = $(this).find(".oneVoyage_EndBtn");
    endButton.css("display", "none");
});

/**
 * 点击结束航次
 */
$(".oneVoyage_DockedList").delegate(".oneVoyage_EndBtn", "click", function () {
    console.log("结束航次");
    updateSaveStatus(true);
    $(this).parent().nextAll().remove();
    // 更新上面的信息
});

/**
 * 标准航线取消按钮
 */
$(".StandardRoute_CancelBtn").click(function () {
    $("#voyage_StandardRoute").fadeOut(300)
});

/**
 * 标准货物取消按钮
 */
$(".StandardGoods_CancelBtn").click(function () {
    $("#voyage_StandardGoods").fadeOut(300)
});


// 滚动条事件加载
$('.voyageList_content').scroll(function(){
    //获取滚动距离
    var scrollTop = $(this).scrollTop();
    console.log(scrollTop);
    //获取当前显示的长度
    var show_number = $(this).children('li').not('[style="display: none;"]').size();
    console.log(show_number);
    var AllWidth = show_number * 20;
    // var AllWidth = $(this).children('li').length * 20;
    console.log(AllWidth);
    //300是安全距离，保证滚动条不处于最下方时才开始执行更多，为400时未显示的剩余8行，不低于260
    if(scrollTop>AllWidth-300 && show_number < $(this).children('li').size()){
        console.log('显示更多');
        $(this).children('li').slice(show_number, show_number + 50).show()
    }
});


/**
 * 历史航次中点击图标
 */
$('.shipVoyageList_List').delegate('li>div', 'click', function () {
    if($(this).attr('class') !== 'active'){
        // 图标变化
        $('.shipVoyageList_List>li>div').removeClass('active');
        $(this).attr('class', 'active');
        var voyageKey = $(this).attr('voyageKey');
        getVoyageContent(voyageKey);
    }
});


// /**
//  * 点击保存或者确认按钮
//  */


