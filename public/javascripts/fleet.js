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
                        leaveOrJoin = "leave";
                        DWT_less += DWT;
                        num_less += 1;
                    }
                    var shipInfoStr= '<li class=' + leaveOrJoin +'><span>' + type + '</span><span>' + detailInfo.IMO + '</span><span>' + MMSI +
                        '</span><span>' + detailInfo.ShipName + '</span><span>' + DWT + '</span><span>' + shipAge + '</span><span>' +
                        shipStatus + '</span><span><i class= "shipDetailInfo" shipNumber=' + detailInfo.ShipNumber + '></i></span><span><i class= "' + shipCheck+ '"></i></span><span><i class="shipDelete"></i></span></li>';
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
        $(".shipInfo_imgShow>ul").animate({left: 0 - curIndex * 80}, 1000);
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


function changeSaveStatus() {
    saveStatus = true;
    $(".shipInfo_updateBtn").css("background", "#217BA2")
}

















/*********************************分割线*******************************************************************************/
// 船队的交互事件
var fleetBasicInfo = {};
var ShipStatusInfo = {'0': "在建", '1': "正服役", '2': "维护中", '3': "闲置", '4': "已拆解", '5': "未知", '6': "数据不再维护"};
/*** 船队列表弹出框操作 */
$('.route_Fleet_btn').click(function(){
    $('.ShipType_list').fadeToggle(300);
    $('.FleetName_List').fadeOut(300);
    $('#fleet').fadeOut(600);
    $('#searchShipList').fadeOut(600);
    $('#shipDetails').fadeOut(600);
    //隐藏航线列表和弹出框
    $('.route_List_ul').fadeOut(300);
    $('#routeInfo').fadeOut(600);
});

