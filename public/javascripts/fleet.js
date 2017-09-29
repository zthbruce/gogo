/**
 * Created by Truth on 2017/8/14.
 */

// 船队操作的相关函数
getBasicFleetInfo();
//
function getBasicFleetInfo(){
    $.ajax({
        url: '/fleet/getFleetBasicInfo',
        type: 'get',
        success: function (data) {
            if(data[0] === "200") {
                // console.log(data[1]);
                fleetBasicInfo = data[1];
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
}

// /**
//  * 获得船队的基本信息
//  */
// function getBasicFleetInfo(fleetType){
//     $.ajax({
//         url: '/fleet/getFleetBasicInfo',
//         type: 'get',
//         success: function (data) {
//             if(data[0] === "200") {
//                 // console.log(data[1]);
//                 fleetBasicInfo = data[1];
//                 var fleet_ul = $(".FleetName_List");
//                 // var fleet_ul =  $('.'+fleetName);
//                 //列表第一次需要初始化
//                 fleet_ul.empty();
//                 var fleetInfo = fleetBasicInfo[fleetType];
//                 for(var i = 0; i< fleetInfo.length; i++){
//                     var info = fleetInfo[i];
//                     // console.log(info);
//                     var fleetNumber = info.FleetNumber;
//                     var number = info.Number;
//                     var name = info.ENName === ""?info.CNName: info.ENName;
//                     // fleet_ul.append('<li fleetNumber=' + fleetNumber + '>' + name + '<i>(' + number + ')</i></li>')
//                     fleet_ul.append('<li fleetNumber=' + fleetNumber + ' fleetName=' + name + ' number=' + number + '>' + name + '(' + number + ')</li>')
//                 }
//                 // 显示船队信息
//                 fleet_ul.css('display','none');
//                 fleet_ul.css('display','block');
//             }
//         },
//         error: function (err) {
//             console.log(err);
//         }
//     });
// }

function getFleetInfo(fleetNumber, timePoint) {
    console.log(timePoint);
    var fleet_div = $('#fleet');
    var shipList = fleet_div.find('.fleetList_List');
    shipList.empty();
    // 船队列表信息
    $.ajax({
        url: '/fleet/getFleetDetailInfo',
        type: 'get',
        data: {FleetNumber: fleetNumber, TimePoint: timePoint},
        beforeSend:function () {
            console.log("loading");
            shipList.css("background", 'url("/images/ajax-loader.gif") no-repeat center');
        },
        success: function (data){
            // 获取成功
            // console.log("获取数据成功");
            if(data[0] === "200") {
                console.log("获取数据成功");
                var fleetDetailInfo = data[1];
                var DWT_Sum = 0;
                var DWT_add = 0;
                var DWT_less = 0;
                var num_add = 0;
                var num_less = 0;
                // var checkedNum = 0;
                // fleetBasicInfo = data[1];
                var shipInfoStr = "";
                for(var i = 0; i < fleetDetailInfo.length; i++){
                    var detailInfo = fleetDetailInfo[i];
                    var MMSI = detailInfo.MMSI === null?"":detailInfo.MMSI;
                    var DWT = detailInfo.DWT;
                    // var type = detailInfo.LEVEL3EN === ""? detailInfo.LEVEL2EN: detailInfo.LEVEL3EN;
                    var type = detailInfo.Type;
                    var today = new Date();
                    var this_year = today.getFullYear();
                    var shipAge = this_year - parseInt(detailInfo.BuiltDate.slice(0, 4));
                    // console.log(detailInfo.ShipStatus);
                    var shipStatus = ShipStatusInfo[detailInfo.ShipStatus];
                    var leaveOrJoin = '';
                    var joinTime = detailInfo.JoinTime;
                    var leaveTime = detailInfo.LeaveTime;
                    var shipCheck =  detailInfo.Checked === '0' ? "toCheck" : "checked" ;
                    console.log(detailInfo.Checked);
                    if(joinTime === timePoint){
                        console.log("joinTime:" + joinTime);
                        leaveOrJoin = "join";
                        DWT_add += DWT;
                        num_add += 1;
                    }
                    if(leaveTime === timePoint){
                        console.log(leaveTime + ":" + timePoint);
                        console.log("已经离开");
                        leaveOrJoin = "leave";
                        DWT_less += DWT;
                        num_less += 1;
                    }
                    var shipInfo_li = '<li class=' + leaveOrJoin +'><span>' + type + '</span><span>' + detailInfo.IMO + '</span><span>' + MMSI +
                        '</span><span>' + detailInfo.ShipName + '</span><span>' + DWT + '</span><span>' + shipAge + '</span><span>' +
                        shipStatus + '</span><span><i class= "shipDetailInfo" shipNumber=' + detailInfo.ShipNumber + '></i></span><span><i class= "' + shipCheck+ '"></i></span><span><i class="shipDelete"></i></span></li>';
                    if(leaveOrJoin !== ""){
                        shipInfoStr =  shipInfo_li + shipInfoStr;
                    }
                    else{
                        shipInfoStr +=  shipInfo_li;
                    }
                    // 总吨重
                    DWT_Sum += DWT;
                }
                /* 显示列表 */
                shipList.append(shipInfoStr);
                shipList.find('li:nth-child(n+51)').hide(); // 默认只显示50条
                /* 列表下栏 */
                // 确认数
                $(".fleetInfo_total>.fleetInfo_checkedNum").remove(); // 初始化
                if(timePoint==="~"){
                    $(".fleetInfo_total").prepend('<div class="fleetInfo_checkedNum"><span>已确认:</span> <span>' + $('.FleetName_List>.choose>i:nth-child(1)').text() + '</span></div>')
                    // $('.fleetInfo_total>.fleetInfo_checkedNum>span:nth-child(2)').text($('.FleetName_List>.choose>i:nth-child(1)').text());
                }
                // 总船舶数目
                $('.fleetInfo_total>.fleetInfo_Num>span:nth-child(2)').text(fleetDetailInfo.length - num_less);
                // fleet_div.find('.fleetInfo_Num>span:nth-child(2)').text(fleetDetailInfo.length - num_less);
                $(".fleet_AddNumBtn").text("+" + num_add);
                $('.fleet_LessNumBtn').text("-" + num_less);
                // 总吨位
                fleet_div.find('.fleetInfo_DWT>span:nth-child(2)').text(DWT_Sum - DWT_less);
                // 吨位增减
                $(".fleet_AddDWTBtn").text("+" + DWT_add);
                $(".fleet_LessDWTBtn").text("-" + DWT_less);
            }
            else{
                console.log(data[1]);
            }
        },
        error: function (err) {
            console.log(err);
        },
        complete:function(){
            console.log("加载结束");
            shipList.css("background", ""); // 清除背景
        }
    });
}

/**
 * 获取船队船舶列表
 * @param fleetNumber 船舶
 * @param timePoint 时间点
 */
function getShipList2Fleet(fleetNumber, timePoint){
    $(".fleetList_List").attr("timepoint", "~"); // 标记时间信息
    getFleetInfo(fleetNumber, timePoint); // 上表中获得船队信息
    // console.log(timePoint);
    // var fleet_div = $('#fleet');
    // var shipList = fleet_div.find('.fleetList_List');
    // shipList.empty();
    // // 船队列表信息
    // $.ajax({
    //     url: '/fleet/getFleetDetailInfo',
    //     type: 'get',
    //     data: {FleetNumber: fleetNumber, TimePoint: timePoint},
    //     beforeSend:function () {
    //         console.log("loading");
    //         shipList.css("background", 'url("/images/ajax-loader.gif") no-repeat center');
    //     },
    //     success: function (data){
    //         // 获取成功
    //         // console.log("获取数据成功");
    //         if(data[0] === "200") {
    //             console.log("获取数据成功");
    //             var fleetDetailInfo = data[1];
    //             var DWT_Sum = 0;
    //             var DWT_add = 0;
    //             var DWT_less = 0;
    //             var num_add = 0;
    //             var num_less = 0;
    //             // var checkedNum = 0;
    //             // fleetBasicInfo = data[1];
    //             var shipInfoStr = "";
    //             for(var i = 0; i < fleetDetailInfo.length; i++){
    //                 var detailInfo = fleetDetailInfo[i];
    //                 var MMSI = detailInfo.MMSI === null?"":detailInfo.MMSI;
    //                 var DWT = detailInfo.DWT;
    //                 // var type = detailInfo.LEVEL3EN === ""? detailInfo.LEVEL2EN: detailInfo.LEVEL3EN;
    //                 var type = detailInfo.Type;
    //                 var today = new Date();
    //                 var this_year = today.getFullYear();
    //                 var shipAge = this_year - parseInt(detailInfo.BuiltDate.slice(0, 4));
    //                 // console.log(detailInfo.ShipStatus);
    //                 var shipStatus = ShipStatusInfo[detailInfo.ShipStatus];
    //                 var leaveOrJoin = '';
    //                 var joinTime = detailInfo.JoinTime;
    //                 var leaveTime = detailInfo.LeaveTime;
    //                 var shipCheck =  detailInfo.Checked === '0' ? "toCheck" : "checked" ;
    //                 console.log(detailInfo.Checked);
    //                 if(joinTime === timePoint){
    //                     console.log("joinTime:" + joinTime);
    //                     leaveOrJoin = "join";
    //                     DWT_add += DWT;
    //                     num_add += 1;
    //                 }
    //                 if(leaveTime === timePoint){
    //                     console.log(leaveTime + ":" + timePoint);
    //                     console.log("已经离开");
    //                     leaveOrJoin = "leave";
    //                     DWT_less += DWT;
    //                     num_less += 1;
    //                 }
    //                 var shipInfo_li = '<li class=' + leaveOrJoin +'><span>' + type + '</span><span>' + detailInfo.IMO + '</span><span>' + MMSI +
    //                     '</span><span>' + detailInfo.ShipName + '</span><span>' + DWT + '</span><span>' + shipAge + '</span><span>' +
    //                     shipStatus + '</span><span><i class= "shipDetailInfo" shipNumber=' + detailInfo.ShipNumber + '></i></span><span><i class= "' + shipCheck+ '"></i></span><span><i class="shipDelete"></i></span></li>';
    //                 if(leaveOrJoin !== ""){
    //                     shipInfoStr =  shipInfo_li + shipInfoStr;
    //                 }
    //                 else{
    //                     shipInfoStr +=  shipInfo_li;
    //                 }
    //                 // 总吨重
    //                 DWT_Sum += DWT;
    //             }
    //             /* 显示列表 */
    //             shipList.append(shipInfoStr);
    //             shipList.find('li:nth-child(n+51)').hide(); // 默认只显示50条
    //             /* 列表下栏 */
    //             // 确认数
    //             $(".fleetInfo_total>.fleetInfo_checkedNum").remove(); // 初始化
    //             if(timePoint==="~"){
    //                 $(".fleetInfo_total").prepend('<div class="fleetInfo_checkedNum"><span>已确认:</span> <span>' + $('.FleetName_List>.choose>i:nth-child(1)').text() + '</span></div>')
    //                 // $('.fleetInfo_total>.fleetInfo_checkedNum>span:nth-child(2)').text($('.FleetName_List>.choose>i:nth-child(1)').text());
    //             }
    //             // 总船舶数目
    //             $('.fleetInfo_total>.fleetInfo_Num>span:nth-child(2)').text(fleetDetailInfo.length - num_less);
    //             // fleet_div.find('.fleetInfo_Num>span:nth-child(2)').text(fleetDetailInfo.length - num_less);
    //             $(".fleet_AddNumBtn").text("+" + num_add);
    //             $('.fleet_LessNumBtn').text("-" + num_less);
    //             // 总吨位
    //             fleet_div.find('.fleetInfo_DWT>span:nth-child(2)').text(DWT_Sum - DWT_less);
    //             // 吨位增减
    //             $(".fleet_AddDWTBtn").text("+" + DWT_add);
    //             $(".fleet_LessDWTBtn").text("-" + DWT_less);
    //         }
    //         else{
    //             console.log(data[1]);
    //         }
    //     },
    //     error: function (err) {
    //         console.log(err);
    //     },
    //     complete:function(){
    //         console.log("加载结束");
    //         shipList.css("background", ""); // 清除背景
    //     }
    // });
    // 搜索列表的展现
    $.ajax({
        url: '/fleet/getLastRecord',
        type: 'get',
        data:{User: 'blm'},
        success: function (data) {
            if(data[0] === "200"){
                var info = data[1][0];
                // 将记录赋值
                var type =  info.shipType;
                var typeName = info.CNName === ''? info.ENName: info.CNName;
                var status = info.ShipStatus;
                var min_DWT = info.min_DWT;
                var max_DWT = info.max_DWT;
                var type_ele = $(".ShipSearch .Search_typeText");
                type_ele.attr("shipType", type);
                type_ele.val(typeName);
                var status_ele = $('.Search_statusText');
                status_ele.attr("type", status);
                // console.log(status);
                status_ele.val(ShipStatusInfo[status]);
                $(".ShipSearch  .min_dwt").val(min_DWT);
                $(".ShipSearch  .max_dwt").val(max_DWT);
                $(".search_ship_List").empty();
                // 实现直接搜索
                // getSearchShipList(type, status, min_DWT, max_DWT);
                var search_shipNum_ele = $('.searchInfo_total>.fleetInfo_Num>span:nth-child(2)');
                search_shipNum_ele.text(0);
            }
        },
        error: function (err) {
            console.log(err);
        }
        }
    )
}

/**
 * 获取相应船队的历史时间点
 * @param fleetNumber
 */
function getTimePointList(fleetNumber){
    var timePoint_ul = $(".TimePointList");
    timePoint_ul.empty();
    $.ajax({
        url: '/fleet/getFleetTimePoint',
        type: 'get',
        data: {FleetNumber: fleetNumber},
        success: function (data) {
            if(data[0] === "200"){
                var info = data[1];
                // 设置时间点的宽度
                timePoint_ul.css("width", info.length * 80);
                for(var i = 0; i< info.length; i++){
                    var ele = info[i];
                    timePoint_ul.append('<li><span>' + ele.JoinTime + '</span><i></i></li>');
                }
            }
            else{
                console.log(data[1])
            }
        }, error: function (err) {
            console.log(err)
        }
    })
}



/**
 * 图片自动播放
 */
// 每一张图片的宽度
var li_width = 140;
function imageAutoShow() {
    autoShow = setInterval(function () {
        showImage();
    },3000)
}

/**
 * 根据索引显示图片
 *
 */

function showImage() {
    console.log(curIndex);
    console.log(imageNum);
    if(curIndex < imageNum){
        $(".shipInfo_imgShow>ul").animate({left: 0 - curIndex * li_width}, 1000);
        curIndex++;
    }
    else {
        // $(".shipInfo_imgShow>ul").animate({left: 0}, 200);
        $(".shipInfo_imgShow>ul").css("left", 0);
        curIndex = 1;
    }
    // else if(curIndex < 0){
    //     curIndex = imageNum - 1;
    //     $(".shipInfo_imgShow>ul").css("right", 0)
    // }
}

/**
 * 根据输入的名字前缀匹配
 */
function getTypeList() {
    console.log("输入信息");
    var nowVal = search_input.val();
    var type_ul = search_input.next("ul");
    // 清空列表
    type_ul.empty();
    // 做一下规范化,将" '等符号正则化
    nowVal = nowVal.replace(/[\'\"]/g, "");
    $.ajax({
        url: "/fleet/getSearchTypeList",
        data:{Name:nowVal},
        type: "get",
        success:function (data) {
            if(data[0] === "200"){
                console.log("获取类型数据成功");
                var typeList = data[1];
                for(var i = 0; i< typeList.length;i++){
                    var typeInfo = typeList[i];
                    var typeKey = typeInfo.TypeKey;
                    var name = typeInfo.CNName === ""? typeInfo.Name:typeInfo.CNName;
                    var type_li = '<li type=' + typeKey +'>' + name +'</li>';
                    type_ul.append(type_li)
                }
            }
            type_ul.slideDown(200)
        },
        err:function (err) {
            console.log(err);
        }
    })
}

/**
 * 将船从船队中移除
 */
function removeShipFromFleet(shipNumber) {
    // 从该船队中删除该船
    $.ajax({
        url:"/fleet/removeShip",
        type:"get",
        data:{ShipNumber: shipNumber},
        success: function (data) {
            if(data[0] === "200"){
                console.log(data[1])
            }
        }
    });
    // 更新船队总信息
    getBasicFleetInfo()
}


function changeSaveStatus(status) {
    saveStatus = status;
    if(status){
        $(".shipInfo_updateBtn").css("background", "#217BA2")
    }
    else{
        $(".shipInfo_updateBtn").css("background", "grey")
    }
}


/**
 * 获得格式为 'yyyy-MM-dd HH:MM:SS'
 * @returns {string}
 */
function format(num) {
    var prefix = '';
    if(num>=0 && num <=9)
        prefix = '0';
    return prefix + num

}
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var strMonth = format((date.getMonth() + 1));
    var strDate = format(date.getDate());
    var strHours = format(date.getHours());
    var strMinutes = format(date.getMinutes());
    var strSecond = format(date.getMinutes());
    return date.getFullYear() + seperator1 + strMonth + seperator1 + strDate
        + " " + strHours + seperator2 + strMinutes + seperator2 + strSecond;
}


/**
 * 获得搜索船舶列表
 */
function getSearchShipList(type, status, min_DWT, max_DWT) {
    console.log("开始搜索");
    var shipList = $('.search_ship_List');
    shipList.empty();
    // 显示搜索结果
    $.ajax({
        url: '/fleet/getSearchShipList',
        type: 'get',
        data: {Type: type, Status: status, Min_DWT: min_DWT, Max_DWT: max_DWT},
        beforeSend: function () {
            console.log("loading");
            shipList.css("background", 'url("/images/ajax-loader.gif") no-repeat center');
        },
        success: function (data) {
            // 获取成功
            // console.log("获取数据成功");
            // 初始化
            console.log("加载结束");
            shipList.css("background", ""); // 清除背景
            // var shipListInfo = [];
            var count = 0;
            if (data[0] === "200") {
                var shipListInfo = data[1];
                var shipInfoStr = "";
                count = shipListInfo.length;
                for (var i = 0; i < count; i++) {
                    var detailInfo = shipListInfo[i];
                    var MMSI = detailInfo.MMSI === null ? "" : detailInfo.MMSI;
                    var DWT = detailInfo.DWT;
                    var type = detailInfo.Type;
                    var today = new Date();
                    var this_year = today.getFullYear();
                    var shipAge = this_year - parseInt(detailInfo.BuiltDate.slice(0, 4));
                    var shipStatus = ShipStatusInfo[detailInfo.ShipStatus];
                    shipInfoStr += '<li><span>' + type + '</span><span>' + detailInfo.IMO + '</span><span>' + MMSI +
                        '</span><span>' + detailInfo.ShipName + '</span><span>' + DWT + '</span><span>' + shipAge + '</span><span>' +
                        shipStatus + '</span><span><i class= "shipDetailInfo" shipNumber=' + detailInfo.ShipNumber + '></i></span><span><i class="add"></i></span></li>';
                }
                // console.log(shipInfoStr);
                shipList.append(shipInfoStr); // 增加数据
                shipList.find('li:nth-child(n+51)').hide(); // 默认只显示50条
                // $(".belong2Fleet").hide();
            }
            // 总船舶数目
            var shipNum = $('.searchInfo_total>.fleetInfo_Num>span:nth-child(2)');
            shipNum.text(count);
        },
        error: function (err) {
            console.log(err);
        },
        complete: function () {
            console.log("加载结束");
            shipList.css("background", ""); // 清除背景
        }
    });
}

function saveSearchRecord(type, status, min_DWT, max_DWT) {
    // 将搜索条件入库
    var current_date = getNowFormatDate();
    $.ajax({
        url: '/fleet/saveSearchRecord',
        type: 'get',
        data: {User:'blm', Type: type, Status: status, Min_DWT: min_DWT, Max_DWT: max_DWT, current_date:current_date},
        success: function (data) {
            console.log(data)
        }
    })
}


















/*********************************分割线*******************************************************************************/
// 船队的交互事件
var fleetBasicInfo = {};
var ShipStatusInfo = {'-1':"All", '0': "在建中", '1': "服役中", '2': "维护中", '3': "停航", '4': "已拆解", '5': "未知",
                        '6': "Equasis不更新", '7': 'Equasis不存在', '8': '改建中', '9':'暂停服务', 'A': '即将拆解', 'B':'已下水'};
/*** 船队列表弹出框操作 */
$('.route_Fleet_btn').click(function(){
    $('.ShipType_list').fadeToggle(300);
    $('.FleetName_List').fadeOut(300);
    $('#fleet').fadeOut(600);
    $('#searchShipList').fadeOut(600);
    $('#shipDetails').fadeOut(600);
    //隐藏航线列表和航次列表、航次详情弹出框
    $('.route_List_ul').fadeOut(300);
    $('#routeInfo').fadeOut(600);
    $('#voyageList').fadeOut(600);
    $('#voyageDetails').fadeOut(600);
    $('#voyage_StandardRoute').fadeOut(600);
    $('#voyage_StandardGoods').fadeOut(600);
});

/** 鼠标移动到船队上显示船队的信息*/
$('.ShipType_list>li').mouseenter(function(){
    // 初始化
    $('.ShipType_list>li').removeClass("choose");
    $(this).addClass("choose");
    var fleetType = $(this).attr("id");
    var fleet_ul = $(".FleetName_List");
    fleet_ul.empty();
    // 显示问题
    var fleetInfo = fleetBasicInfo[fleetType];
    for(var i = 0; i< fleetInfo.length; i++){
        var uncheckNum = 0;
        var checkedNum = 0;
        var info = fleetInfo[i];
        // console.log(info);
        var fleetNumber = info.FleetNumber;
        var numberInfo = info.CheckNumInfo.split(" ");
        for(var j = 0; j < numberInfo.length; j++){
            var ele = numberInfo[j].split("#");
            if( ele[0] === "0"){
                uncheckNum = ele[1]
            }
            else{
                checkedNum = ele[1]
            }
        }
        var name = info.ENName === ""?info.CNName: info.ENName;
        var number = parseInt(uncheckNum) + parseInt(checkedNum);
        // fleet_ul.append('<li fleetNumber=' + fleetNumber + '>' + name + '<i>(' + number + ')</i></li>')
        fleet_ul.append('<li fleetNumber=' + fleetNumber + ' fleetName="' + name + '" number=' + number + '>' + name + '(<i>' + checkedNum + "</i> /<i>" +  (parseInt(uncheckNum) + parseInt(checkedNum)) +  '</i>)</li>')
    }
    // 显示船队信息
    fleet_ul.css('display','none');
    fleet_ul.css('display','block');

    // getBasicFleetInfo(fleetType)
});


// 点击船队列表中的船队获取所属船舶列表
$('.FleetName_List').delegate('li', 'click', function () {
    $('.FleetName_List>li').removeClass("choose"); // 清空所有选项
    var fleet_li = $(this);
    var fleetNumber = fleet_li.attr("fleetNumber"); //船队ID
    var fleetName = fleet_li.attr("fleetName"); // 船队名字
    var fleet_div = $('#fleet');
    var fleet_title = fleet_div.find('.fleet_title>span');
    var fleetType = $('.ShipType_list>.choose').text();
    fleet_title.text(fleetName); // 填充船队名字
    fleet_title.attr("fleetNumber", fleetNumber); // 赋上船队Number
    // 选中的那行高亮显示
    $(this).addClass("choose");
    console.log(fleetNumber);
    // 获得时间轴
    getTimePointList(fleetNumber);
    fleetDivZIndex++;
    console.log(fleetDivZIndex);
    fleet_div.css('zIndex',fleetDivZIndex);
    fleet_div.fadeIn(600);
    // 获取船队列表
    getShipList2Fleet(fleetNumber, "~");
});

// 点击船舶列表中的今日按钮
$('.today_btn').click(function () {
    // var fleet_li = $('.current');
    // 充分利用当前所选船队的信息
    $(".TimePointList>li>i").removeClass('selected');
    var fleetNumber = $('.fleet_title>span').attr("fleetNumber"); //船队ID
    getShipList2Fleet(fleetNumber, "~");
    $(".fleetList_List").attr("timepoint", "~")
});

/**
 * 点击时间轴上的图标获取对应时间的内容
 */

$(".TimePointList").delegate('li>i', 'click', function(){
    // console.log($(this).prev().text())
    var timePoint = $(this).prev().text();
    $(".TimePointList>li>i").removeClass('selected');
    $(this).addClass('selected');
    var fleetNumber = $('.fleet_title>span').attr("fleetNumber"); //船队ID
    $(".fleetList_List").attr("timepoint", timePoint);
    getShipList2Fleet(fleetNumber, timePoint);
});
var autoShow;
var curIndex;
var imageNum;
var saveStatus;
// 点击i图标获取船舶的详细信息
$('#fleet').delegate('.shipDetailInfo', 'click', function () {
    changeSaveStatus(false); // 保存状态初始化
    clearInterval(autoShow); // 初始化
    curIndex = 0;
    var imageHost = "http://192.168.0.66/";
    var ship_li = $(this);
    var current_li = ship_li.parent().parent();
    // 高亮显示本行
    $('.fleetList_List>li').removeAttr("id");
    current_li.attr("id", "choose");
    var shipType = current_li.children('span:nth-child(1)').text();
    var IMO = current_li.children('span:nth-child(2)').text();
    var MMSI = current_li.children('span:nth-child(3)').text();
    var shipName = current_li.children('span:nth-child(4)').text();
    var DWT = current_li.children('span:nth-child(5)').text();
    var shipStatus = current_li.children('span:nth-child(7)').text();
    var shipNumber = ship_li.attr("shipNumber");
    // 标题栏
    var shipTitle = $(".shipName");
    shipTitle.text(shipName);
    shipTitle.attr("shipNumber", shipNumber);
    // 图片显示部分
    var shipImageList = $(".shipInfo_imgShow>ul");
    shipImageList.empty();
    // $(".shipInfo_imgShow").css("background", "url('http://192.168.0.66/group1/M00/00/01/wKgAQll6m1OAfTMpAAIj217DXV4158.s.jpg') center no-repeat");
    $.ajax({
        url:'/fleet/getShipImage',
        type:'get',
        data:{IMO:IMO},
        beforeSend:function () {
            console.log("loading image");
            $(".shipInfo_imgShow").css("background", 'url("/images/ajax-loader.gif") no-repeat center');
        },
        success:function (data) {
            if(data[0] === "200"){
                var imageURLList = data[1];
                imageNum = imageURLList.length;
                for(var i = 0; i < imageURLList.length;i++){
                    if(i === 0){
                        var firstImage = imageHost + imageURLList[i].URL;
                        var first_image_li = '<li url='+ firstImage + '></li>';
                    }
                    var bigImageURL = imageHost + imageURLList[i].URL;
                    console.log(bigImageURL);
                    var image_li = '<li url='+ bigImageURL + '></li>';
                    shipImageList.append(image_li);
                    var smallImageURL = bigImageURL.slice(0, -4) + ".s.jpg";
                    $(shipImageList.find('>li:eq('+ i + ')')).css("background","url(" + smallImageURL+ ") center no-repeat");
                }
                // 添加第一张图片
                if(imageNum > 1){
                    shipImageList.append(first_image_li);
                    smallImageURL = firstImage.slice(0, -4) + ".s.jpg";
                    $(shipImageList.find('>li:eq('+ imageURLList.length + ')')).css("background","url(" + smallImageURL+ ") center no-repeat");
                    imageNum ++;
                }
                $(".shipInfo_imgShow>ul").css("width", imageNum * li_width);
            }
        },
        error:function(err){
            console.log(err);
        },
        complete:function(){
            console.log("图片加载结束");
            $(".shipInfo_imgShow").css("background", ""); // 清除背景
            $(".shipInfo_imgShow>ul").css("left", 0);

            if(imageNum > 1){
                imageAutoShow();
            }
        }
    });
    // 具体内容部分
    $.ajax({
        url: '/fleet/getShipDetailInfo',
        type: 'get',
        data:{ShipNumber: shipNumber},
        success: function (data) {
            if(data[0] === "200") {
                // console.log(data[1]);
                var shipInfo = data[1][0];
                var class_notation = shipInfo.CS;
                var builtDate = shipInfo.BuiltDate === null?"":shipInfo.BuiltDate;
                var flag = shipInfo.Flag === null?"":shipInfo.Flag;
                var draft = shipInfo.DesignedDraft === ""? 0 : shipInfo.Draft;
                var PortName = shipInfo.PortName === null?"":shipInfo.PortName;
                var LOA = shipInfo.LOA === null?0 : shipInfo.LOA;
                var beam = shipInfo.BM === null?0:shipInfo.BM;
                // var height = shipInfo.Height === null?0:shipInfo.Height;
                var builder = shipInfo.BuildNumber === null ? "" : shipInfo.BuildNumber;
                var name = shipInfo.ENName === ""?shipInfo.CNName: shipInfo.ENName;
                var source = shipInfo.Source;
                var updateDate = shipInfo.UpdateDate;
                var remarks = shipInfo.Remark === null? "":shipInfo.Remark;
                var joinTime = shipInfo.JoinTime === null?"":shipInfo.JoinTime;
                var leaveTime = shipInfo.LeaveTime === null?"":shipInfo.LeaveTime;
                // 船的详细信息
                $('.shipInfo_List>li:nth-child(1)').text('船名: ' + shipName );
                $('.shipInfo_List>li:nth-child(2)').text('IMO: ' + IMO);
                $('.shipInfo_List>li:nth-child(3)').text('船级社: ' + class_notation);
                $('.shipInfo_List>li:nth-child(4)').text('MMSI: ' + MMSI);
                $('.shipInfo_List>li:nth-child(5)').text('船旗: ' + flag);
                $('.shipInfo_List>li:nth-child(6)').text('建造年代: ' + builtDate);
                $('.shipInfo_List>li:nth-child(7)').text('吃水: ' + draft + ' m');
                $('.shipInfo_List>li:nth-child(8)').text('状态: ' + shipStatus);
                $('.shipInfo_List>li:nth-child(9)').text('DWT: ' + DWT + " t");
                $('.shipInfo_List>li:nth-child(10)').text('类型: ' + shipType);
                $('.shipInfo_List>li:nth-child(11)').text('船籍港: ' + PortName);
                $('.shipInfo_List>li:nth-child(12)').text('长*宽: ' + LOA + '*' + beam + ' m');
                $('.shipInfo_List>li:nth-child(13)').text('Source: ' + source);
                $('.shipInfo_List>li:nth-child(14)').text('更新时间: ' + updateDate);
                $(".remarks").val(remarks);
                // 船的管理公司
                $(".shipInfo_company>ul>li:nth-child(2)").text('建造商: ' + builder);
                // 所属船队
                var fleetName = $("#shipInfo_FleetName");
                fleetName.val(name);
                fleetName.attr("FleetNumber", shipInfo.FleetNumber);
                $("#shipInfo_EnterTime").val(joinTime);
                $("#shipInfo_LeaveTime").val(leaveTime);

                /**
                 * 保存所属船队信息
                 */
                $(".shipInfo_updateBtn").click(function () {
                    if(saveStatus) { // 如果可以保存
                        console.log("保存信息");
                        var fleetNumber = $('#shipInfo_FleetName').attr("fleetNumber");
                        var enterTime_input = $('#shipInfo_EnterTime');
                        var leaveTime_input = $('#shipInfo_LeaveTime');
                        var joinTime = enterTime_input.val();
                        var leaveTime = leaveTime_input.val();
                        var shipNumber = $(".shipName").attr("shipNumber");
                        var remarks = $(".remarks").val(); // 备注信息保存
                        if (fleetNumber !== "") {
                            current_li.find(".toCheck").attr("class", "checked");
                            if(joinTime === ''){
                                joinTime = builtDate; // 如果没填，默认就是建造时间
                                $('#shipInfo_EnterTime').val(joinTime)
                            }
                            var table_name = ship_li.parent().attr('class');
                            // 如果处于船队列表
                            // 如果处于搜索栏，那么删除该搜索记录
                            if(table_name=== 'search_ship_List'){
                                ship_li.remove();
                            }
                            $.ajax({
                                url: '/fleet/saveShip2Fleet',
                                type: 'get',
                                data: {
                                    ShipNumber: shipNumber,
                                    JoinTime: joinTime,
                                    LeaveTime: leaveTime,
                                    FleetNumber: fleetNumber,
                                    Remark: remarks,
                                    Checked: '1'
                                },
                                success: function (data) {
                                    if (data[0] === "200") {
                                        console.log("保存成功");
                                        ship_li.find(".toCheck").attr("class", "checked"); // 本行显示显示为绿色
                                        var fleetList = $(".fleetList_List");
                                        // 刷新列表数据
                                        getFleetInfo(fleetNumber, fleetList.attr("timepoint"));
                                        // 刷新历史时间轴
                                        getTimePointList(fleetNumber);
                                        // 定位至正在操作的那一行, 并高亮显示
                                        var operate_row = fleetList.find("[shipnumber=" + shipNumber + "]").parent().parent();
                                        if(operate_row.length > 0){
                                            $('.fleetList_List>li').removeAttr("id");
                                            operate_row.attr('id', 'choose'); // 高亮显示
                                            operate_row.scrollIntoView(); //滑动至该行
                                        }
                                        // getShipList2Fleet(fleetNumber, '~');
                                        changeSaveStatus(false);
                                    }
                                    else {
                                        console.log("保存失败");
                                    }
                                }
                            })
                        }
                        else {
                            // 如果为空，默认为将该船移除该船队
                            removeShipFromFleet(shipNumber);
                        }
                    }
                });
            }
        },
        error: function (err) {
            console.log(err);
        }
    });
    fleetDivZIndex++;
    console.log(fleetDivZIndex);
    $('#shipDetails').css('zIndex',fleetDivZIndex);
    $('#shipDetails').fadeIn(600);
    event.stopPropagation();
    return false;
    // event.stopImmediatePropagation()
});


// 点击图片向左按钮
$('.imgBtn_left').click(function () {
    console.log("停止自动播放");
    clearInterval(autoShow); // 停止计时
    var image_ul = $(".shipInfo_imgShow>ul");
    // var width = image_ul.css("width");
    // var left = image_ul.css("left");
    curIndex--;
    console.log(curIndex);
    if (curIndex >= 0) {
        image_ul.animate({left: 0 - curIndex * li_width}, 1000);
    }
    else {
        curIndex = imageNum - 1;
        image_ul.animate({left: 0 - curIndex * li_width}, 500);
    }
    imageAutoShow() // 恢复自动播放
}
);

// 每一张图片向右按钮
$('.imgBtn_right').click(function () {
    console.log("停止自动播放");
    clearInterval(autoShow); // 停止自动播放
    var image_ul = $(".shipInfo_imgShow>ul");
    curIndex++;
    console.log(curIndex);
    if(curIndex < imageNum){
        $(".shipInfo_imgShow>ul").animate({left: 0 - curIndex * li_width}, 1000);
    }
    else{
        image_ul.animate({left: 0}, 500); // 显示第1张
        curIndex = 0;
    }
    imageAutoShow() // 恢复自动播放
});

// 悬浮在图片上
$(".shipInfo_imgShow").hover(function(){
    console.log('悬浮');
    //滑入清除定时器
    clearInterval(autoShow);
    // 可以显示大图
},function() {
    //滑出则重置定时器
    imageAutoShow()
});

// 点击船队获取下拉船队列表选项
$("#shipInfo_FleetName").click(function () {
    console.log("船队下拉框");
    $(this).next("ul").slideDown(200)
});

// 离开船队下拉框
$(".shipInfo_fleet>ul>li:first-child").mouseleave(function () {
    $('.shipInfo_FleetList').slideUp(200);
});



// 点击选择相应船队
$(".shipInfo_FleetList>li").click(function () {
    changeSaveStatus(true); // 改变保存状态
    var fleetNameInput = $("#shipInfo_FleetName");
    fleetNameInput.val($(this).text());
    fleetNameInput.attr("FleetNumber", $(this).attr("FleetNumber"));
    $(".shipInfo_FleetList").slideUp(200)
});

// /**
//  * 保存所属船队信息
//  */
// $(".shipInfo_updateBtn").click(function () {
//     var fleetNumber = $('.shipInfo_FleetName').attr("fleetNumber");
//     var enterTime_input = $('#shipInfo_EnterTime');
//     var leaveTime_input =$('#shipInfo_LeaveTime');
//     var joinTime = enterTime_input.val() ==="" ? null:enterTime_input.val();
//     var leaveTime = leaveTime_input.val() ===""? null:leaveTime_input.val();
//     var shipNumber = $(".shipName").attr("shipNumber");
//     var remarks = $(".remarks").val(); // 备注信息保存
//     if(fleetNumber !== "") {
//         $.ajax({
//             url: '/fleet/saveShip2Fleet',
//             type: 'get',
//             data: {ShipNumber: shipNumber, JoinTime: joinTime, LeaveTime: leaveTime, FleetNumber: fleetNumber, Remark:remarks},
//             success: function (data) {
//                 if (data[0] === "200") {
//                     console.log("保存成功");
//
//                 }
//                 else {
//                     console.log("保存失败");
//                 }
//             }
//         })
//     }
//     else{
//         // 如果为空，默认为将该船移除该船队
//         removeShipFromFleet();
//     }
// });

// 点击搜索按钮进行搜索
// 当满足条件时才可以搜索
$("#ShipSearch_DWTRange .DWTSearch_btn").click(function () {
    $(".check").attr("checked", false); // 初始默认为不选择
    var type = $(".Search_typeText").attr("shipType");
    console.log(type);
    var min_dwt_input = $(".min_dwt");
    var max_dwt_input = $(".max_dwt");
    var min_DWT = min_dwt_input.val() === "" ? min_dwt_input.attr("placeholder") : min_dwt_input.val();
    var max_DWT = max_dwt_input.val() === "" ? max_dwt_input.attr("placeholder") : max_dwt_input.val();
    if(type !== undefined && min_DWT <= max_DWT) {
        console.log(type + ", " + min_DWT + "," + max_DWT);
        var searchShipList = $("#searchShipList");
        var shipList = searchShipList.find(".fleetList_List");
        shipList.empty();
        // 显示列表
        searchShipList.slideDown(400);
        $.ajax({
            url: '/fleet/getSearchShipList',
            type: 'get',
            data: {Type: type, Min_DWT: min_DWT, Max_DWT: max_DWT},
            beforeSend: function () {
                console.log("loading");
                shipList.css("background", 'url("/images/ajax-loader.gif") no-repeat center');
            },
            success: function (data) {
                // 获取成功
                // console.log("获取数据成功");
                // 初始化
                console.log("加载结束");
                shipList.css("background", ""); // 清除背景
                var shipListInfo = [];
                var count = 0;
                if (data[0] === "200") {
                    shipListInfo = data[1];
                    var shipInfoStr = "";
                    for (var i = 0; i < shipListInfo.length; i++) {
                        var detailInfo = shipListInfo[i];
                        var MMSI = detailInfo.MMSI === null ? "" : detailInfo.MMSI;
                        var DWT = detailInfo.DWT;
                        var type = detailInfo.Type;
                        var today = new Date();
                        var this_year = today.getFullYear();
                        var shipAge = this_year - parseInt(detailInfo.BuiltDate.slice(0, 4));
                        var shipStatus = ShipStatusInfo[detailInfo.ShipStatus];
                        var fleetNumber = detailInfo.FleetNumber;
                        if (fleetNumber !== null) {
                            var fleetName = detailInfo.CNName === ""? detailInfo.ENName: detailInfo.CNName;
                            shipInfoStr += '<li class="belong2Fleet"><span>' + type + '</span><span>' + detailInfo.IMO + '</span><span>' + MMSI +
                                '</span><span>' + detailInfo.ShipName + '</span><span>' + DWT + '</span><span>' + shipAge + '</span><span>' +
                                shipStatus + '</span><span>' + fleetName + '</span><span><i class= "shipDetailInfo" shipNumber=' + detailInfo.ShipNumber + '></i></span></li>';
                        } else {
                            shipInfoStr += '<li class="notBelong2Fleet"><span>' + type + '</span><span>' + detailInfo.IMO + '</span><span>' + MMSI +
                                '</span><span>' + detailInfo.ShipName + '</span><span>' + DWT + '</span><span>' + shipAge + '</span><span>' +
                                shipStatus + '</span><span>' + "" + '</span><span><i class= "shipDetailInfo" shipNumber=' + detailInfo.ShipNumber + '></i></span></li>';
                            count++;
                        }
                        // shipList.append(shipInfoStr);
                    }
                    console.log(shipInfoStr);
                    shipList.append(shipInfoStr); // 增加数据
                    $(".belong2Fleet").hide();
                }
                // 总船舶数目
                var shipNum = $(' #searchShipList .fleetInfo_Num>span:nth-child(2)');
                shipNum.text(count);
                shipNum.attr("total", shipListInfo.length);
                shipNum.attr("notBelong", count);
            },
            error: function (err) {
                console.log(err);
            },
            complete: function () {
                // console.log("加载结束");
                // shipList.css("background", ""); // 清除背景
            }
        });
    }
});

/**
 * 点击选择是否显示在船队列表
 */
// var belongStatus = false;
$(".check").click(function () {
    console.log("here");
    var shipNum = $(' #searchShipList .fleetInfo_Num>span:nth-child(2)');
    var status = $(".check").attr("checked");
    if(status){
        // $(".operating_radioBtn").css("background", '');
        $(".check").attr("checked", false);
        $(".belong2Fleet").hide();
        shipNum.text(shipNum.attr("notBelong"));
    }
    else{
        // $(".operating_radioBtn").css("background", '#ccc');
        $(".belong2Fleet").show();
        $(".check").attr("checked", true);
        shipNum.text(shipNum.attr("total"));
    }
    // belongStatus = !belongStatus;
});

/**
 * 点击轨迹按钮显示一个月或者选择相应的日期
 */
$('.ship_track').click(function () {
    var MMSI = $('.shipInfo_List>li:nth-child(4)').text().slice(6,15);
    console.log(MMSI);
    if(MMSI !==""){
        // if(startTime !== ""){
        // var startTime = *.val() // 根据选择的日期进行显示
        // var date = new Date(startTime);
        //}
        var today = new Date();
        var endTime = Date.parse(today) / 1000;
        // var oneMonth = 25920000; // 30 * 24 * 3600
        var oneMonth = 15 * 24 * 3600;
        var startTime = endTime - oneMonth;
        // 获取相应的轨迹
        getDetailRoute(MMSI, startTime, endTime);
    }
});

/**
 * 地图弹出框拖动事件
 */
var fleetDown = false; //船队列表弹出框
var shipDetailsDown = false; //船舶详情弹出框
var DivLeft;
var DivTop;

$('.fleet_title').mousedown(function(event){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId=='fleet'){fleetDown = true;}
    if(changeDivId=='shipDetails'){shipDetailsDown = true;}
    DivLeft = event.clientX - $(this).offset().left;
    DivTop = event.clientY - $(this).offset().top;
});
var fleetDivZIndex = 0;

$('#fleet,#shipDetails,#searchShipList').click(function(){
    fleetDivZIndex++;
    $(this).css('zIndex',fleetDivZIndex);
});

$('.fleet_title').mouseup(function(){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId==='fleet'){fleetDown = false;}
    if(changeDivId==='shipDetails'){shipDetailsDown = false;}
    $(this).css('cursor','auto');
});

$(window).mousemove(function(event){
    var newLeft = event.clientX-DivLeft;
    var newTop = event.clientY-DivTop;
    if(newLeft<=0){newLeft = 0;}
    if(newTop<=0){newTop = 0;}
    if(fleetDown){
        if(newLeft>$(document).width()-$('#fleet>.fleet_title').width()){newLeft = $(document).width()-$('#fleet>.fleet_title').width();}
        if(newTop>$(window).height()-$('#fleet>.fleet_title').height()){newTop = $(window).height()-$('#fleet>.fleet_title').height();}
        $('#fleet').offset({top:newTop,left:newLeft});
    }else if(shipDetailsDown){
        if(newLeft>$(document).width()-$('#shipDetails>.fleet_title').width()){newLeft = $(document).width()-$('#shipDetails>.fleet_title').width();}
        if(newTop>$(window).height()-$('#shipDetails>.fleet_title').height()){newTop = $(window).height()-$('#shipDetails>.fleet_title').height();}
        $('#shipDetails').offset({top:newTop,left:newLeft});
        // updateCalenderPosition();
    }
});

//弹出框关闭事件
$('.fleet_title>.title_offbtn').click(function(){
    console.log("here");
    $('.Fleet_List_ul>li').removeClass("choose"); // 清空所选
    // $('.FleetName_List>li').removeClass("choose"); // 清空所选
    $(this).parent().parent().fadeOut(300);
    clearInterval(autoShow); // 清除定时器
});


//船舶范围搜索框显示事件
var SearchShow = false;
$('.ShipSearch_ShowBtn').click(function(){
    $(".ShipSearch_ShowBtn").css("background", "url('/images/fold-left.png') no-repeat center");
    if(!SearchShow){$('#ShipSearch_DWTRange').animate({'left':'0px'},300);}
    else{
        // $('#searchShipList').slideUp(400);
        $('#searchShipList').fadeOut(300);
        $('#ShipSearch_DWTRange').animate({'left':'-685px'},300);
        $(".ShipSearch_ShowBtn").css("background", "url('/images/search-big.png') no-repeat center");
        $(".min_dwt").val("");
        $(".Search_typeText").val("");
    }
    SearchShow = !SearchShow;
});




//船队列表时间轴拖动事件
//实时刷新时间线长度函数
//设置时间点宽度全局变量
var timePointWidth = 0;
updateTimeLineWidth();
function updateTimeLineWidth(){
    timePointWidth = $('.TimePointList>li').length * 90;
    $('.TimePointList').css('width',timePointWidth);
}

//时间轴滚动距离
// var fleetInfoTimeLeft = 0;
// $('.fleetInfo_timeSelect .timeLine_RightBtn').mousedown(function(){
//     console.log("here");
//     var timeLeft = parseInt($('.TimePointList').css('left'));
//     console.log(timeLeft);
//     timeLeft = timeLeft + 90;
//     if(timeLeft>=-90){timeLeft=0;}
//     $('.TimePointList').css('left',timeLeft);
// });
// $('.fleetInfo_timeSelect .timeLine_LeftBtn').mousedown(function(){
//     var timeLeft = parseInt($('.TimePointList').css('left'));
//     var timeAxleWidth = parseInt($('.timeLine_Axle').css('width'));
//     console.log(timeLeft);
//     console.log(timeAxleWidth);
//     console.log(timePointWidth);
//     timeLeft = timeLeft - 90;
//     if(timeLeft<=timeAxleWidth-timePointWidth+90){timeLeft=timeAxleWidth-timePointWidth;}
//     $('.TimePointList').css('left',timeLeft);
// });

// 历史列表点击右箭头
$('.fleetInfo_timeSelect .timeLine_RightBtn').click(function(){
    var timePoint_ul = $('.TimePointList');
    var timeLeft = parseInt(timePoint_ul.css('left'));
    var width = parseInt(timePoint_ul.css("width"));
    if(timeLeft - 480 + width  > 0) {
        console.log("here");
        timePoint_ul.animate({left : "-=480"}, 300);
    }
});

// 历史列表点击左箭头
$('.fleetInfo_timeSelect .timeLine_LeftBtn').click(function(){
    console.log("here");
    var timePoint_ul = $('.TimePointList');
    var timeLeft = parseInt(timePoint_ul.css('left'));
    console.log(timeLeft);
    if(timeLeft < 0){
        timePoint_ul.animate({left : "+=480"}, 300);
    }
});

//选择类型的输入

var search_input = $(".Search_typeText");
search_input.click(function() {getTypeList()});
search_input.keyup(function() {getTypeList()});

$(".search_type").mouseleave(function () {
    $('.Search_typeSelect').slideUp(200)
});

$(".Search_typeSelect").delegate("li", "click", function () {
    var search_type = $('.Search_typeText');
    search_type.attr('shipType', $(this).attr('type'));
    search_type.val($(this).text());
    $(".Search_typeSelect").slideUp(200)
});


/**
 *日期选择相关
 */
//初始化日期控件的时间
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(), //day
        "h+": this.getHours(), //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};


// 滚动条事件加载
$('.fleetList_List, .search_ship_List').scroll(function(){
    //获取滚动距离
    var scrollTop = $(this).scrollTop();
    console.log(scrollTop);
    //获取当前显示的长度
    var show_number = $(this).children('li').not('[style="display: none;"]').size();
    var AllWidth = show_number * 20;
    // var AllWidth = $(this).children('li').length * 20;
    console.log(AllWidth);
    //400是安全距离，保证滚动条不处于最下方时才开始执行更多，为400时未显示的剩余8行，不低于260
    if(scrollTop>AllWidth-200 && show_number < $(this).children('li').size()){
        console.log('显示更多');
        $(this).children('li').slice(show_number, show_number + 50).show()
    }
});

/**
 * 点击确认按钮，弹出备注框
 */
$('.fleetList_List').delegate(".toCheck", "click", function () {
    // console.log("点击确认");
    var checked = $(this);
    var shipNumber = $(this).parent().prev().children("i").attr("shipNumber");
    var fleetNumber = $('#fleet>.fleet_title>span').attr('fleetnumber');
    $.ajax({
        url:"/fleet/confirmFleet",
        type:"get",
        data:{ShipNumber:shipNumber},
        success:function (data) {
            // 显示为绿色
            checked.attr("class", "checked");
            // 刷新历史时间点
            getTimePointList(fleetNumber)
        }
    });
    // 界面上确认数目更新
    var checked_num_ele = $('.fleetInfo_total>.fleetInfo_checkedNum>span:nth-child(2)');
    var current_checkedNum = parseInt(checked_num_ele.text()) + 1;
    console.log(current_checkedNum);
    checked_num_ele.text(current_checkedNum);
    // 左侧列表数目更新
    $('.FleetName_List>.choose>i:nth-child(1)').text(current_checkedNum);
    // var checked_num_ele = $('.FleetName_List>.choose>i:nth-child(1)');
    // console.log(parseInt(checked_num_ele.text()));
    // checked_num_ele.text(parseInt(checked_num_ele.text()) + 1);
    event.stopPropagation();
});

/**
 * 船队删除按钮
 * 目前的逻辑不在下表中出现
 */
$(".fleetList_List").delegate(".shipDelete", "click", function () {
    /* 上下表记录的变化 */
    // $(this).parent().prev().children('i').attr('class', 'add'); // 将图标变为+
    // $(this).parent().prev().children('i').remove(); // 移除删除提标
    var current_li = $(this).parent().parent();
    // 上表中删除
    current_li.remove();
    // 下表中增加, 在搜索一次就自动增加了
    // $(".search_ship_List").append(current_li);
    // 船队总船舶数目 -1
    var fleet_shipNum_ele = $('#fleet').find('.fleetInfo_total>.fleetInfo_Num>span:nth-child(2)');
    fleet_shipNum_ele.text(parseInt(fleet_shipNum_ele.text()) - 1);
    // 船队总吨重变化
    var DWT_SUM_span = $(".fleetInfo_DWT>span:nth-child(2)");
    var DWT_remove = parseFloat(current_li.find("span:nth-child(5)").text());
    DWT_SUM_span.text(parseFloat(DWT_SUM_span.text()) - DWT_remove);
    // // 搜索总船舶数目 +1
    // var search_shipNum_ele = $('.searchInfo_total>.fleetInfo_Num>span:nth-child(2)');
    // search_shipNum_ele.text(parseInt(search_shipNum_ele.text()) + 1);
    /* 更新船队统计信息*/
    getBasicFleetInfo();
    var total_num_ele = $('.FleetName_List>.choose>i:nth-child(2)');
    total_num_ele.text(parseInt(total_num_ele.text()) - 1);
    // 如果为确认的情况，则已确认船数-1
    if ($(this).parent().prev().children("i").attr("class") === "checked"){
        var check_num_ele = $('.FleetName_List>.choose>i:nth-child(1)');
        var current_num =  parseInt(check_num_ele.text()) - 1;
        check_num_ele.text(current_num);
        // fleet界面上的已确认数目
        $('.fleetInfo_total>.fleetInfo_checkedNum>span:nth-child(2)').text(current_num)
    }
    /*从数据库中删除该船*/
    var shipNumber = current_li.find('.shipDetailInfo').attr('shipnumber');
    removeShipFromFleet(shipNumber);

    /* 上下表变化*/
    // 上表减少, 下表增加
    // var ship_li = $(this).parent().parent();
    // var shipNumber = ship_li.find(".shipDetailInfo").attr("shipNumber");
    // ship_li.remove();
    // 船队船总数目-1
    // var shipNum_span = $(".fleetInfo_Num>span:nth-child(2)");
    // console.log(shipNum_span.html());
    // console.log(shipNum_span.text());
    // shipNum_span.text(parseInt(shipNum_span.html()) - 1);
    // 船队总吨重更新
    // var DWT_SUM_span = $(".fleetInfo_DWT>span:nth-child(2)");
    // var DWT_remove = parseInt(ship_li.find("span:nth-child(5)").text());
    // DWT_SUM_span.text(parseInt(DWT_SUM_span.text()) - DWT_remove);
    // 搜索列表的数目增加
    /*从数据库中删除该船*/
    // removeShipFromFleet(shipNumber);
    /*统计列表数目变化*/
    // 左边列表中总数-1
    // var total_num_ele = $('.FleetName_List>.choose>i:nth-child(2)');
    // total_num_ele.text(parseInt(total_num_ele.text()) - 1);
    // 如果为确认的情况，则已确认船数-1
    // if ($(this).parent().prev().children("i").attr("class") === "checked"){
    //     var check_num_ele = $('.FleetName_List>.choose>i:nth-child(1)');
    //     check_num_ele.text(parseInt(check_num_ele.text()) - 1);
    // }
    // event.stopPropagation();
});

/**
 * 监听输入域的改变
 */
$(".remarks").bind('input change',function() {
    console.log("备注变化");
    changeSaveStatus(true);
});
$("#shipInfo_LeaveTime, #shipInfo_EnterTime").blur(function() {
    console.log("备注变化");
    changeSaveStatus(true);
});


/**
 * 船队列表搜索栏的状态点击出现下拉列表
 */
$('.Search_statusText').click(function(){
    console.log("here");
    $('.Search_statusSelect').slideDown(300);
});

/**
 * 离开直接上移
 */
$('.search_status').mouseleave(function(){
    $('.Search_statusSelect').slideUp(300);
});


/**
 * 选择状态列表元素
 */
$('.Search_statusSelect>li').click(function () {
    var status_text = $('.Search_statusText');
    status_text.val($(this).text());
    status_text.attr('type', $(this).attr('type'));
    $('.Search_statusSelect').slideUp(300);
});


/**
 * 搜索船舶内容
 */
$('.ShipSearch .DWTSearch_btn').click(function () {
    var type = $(".ShipSearch .Search_typeText").attr("shipType");
    var status = $('.Search_statusText').attr("type");
    var min_dwt_input = $(".ShipSearch  .min_dwt");
    var max_dwt_input = $(".ShipSearch  .max_dwt");
    var min_DWT = min_dwt_input.val() === "" ? min_dwt_input.attr("placeholder") : min_dwt_input.val();
    var max_DWT = max_dwt_input.val() === "" ? max_dwt_input.attr("placeholder") : max_dwt_input.val();
    if(type !== undefined && min_DWT <= max_DWT) {
        getSearchShipList(type, status, min_DWT, max_DWT);
        saveSearchRecord(type, status, min_DWT, max_DWT)
    }
});

/**
 * 点击加号添加至船队 待确认状态
 */
$('.search_ship_List').delegate('.add', 'click', function () {
   /* 上下表记录的变化 */
   $(this).attr('class', 'toCheck');
   $(this).parent().after('<span><i class="shipDelete"></i></span>');
   var current_li = $(this).parent().parent();
   // 下表中删除
   current_li.remove();
    // 上表中增加
    var shipNumber = current_li.find('.shipDetailInfo').attr('shipnumber');
    var fleetNumber = $('#fleet>.fleet_title>span').attr('fleetnumber');
    $('.fleetList_List>li').removeAttr("id");
    // 高亮显示
    current_li.attr("id", "choose");
    $(".fleetList_List").append(current_li);
    // 定位至该行
    $(".fleetList_List [shipnumber=" + shipNumber + "]").scrollIntoView(); //滑动至该行

    // 搜索总船舶数目 -1
    var search_shipNum_ele = $('.searchInfo_total>.fleetInfo_Num>span:nth-child(2)');
    search_shipNum_ele.text(parseInt(search_shipNum_ele.text()) - 1);
    // 船队总船舶数目 +1
    var fleet_shipNum_ele = $('#fleet').find('.fleetInfo_total>.fleetInfo_Num>span:nth-child(2)');
    // console.log(parseInt(fleet_shipNum_ele.text()));
    fleet_shipNum_ele.text(parseInt(fleet_shipNum_ele.text()) + 1);
    // 船队总吨重变化
    var DWT_SUM_span = $(".fleetInfo_DWT>span:nth-child(2)");
    var DWT_remove = parseFloat(current_li.find("span:nth-child(5)").text());
    DWT_SUM_span.text(parseFloat(DWT_SUM_span.text()) + DWT_remove);
    /* 更新船队统计信息*/
    getBasicFleetInfo();
    var total_num_ele = $('.FleetName_List>.choose>i:nth-child(2)');
    total_num_ele.text(parseInt(total_num_ele.text()) + 1);
   /*将记录写入数据库*/
    $.ajax({
        url: '/fleet/saveShip2Fleet',
        type: 'get',
        data: {
            ShipNumber: shipNumber,
            JoinTime: '',
            LeaveTime: '',
            FleetNumber: fleetNumber,
            Remark: '',
            Checked: '0'
        },
        success: function (data) {
            if (data[0] === "200") {
                console.log("保存成功");
            }
            else {
                console.log("保存失败");
            }
        }
    })
});





























