/**
 * Created by Truth on 2017/8/14.
 */

// 船队操作的相关函数
getBasicFleetInfo();
/**
 * 获得船队的基本信息
 */
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

/**
 * 获取船队船舶列表
 * @param fleetNumber 船舶
 * @param timePoint 时间点
 */
function getShipList2Fleet(fleetNumber, timePoint){
    console.log(timePoint);
    var fleet_div = $('#fleet');
    var shipList = fleet_div.find('.fleetList_List');
    shipList.empty();
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
                // fleetBasicInfo = data[1];
                for(var i = 0; i < fleetDetailInfo.length; i++){
                    var detailInfo = fleetDetailInfo[i];
                    var MMSI = detailInfo.MMSI === null?"":detailInfo.MMSI;
                    var DWT = detailInfo.DWT;
                    var type = detailInfo.LEVEL3EN === ""? detailInfo.LEVEL2EN: detailInfo.LEVEL3EN;
                    var today = new Date();
                    var this_year = today.getFullYear();
                    var shipAge = this_year - parseInt(detailInfo.BuiltDate.slice(0, 4));
                    // console.log(detailInfo.ShipStatus);
                    var shipStatus = ShipStatusInfo[detailInfo.ShipStatus];
                    var leaveOrJoin = '';
                    var joinTime = detailInfo.JoinTime;
                    var leaveTime = detailInfo.LeaveTime;
                    if(joinTime === timePoint){
                        console.log("joinTime:" + joinTime);
                        leaveOrJoin = "join";
                        DWT_add += DWT;
                        num_add += 1;
                    }
                    if(leaveTime === timePoint){
                        leaveOrJoin = "leave";
                        DWT_less += DWT;
                        num_less += 1;
                    }
                    var shipInfoStr= '<li class=' + leaveOrJoin +'><span>' + type + '</span><span>' + detailInfo.IMO + '</span><span>' + MMSI +
                        '</span><span>' + detailInfo.ENMV + '</span><span>' + DWT + '</span><span>' + shipAge + '</span><span>' +
                        shipStatus + '</span><span><i class= "shipDetailInfo" shipNumber=' + detailInfo.ShipNumber + '></i></span></li>';
                    if(leaveOrJoin !== ""){
                        shipList.prepend(shipInfoStr);
                    }
                    else{
                        shipList.append(shipInfoStr);
                    }
                    // 总吨重
                    DWT_Sum += DWT;
                }
                // 总吨位
                fleet_div.find('.fleetInfo_DWT>span:nth-child(2)').text(DWT_Sum - DWT_less);
                // 吨位增减
                $(".fleet_AddDWTBtn").text("+" + DWT_add);
                $(".fleet_LessDWTBtn").text("-" + DWT_less);
                // if(DWT_add > 0){
                //     $(".fleet_AddDWTBtn").text("+" + DWT_add);
                // }
                // if(DWT_less > 0){
                //     $(".fleet_LessDWTBtn").text("-" + DWT_less);
                // }
                // 总船舶数目
                fleet_div.find('.fleetInfo_Num>span:nth-child(2)').text(fleetDetailInfo.length - num_less);
                $(".fleet_AddNumBtn").text("+" + num_add);
                $('.fleet_LessNumBtn').text("-" + num_less);
                // if(num_add > 0){
                //     $(".fleet_AddNumBtn").text("+" + num_add);
                // }
                // if(num_less < 0){
                //     $('.fleet_LessNumBtn').text("-" + num_less);
                // }
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
                timePoint_ul.css("width", info.length * 80 + "px");
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



















/*********************************分割线*******************************************************************************/
// 船队的交互事件
var fleetBasicInfo = {};
var ShipStatusInfo = {'0': "在建", '1': "正服役", '2': "维护中", '3': "闲置", '4': "已拆解", '5': "未知", '6': "数据不再维护"};
/*** 船队列表弹出框操作 */
$('.route_Fleet_btn').click(function(){
    $('.ShipType_list').fadeToggle(300);
    $('#fleet').fadeOut(600);
});

/** 鼠标移动到船队上显示船队的信息*/
$('.ShipType_list>li').mouseenter(function(){
    var fleetName = $(this).text().replace(" ","");
    //console.log(fleetName);
    var fleetType = $(this).attr("id");
    var fleet_ul =  $('.'+fleetName);
    //列表第一次需要初始化
    fleet_ul.empty();
    var fleetInfo = fleetBasicInfo[fleetType];
    for(var i = 0; i< fleetInfo.length; i++){
        var info = fleetInfo[i];
        // console.log(info);
        var fleetNumber = info.FleetNumber;
        var number = info.Number;
        var name = info.ENName === ""?info.CNName: info.ENName;
        // fleet_ul.append('<li fleetNumber=' + fleetNumber + '>' + name + '<i>(' + number + ')</i></li>')
        fleet_ul.append('<li fleetNumber=' + fleetNumber + ' fleetName=' + name + ' number=' + number + '>' + name + '(' + number + ')</li>')
    }
    // 显示船队信息
    $('.FleetName_List').css('display','none');
    fleet_ul.css('display','block');
});

// 点击船队列表中的船队获取所属船舶列表
$('.FleetName_List').delegate('li', 'click', function () {
    var fleet_li = $(this);
    var fleetNumber = fleet_li.attr("fleetNumber"); //船队ID
    var fleetName = fleet_li.attr("fleetName"); // 船队名字
    var fleet_div = $('#fleet');
    var fleet_title =fleet_div.find('.fleet_title>span');
    fleet_title.text(fleetName); // 填充船队名字
    fleet_title.attr("fleetNumber", fleetNumber); // 赋上船队Number
    console.log(fleetNumber);
    // 获得时间轴
    getTimePointList(fleetNumber);
    fleet_div.fadeIn(600);
    // 获取船队列表
    getShipList2Fleet(fleetNumber, "");
    // fleetDivZIndex++;
    // console.log(fleetDivZIndex);
    // $('#fleet').css('zIndex',fleetDivZIndex);

});

// 点击船舶列表中的今日按钮
$('.today_btn').click(function () {
    // var fleet_li = $('.current');
    // 充分利用当前所选船队的信息
    $(".TimePointList>li>i").removeClass('selected');
    var fleetNumber = $('.fleet_title>span').attr("fleetNumber"); //船队ID
    getShipList2Fleet(fleetNumber, "");
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
    getShipList2Fleet(fleetNumber, timePoint);
});

// 点击i图标获取船舶的详细信息
$('.fleetList_List').delegate('.shipDetailInfo', 'click', function () {
    var ship_li = $(this);
    var current_li = ship_li.parent().parent();
    var shipType = current_li.children('span:nth-child(1)').text();
    var IMO = current_li.children('span:nth-child(2)').text();
    var MMSI = current_li.children('span:nth-child(3)').text();
    var shipName = current_li.children('span:nth-child(4)').text();
    var DWT = current_li.children('span:nth-child(5)').text();
    var shipStatus = current_li.children('span:nth-child(7)').text();
    var shipNumber = ship_li.attr("shipNumber");
    $(".shipName").text(shipName);
    $(".shipName").attr("shipNumber", shipNumber);
    $.ajax({
        url: '/fleet/getShipDetailInfo',
        type: 'get',
        data:{ShipNumber: shipNumber},
        success: function (data) {
            if(data[0] === "200") {
                // console.log(data[1]);
                var shipInfo = data[1][0];
                var class_notation = shipInfo.Class_Notation === null?"":shipInfo.Class_Notation;
                var builtDate = shipInfo.BuiltDate === null?"":shipInfo.BuiltDate;
                var flag = shipInfo.Flag === null?"":shipInfo.Flag;
                var draft = shipInfo.DesignedDraft === null?0 : shipInfo.DesignedDraft;
                var PortName = shipInfo.PortName === null?"":shipInfo.PortName;
                var LOA = shipInfo.LOA === null?0 : shipInfo.LOA;
                var beam = shipInfo.MouldedBeam === null?0:shipInfo.MouldedBeam;
                var height = shipInfo.Height === null?0:shipInfo.Height;
                var builder = shipInfo.Builder === null ? "" : shipInfo.Builder;
                var name = shipInfo.ENName === ""?shipInfo.CNName: shipInfo.ENName;
                // 船的详细信息
                $('.shipInfo_List>li:nth-child(1)').text('IMO: ' + IMO);
                $('.shipInfo_List>li:nth-child(2)').text('船级社: ' + class_notation);
                $('.shipInfo_List>li:nth-child(3)').text('MMSI: ' + MMSI);
                $('.shipInfo_List>li:nth-child(4)').text('类型: ' + shipType);
                $('.shipInfo_List>li:nth-child(5)').text('建造年代: ' + builtDate);
                $('.shipInfo_List>li:nth-child(6)').text('船旗: ' + flag);
                $('.shipInfo_List>li:nth-child(7)').text('DWT: ' + DWT + " t");
                $('.shipInfo_List>li:nth-child(8)').text('吃水: ' + draft + ' m');
                $('.shipInfo_List>li:nth-child(9)').text('船籍港: ' + PortName);
                $('.shipInfo_List>li:nth-child(10)').text('状态: ' + shipStatus);
                $('.shipInfo_List>li:nth-child(11)').text('长*宽*高: ' + LOA + '*' + beam + '*' + height + ' m');
                // 船的管理公司
                $(".shipInfo_company>ul>li:nth-child(2)").text('建造商: ' + builder);
                // 所属船队
                var fleetName = $(".shipInfo_FleetName");
                fleetName.text(name);
                fleetName.attr("FleetNumber", shipInfo.FleetNumber);
                $("#shipINfo_EnterTime").val(shipInfo.JoinTime);
                $("#shipINfo_LeaveTime").val(shipInfo.LeaveTime);
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
});

// 点击船队获取下拉船队列表选项
$(".shipInfo_FleetName").click(function () {
    console.log("船队下拉框");
    $(this).next("ul").slideDown(200)
});

// 离开船队下拉框
$(".shipInfo_FleetList").mouseleave(function () {
    $(this).slideUp(200)
});


// 点击选择相应船队
$(".shipInfo_FleetList>li").click(function () {
    var fleetNameSpan = $(".shipInfo_FleetName");
    fleetNameSpan.text($(this).text());
    fleetNameSpan.attr("FleetNumber", $(this).attr("FleetNumber"));
    $(".shipInfo_FleetList").slideUp(200)
});

/**
 * 保存所属船队信息
 */
$(".shipInfo_updateBtn").click(function () {
    var fleetNumber = $('.shipInfo_FleetName').attr("fleetNumber");
    var enterTime_input = $('#shipInfo_EnterTime');
    var leaveTime_input =$('#shipInfo_LeaveTime');
    var joinTime = enterTime_input.val() ==="" ? null:enterTime_input.val();
    var leaveTime = leaveTime_input.val() ===""? null:leaveTime_input.val();
    var shipNumber = $(".shipName").attr("shipNumber");
    $.ajax({
        url: '/fleet/saveShip2Fleet',
        type: 'get',
        data: {ShipNumber: shipNumber, JoinTime: joinTime, LeaveTime: leaveTime, FleetNumber: fleetNumber},
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

// 点击搜索按钮进行搜索
$(".DWTSearch_btn").click(function () {
    $(".check").removeAttr("checked");
   var type =  $(".Search_typeText").attr("type");
   var min_dwt_input = $(".min_dwt");
   var max_dwt_input = $(".max_dwt");
   var min_DWT = min_dwt_input.val() === ""? min_dwt_input.attr("placeholder"):min_dwt_input.val();
   var max_DWT = max_dwt_input.val() === ""? max_dwt_input.attr("placeholder"):max_dwt_input.val();
   console.log(type+", " + min_DWT+"," + max_DWT);
   var searchShipList = $("#searchShipList");
    var shipList = searchShipList.find(".fleetList_List");
    shipList.empty();
    // 显示列表
    searchShipList.fadeIn(600);
    $.ajax({
        url: '/fleet/getSearchShipList',
        type: 'get',
        data: {Type: type, Min_DWT: min_DWT, Max_DWT: max_DWT},
        beforeSend:function () {
            console.log("loading");
            shipList.css("background", 'url("/images/ajax-loader.gif") no-repeat center');
        },
        success: function (data) {
            // 获取成功
            // console.log("获取数据成功");
            if (data[0] === "200") {
                var shipListInfo = data[1];
                var count = 0;
                for(var i = 0; i < shipListInfo.length; i++){
                    var detailInfo = shipListInfo[i];
                    var MMSI = detailInfo.MMSI === null?"":detailInfo.MMSI;
                    var DWT = detailInfo.DWT;
                    var type = detailInfo.LEVEL3EN === ""? detailInfo.LEVEL2EN: detailInfo.LEVEL3EN;
                    var today = new Date();
                    var this_year = today.getFullYear();
                    var shipAge = this_year - parseInt(detailInfo.BuiltDate.slice(0, 4));
                    var shipStatus = ShipStatusInfo[1];
                    var fleetNumber = detailInfo.FleetNumber;
                    if(fleetNumber !== null){
                        var shipInfoStr= '<li class="belong2Fleet"><span>' + type + '</span><span>' + detailInfo.IMO + '</span><span>' + MMSI +
                            '</span><span>' + detailInfo.ENMV + '</span><span>' + DWT + '</span><span>' + shipAge + '</span><span>' +
                            shipStatus + '</span><span><i class= "shipDetailInfo" shipNumber=' + detailInfo.ShipNumber + '></i></span></li>';
                    }else{
                        shipInfoStr= '<li class="notBelong2Fleet"><span>' + type + '</span><span>' + detailInfo.IMO + '</span><span>' + MMSI +
                            '</span><span>' + detailInfo.ENMV + '</span><span>' + DWT + '</span><span>' + shipAge + '</span><span>' +
                            shipStatus + '</span><span><i class= "shipDetailInfo" shipNumber=' + detailInfo.ShipNumber + '></i></span></li>';
                        count++;
                    }
                    shipList.append(shipInfoStr);
                }
                $(".belong2Fleet").hide();
                // 总船舶数目
                var shipNum = $(' #searchShipList .fleetInfo_Num>span:nth-child(2)');
                shipNum.text(count);
                shipNum.attr("total", shipListInfo.length);
                shipNum.attr("notBelong", count);
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
});

/**
 * 选择是否显示在船队列表
 */
var belongStatus = false;
$(".check").click(function () {
    console.log("here");
    var shipNum = $(' #searchShipList .fleetInfo_Num>span:nth-child(2)');
    if(belongStatus){
        // $(".operating_radioBtn").css("background", '');
        // $(".check").attr("checked", "");
        $(".belong2Fleet").hide();
        shipNum.text(shipNum.attr("notBelong"));
    }
    else{
        // $(".operating_radioBtn").css("background", '#ccc');
        $(".belong2Fleet").show();
        $(".check").attr("checked", "checked");
        shipNum.text(shipNum.attr("total"));
    }
    belongStatus = !belongStatus;
});

/**
 * 点击轨迹按钮显示一个月或者选择相应的日期
 */
$('.ship_track').click(function () {
    var MMSI = $('.shipInfo_List>li:nth-child(3)').text().slice(6,15);
    if(MMSI !==""){
        // if(startTime !== ""){
        // var startTime = *.val() // 根据选择的日期进行显示
        // var date = new Date(startTime);
        //}
        var today = new Date();
        var endTime = Date.parse(today) / 1000;
        var oneMonth = 25920000;
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
var shipSearchDown = false; //船舶搜索结果弹出框
var routeInfoDown = false; //航线信息管理弹出框
var DivLeft;
var DivTop;

$('.fleet_title').mousedown(function(event){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId=='fleet'){fleetDown = true;}
    if(changeDivId=='shipDetails'){shipDetailsDown = true;}
    if(changeDivId=='searchShipList'){shipSearchDown = true;}
    if(changeDivId=='routeInfo'){routeInfoDown = true;}
    DivLeft = event.clientX - $(this).offset().left;
    DivTop = event.clientY - $(this).offset().top;
});
var fleetDivZIndex = 0;
$('#fleet,#shipDetails,#searchShipList,#routeInfo').click(function(){
    console.log("here");
    fleetDivZIndex++;
    $(this).css('zIndex',fleetDivZIndex);
});

$('.fleet_title').mouseup(function(){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId==='fleet'){fleetDown = false;}
    if(changeDivId==='shipDetails'){shipDetailsDown = false;}
    if(changeDivId==='searchShipList'){shipSearchDown = false;}
    if(changeDivId==='routeInfo'){routeInfoDown = false;}
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
        updateCalenderPosition();
    }else if(shipSearchDown){
        if(newLeft>$(document).width()-$('#searchShipList>.fleet_title').width()){newLeft = $(document).width()-$('#searchShipList>.fleet_title').width();}
        if(newTop>$(window).height()-$('#searchShipList>.fleet_title').height()){newTop = $(window).height()-$('#searchShipList>.fleet_title').height();}
        $('#searchShipList').offset({top:newTop,left:newLeft});
    }else if(routeInfoDown){
        if(newLeft>$(document).width()-$('#routeInfo>.fleet_title').width()){newLeft = $(document).width()-$('#routeInfo>.fleet_title').width();}
        if(newTop>$(window).height()-$('#routeInfo>.fleet_title').height()){newTop = $(window).height()-$('#routeInfo>.fleet_title').height();}
        $('#routeInfo').offset({top:newTop,left:newLeft});
    }
});

//弹出框关闭事件
$('.fleet_title>.title_offbtn').click(function(){
    $(this).parent().parent().fadeOut(300);
});


//船舶范围搜索框显示事件
var SearchShow = false;
$('.ShipSearch_ShowBtn').click(function(){
    if(!SearchShow){$('#ShipSearch_DWTRange').animate({'left':'0px'},300);}
    else{$('#ShipSearch_DWTRange').animate({'left':'-364px'},300);}
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
var fleetInfoTimeLeft = 0;
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

// 点击右边
$('.fleetInfo_timeSelect .timeLine_RightBtn').click(function(){
    console.log("here");
    var timePoint_ul = $('.TimePointList');
    var timeLeft = parseInt(timePoint_ul.css('left'));
    var width = parseInt(timePoint_ul.css("width"));
    // timeLeft = timeLeft - 600;
    if(timeLeft - 600 + width  >= 0) {
        timePoint_ul.animate(
            {
                left : "-=600",
            },
            300, // 时长
            function() { console.log('done!'); // 回调函数
            });
    }
});

$('.fleetInfo_timeSelect .timeLine_LeftBtn').click(function(){
    console.log("here");
    var timePoint_ul = $('.TimePointList');
    var timeLeft = parseInt(timePoint_ul.css('left'));
    console.log(timeLeft);
    if(timeLeft < 0){
        timePoint_ul.animate(
            {
                left : "+=600",
            },
            300, // 时长
            function() { console.log('done!'); // 回调函数
            });
    }
});

//搜索选择类型
$(".Search_typeText").click(function () {
    $(this).next("ul").slideDown(200)
});

$(".Search_typeSelect").mouseleave(function () {
    $(this).slideUp(200)
});

$(".Search_typeSelect>li").click(function () {
    var search_type = $('.Search_typeText');
    search_type.attr('type', $(this).attr('type'));
    search_type.text($(this).text());
    $(".Search_typeSelect").slideUp(200)
});


//船舶详情弹出框—船舶图片轮播
$('.imgBtn_left').click(function(){
    var nowListLeft = parseInt($('.shipInfo_imgShow>ul').css('left'));
    // console.log(nowListLeft);
    var nowShowImgNum = -nowListLeft/80;
    if(nowShowImgNum>0){
        $('.shipInfo_imgShow>ul').stop();
        $('.shipInfo_imgShow>ul').animate({'left':nowListLeft+80},200);
    }
});
$('.imgBtn_right').click(function(){
    var imgListLength = parseInt($('.shipInfo_imgShow>ul>li').length);
    var nowListLeft = parseInt($('.shipInfo_imgShow>ul').css('left'));
    // console.log(nowListLeft);
    var nowShowImgNum = -nowListLeft/80;
    if(nowShowImgNum<imgListLength-1){
        $('.shipInfo_imgShow>ul').stop();
        $('.shipInfo_imgShow>ul').animate({'left':nowListLeft-80},200);
    }
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
$("#shipInfo_EnterTime").dateRangePicker({
    showShortcuts: false,
    format: 'YYYY-MM-DD',
    singleDate : true
}).bind('datepicker-apply', function(evt, obj){});
$("#shipInfo_LeaveTime").dateRangePicker({
    showShortcuts: false,
    format: 'YYYY-MM-DD',
    singleDate : true
}).bind('datepicker-apply', function(evt, obj){});
function updateCalenderPosition(){
    var EnterTimeTop = parseInt($('.shipInfo_Time input').eq(0).offset().top)+20;
    var EnterTimeLeft = parseInt($('.shipInfo_Time input').eq(0).offset().left)-133;
    var LeaveTimeTop = parseInt($('.shipInfo_Time input').eq(1).offset().top)+20;
    var LeaveTimeLeft = parseInt($('.shipInfo_Time input').eq(1).offset().left)-133;
    $('.date-picker-wrapper').eq(0).offset({top:EnterTimeTop,left:EnterTimeLeft});
    $('.date-picker-wrapper').eq(1).offset({top:LeaveTimeTop,left:LeaveTimeLeft});
}
$(function(){
    updateCalenderPosition();
});



//滚动条事件实例
$('.fleetList_List').scroll(function(){
    //获取滚动距离
    var scrollTop = $(this).scrollTop();
    console.log(scrollTop);
    //获取本身长度
    var AllWidth = $(this).children('li').length * 20;
    console.log(AllWidth);
    //400是安全距离，保证滚动条不处于最下方时才开始执行更多，为400时未显示的剩余8行，不低于260
    if(scrollTop>AllWidth-400){
        console.log('更多');
        //在此处执行更多
    }
});




