/** 鼠标移动到船队上显示船队的信息*/
$('.ShipType_list>li').mouseenter(function(){
    // var fleetName = $(this).text().replace(" ","");
    console.log(fleetBasicInfo)
    var fleetType = $(this).attr("id");
    $('.ShipType_list>li').removeClass("choose");
    $(this).addClass("choose");
    var fleet_ul = $(".FleetName_List");
    // var fleet_ul =  $('.'+fleetName);
    //列表第一次需要初始化
    fleet_ul.empty();
    var fleetInfo = fleetBasicInfo[fleetType];
    var uncheckNum = 0;
    var checkedNum = 0;
    for(var i = 0; i< fleetInfo.length; i++){
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
        fleet_ul.append('<li fleetNumber=' + fleetNumber + ' fleetName="' + name + '" number=' + number + '>' + name + '(<i>' + uncheckNum + "</i><i>" + checkedNum + '</i>)</li>')
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
    getShipList2Fleet(fleetNumber, "");

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
var autoShow;
var curIndex;
var imageNum;
var saveStatus = false;
// 点击i图标获取船舶的详细信息
$('.fleetList_List').delegate('.shipDetailInfo', 'click', function () {
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

            /**
             * 保存所属船队信息
             */
            $(".shipInfo_updateBtn").click(function () {
                if(saveStatus) { // 如果可以保存
                    var fleetNumber = $('.shipInfo_FleetName').attr("fleetNumber");
                    var enterTime_input = $('#shipInfo_EnterTime');
                    var leaveTime_input = $('#shipInfo_LeaveTime');
                    var joinTime = enterTime_input.val() === "" ? null : enterTime_input.val();
                    var leaveTime = leaveTime_input.val() === "" ? null : leaveTime_input.val();
                    var shipNumber = $(".shipName").attr("shipNumber");
                    var remarks = $(".remarks").val(); // 备注信息保存
                    if (fleetNumber !== "") {
                        current_li.find(".toCheck").attr("class", "checked");
                        $.ajax({
                            url: '/fleet/saveShip2Fleet',
                            type: 'get',
                            data: {
                                ShipNumber: shipNumber,
                                JoinTime: joinTime,
                                LeaveTime: leaveTime,
                                FleetNumber: fleetNumber,
                                Remark: remarks
                            },
                            success: function (data) {
                                if (data[0] === "200") {
                                    console.log("保存成功");
                                    ship_li.find(".toCheck").attr("class", "checked") // 本行显示显示为绿色
                                }
                                else {
                                    console.log("保存失败");
                                }
                            }
                        })
                    }
                    else {
                        // 如果为空，默认为将该船移除该船队
                        removeShipFromFleet();
                    }
                }
            });
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
                $(".remarks").text(remarks);
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

// 每一张图片的宽度
var li_width = 80;
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
        image_ul.animate({left: 0 - curIndex * 80}, 1000);
    }
    else {
        curIndex = imageNum - 1;
        image_ul.animate({left: 0 - curIndex * 80}, 500);
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
        $(".shipInfo_imgShow>ul").animate({left: 0 - curIndex * 80}, 1000);
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

// 单击备注按钮弹出备注编辑框
$('.shipInfo_remarkBtn').click(function(){
    fleetDivZIndex++;
    $('#fleetShipRemarks').css('zIndex',fleetDivZIndex);
    $('#fleetShipRemarks').fadeIn(200);
    event.stopPropagation();
});

// 点击船队获取下拉船队列表选项
$(".shipInfo_FleetName").click(function () {
    console.log("船队下拉框");
    $(this).next("ul").slideDown(200)
});

// 离开船队下拉框
$(".shipInfo_fleet>ul>li:first-child").mouseleave(function () {
    $('.shipInfo_FleetList').slideUp(200);
});


// 点击选择相应船队
$(".shipInfo_FleetList>li").click(function () {
    changeSaveStatus(); // 改变保存状态
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
    var remarks = $(".remarks").val(); // 备注信息保存
    if(fleetNumber !== "") {
        $.ajax({
            url: '/fleet/saveShip2Fleet',
            type: 'get',
            data: {ShipNumber: shipNumber, JoinTime: joinTime, LeaveTime: leaveTime, FleetNumber: fleetNumber, Remark:remarks},
            success: function (data) {
                if (data[0] === "200") {
                    console.log("保存成功");

                }
                else {
                    console.log("保存失败");
                }
            }
        })
    }
    else{
        // 如果为空，默认为将该船移除该船队
        removeShipFromFleet();
    }
});

// 点击搜索按钮进行搜索
// 当满足条件时才可以搜索
$(".DWTSearch_btn").click(function () {
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
                    for (var i = 0; i < shipListInfo.length; i++) {
                        var detailInfo = shipListInfo[i];
                        var MMSI = detailInfo.MMSI === null ? "" : detailInfo.MMSI;
                        var DWT = detailInfo.DWT;
                        var type = detailInfo.Type;
                        var today = new Date();
                        var this_year = today.getFullYear();
                        var shipAge = this_year - parseInt(detailInfo.BuiltDate.slice(0, 4));
                        var shipStatus = ShipStatusInfo[1];
                        var fleetNumber = detailInfo.FleetNumber;
                        if (fleetNumber !== null) {
                            var fleetName = detailInfo.CNName === ""? detailInfo.ENName: detailInfo.CNName;
                            var shipInfoStr = '<li class="belong2Fleet"><span>' + type + '</span><span>' + detailInfo.IMO + '</span><span>' + MMSI +
                                '</span><span>' + detailInfo.ShipName + '</span><span>' + DWT + '</span><span>' + shipAge + '</span><span>' +
                                shipStatus + '</span><span>' + fleetName + '</span><span><i class= "shipDetailInfo" shipNumber=' + detailInfo.ShipNumber + '></i></span></li>';
                        } else {
                            shipInfoStr = '<li class="notBelong2Fleet"><span>' + type + '</span><span>' + detailInfo.IMO + '</span><span>' + MMSI +
                                '</span><span>' + detailInfo.ShipName + '</span><span>' + DWT + '</span><span>' + shipAge + '</span><span>' +
                                shipStatus + '</span><span>' + "" + '</span><span><i class= "shipDetailInfo" shipNumber=' + detailInfo.ShipNumber + '></i></span></li>';
                            count++;
                        }
                        shipList.append(shipInfoStr);
                    }
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
 * 船舶信息备注编辑框事件
 */
//弹出框关闭
$('.ShipRemark_CancelBtn').click(function(){
    $('#fleetShipRemarks').fadeOut(200);
});

/**
 * 地图弹出框拖动事件
 */
var fleetDown = false; //船队列表弹出框
var shipDetailsDown = false; //船舶详情弹出框
var routeInfoDown = false; //航线信息管理弹出框
var shipRemarkDown = false; //船舶备注信息管理弹出框
var DivLeft;
var DivTop;

$('.fleet_title').mousedown(function(event){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId=='fleet'){fleetDown = true;}
    if(changeDivId=='shipDetails'){shipDetailsDown = true;}
    if(changeDivId=='routeInfo'){routeInfoDown = true;}
    if(changeDivId=='fleetShipRemarks'){shipRemarkDown = true;}
    DivLeft = event.clientX - $(this).offset().left;
    DivTop = event.clientY - $(this).offset().top;
});
var fleetDivZIndex = 0;

$('#fleet,#shipDetails,#searchShipList,#routeInfo,#fleetShipRemarks').click(function(){
    fleetDivZIndex++;
    $(this).css('zIndex',fleetDivZIndex);
});

$('.fleet_title').mouseup(function(){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId==='fleet'){fleetDown = false;}
    if(changeDivId==='shipDetails'){shipDetailsDown = false;}
    if(changeDivId==='routeInfo'){routeInfoDown = false;}
    if(changeDivId==='fleetShipRemarks'){shipRemarkDown = false;}
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
    }else if(routeInfoDown){
        if(newLeft>$(document).width()-$('#routeInfo>.fleet_title').width()){newLeft = $(document).width()-$('#routeInfo>.fleet_title').width();}
        if(newTop>$(window).height()-$('#routeInfo>.fleet_title').height()){newTop = $(window).height()-$('#routeInfo>.fleet_title').height();}
        $('#routeInfo').offset({top:newTop,left:newLeft});
    }else if(shipRemarkDown){
        if(newLeft>$(document).width()-$('#fleetShipRemarks>.fleet_title').width()){newLeft = $(document).width()-$('#fleetShipRemarks>.fleet_title').width();}
        if(newTop>$(window).height()-$('#fleetShipRemarks>.fleet_title').height()){newTop = $(window).height()-$('#fleetShipRemarks>.fleet_title').height();}
        $('#fleetShipRemarks').offset({top:newTop,left:newLeft});
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
        $('#searchShipList').slideUp(400);
        $('#ShipSearch_DWTRange').animate({'left':'-685px'},300);
        $(".ShipSearch_ShowBtn").css("background", "url('/images/search-big.png') no-repeat center");
    }
    SearchShow = !SearchShow;
    $(".min_dwt").val("");
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

// 历史事件点击右边
$('.fleetInfo_timeSelect .timeLine_RightBtn').click(function(){
    console.log("here");
    var timePoint_ul = $('.TimePointList');
    var timeLeft = parseInt(timePoint_ul.css('left'));
    var width = parseInt(timePoint_ul.css("width"));
    // timeLeft = timeLeft - 600;
    if(timeLeft - 600 + width  > 0) {
        timePoint_ul.animate({left : "-=600"}, 300);
    }
});

// 历史事件点击左边
$('.fleetInfo_timeSelect .timeLine_LeftBtn').click(function(){
    console.log("here");
    var timePoint_ul = $('.TimePointList');
    var timeLeft = parseInt(timePoint_ul.css('left'));
    console.log(timeLeft);
    if(timeLeft < 0){
        timePoint_ul.animate({left : "+=600"}, 300);
    }
});

//选择类型的输入

var search_input = $(".Search_typeText");
search_input.click(function() {getTypeList()});
search_input.keyup(function() {getTypeList()});

$(".Search_typeSelect").mouseleave(function () {
    $(this).slideUp(200)
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

/**
 * 点击确认按钮，弹出备注框
 */
$('.fleetList_List').delegate(".toCheck", "click", function () {
    console.log("点击确认");
    var remark = $("#fleetShipRemarks");
    fleetDivZIndex++;
    remark.css('zIndex',fleetDivZIndex);
    remark.fadeIn(300);
    event.stopPropagation();
    var shipNumber = $(this).parent().prev().children("i").attr("shipNumber");
    console.log(shipNumber);
    // 备注信息保存
    $(".ShipRemark_SaveBtn").click(function(){
        console.log("保存备注信息, 将船设为确认");
        var remarks = $(".fleetShip_RemarksInfo").val();
        console.log(remarks);
        $.ajax({
            url:"/fleet/saveRemarks",
            type:"get",
            data:{Remarks:remarks, ShipNumber:shipNumber},
            success:function (data) {
                if(data[0] === "200"){
                    console.log(data[1]);
                    $(this).attr("class", "checked") // 显示为绿色
                }
            }
        });
        remark.fadeOut(300);
    })
});

/**
 * 船队删除按钮
 */
$(".fleetList_List").delegate(".shipDelete", "click", function () {
    event.stopPropagation();
    var ship_li = $(this).parent().parent();
    var shipNumber = ship_li.find(".shipDetailInfo").attr("shipNumber");
    console.log(shipNumber);
    ship_li.remove();
    // 船队拥有船总数目更新
    var shipNum_span = $(".fleetInfo_Num>span:nth-child(2)");
    // console.log(shipNum_span.html());
    // console.log(shipNum_span.text());
    shipNum_span.text(parseInt(shipNum_span.html()) - 1);
    // 船队总吨重更新
    var DWT_SUM_span = $(".fleetInfo_DWT>span:nth-child(2)");
    var DWT_remove = parseInt(ship_li.find("span:nth-child(5)").text());
    // console.log(parseInt(DWT_SUM_span.text()) - DWT_remove)
    DWT_SUM_span.text(parseInt(DWT_SUM_span.text()) - DWT_remove);
    // 从该船队中删除该船
    removeShipFromFleet();
});


























