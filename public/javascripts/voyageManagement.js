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
function updateByCheckSelect(){
    var toCheckStatus = $(".voyage_toCheck").prop("checked");
    var checkedStatus = $(".voyage_checked").prop("checked");
    console.log(toCheckStatus + "," + checkedStatus);
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
    // var fleetNUmber = $()
        $(".voyageList_content").empty(); // 初始化
        lastFleetNumber = fleetNumber;
        var voyageList = $("#voyageList_List");
        $.ajax({
            url: "/voyageManagement/getVoyageList",
            data: {FleetNumber: fleetNumber},
            type: "get",
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
                        var startPortName = "";
                        var stopPortName = "";
                        var startPort = AllPortBasicList[ele.StartPortID];
                        var stopPort = AllPortBasicList[ele.StopPortID];
                        if (startPort !== undefined) {
                            startPortName = startPort.ENName;
                        }
                        if (stopPort !== undefined) {
                            stopPortName = stopPort.ENName;
                        }
                        var startTime = ele.StartTime.slice(0, 10);
                        var stopTime = ele.StopTime.slice(0, 10);
                        var checked = ele.Checked;
                        if (checked === "1") {
                            voyage_ul += "<li class=checked ShipNumber=" + ele.ShipNumber + " voyageID=" + ele.ID + "><span>" + ele.Name + "</span>" +
                                "<span>" + ele.IMO + "</span><span>" + startPortName + "</span><span>" + startTime + "</span><span>" +
                                stopPortName + "</span><span>" + stopTime + "</span></li>";
                        } else {
                            voyage_ul += "<li class=toCheck ShipNumber=" + ele.ShipNumber + " voyageID=" + ele.ID + "><span>" + ele.Name + "</span>" +
                                "<span>" + ele.IMO + "</span><span>" + startPortName + "</span><span>" + startTime + "</span><span>" +
                                stopPortName + "</span><span>" + stopTime + "</span></li>";
                        }
                        // $(".voyageList_content").append(voyage_li);
                    }
                    $(".voyageList_content").append(voyage_ul);
                    // updateByCheckSelect()
                    $(".voyageList_content>.checked").hide() // 默认隐藏已经确认的
                }
            },
            complete: function () {
                console.log("加载结束");
                voyageList.css("background", ""); // 清除背景
            }
        })
}

var standardGoodsStatus = false;
var standardRouteStatus = false;
var voyageBtn_ConfirmStatus = false;
var voyageBtn_saveStatus = false;

/**
 * 根据操作更新确认信息
 */
function updateCheckInfo(){
    voyageBtn_saveStatus = true;
    updateSaveStatus();
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
function updateSaveStatus() {
    var saveButton = $(".voyageBtn_SaveOrConfirm");
    if(voyageBtn_saveStatus){
        saveButton.css("background", "#4d90fe");// 蓝底
        saveButton.css("color", "#FFF"); // 白字
    }
    else{
        saveButton.css("background", "#ccc"); // 灰底
        saveButton.css("color", "#060205"); // 黑字
    }
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
    var defaultFleetNumber = "F2";
    updateVoyageList(defaultFleetNumber);
    var voyageList = $("#voyageList");
    fleetDivZIndex++;
    console.log(fleetDivZIndex);
    voyageList.css('zIndex',fleetDivZIndex);
    voyageList.fadeIn(500);
    $('.route_List_ul').fadeOut(300);
    $(".Fleet_List_ul").fadeOut(300);
    //隐藏船队相关弹出框和标准航线相关弹出框
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
 * 点击列表中元素表示选择
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
    console.log("here");
    updateByCheckSelect()
});

/**
 *
 */
$(".voyageList_content").delegate("li", "click", function () {
    console.log("航次详情");
    fleetDivZIndex++;
    console.log(fleetDivZIndex);
    var voyageDetails = $('#voyageDetails');
    voyageDetails.css('zIndex',fleetDivZIndex);
    event.stopPropagation();
    // 设置宽度
    $('.shipVoyageList_List').css("width", 80 * 14);
    voyageDetails.fadeIn(300);
});



// 历史列表点击右箭头
$('.shipVoyageList_rightbtn').click(function(){
    var timePoint_ul = $('.shipVoyageList_List');
    var timeLeft = parseInt(timePoint_ul.css('margin-left'));
    var width = parseInt(timePoint_ul.css("width"));
    if(timeLeft - 560 + width  > 0) {
        console.log("here");
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
$(".voyageBtn_StandardRoute").click(function () {
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
$(".voyageBtn_StandardGoods").click(function(){
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
    // routeAndGoods.css("background", "#ccc"); // 灰底
    // routeAndGoods.css("color", "#060205"); // 黑字
    voyageBtn_saveStatus = false; // 状态发生改变
    var title = $("#voyageDetails").find(">.fleet_title>span:nth-child(1)");
    var routeAndGoods = $(".voyageBtn_StandardRoute, .voyageBtn_StandardGoods");
    // 如果当前是确认, 保存相应信息
    if(voyageBtn_ConfirmStatus){
        $(".voyageBtn_SaveOrConfirm").text("保存");
        voyage_checked = "1"; // check状态信息
        title.text("航次详情(已确认)");
        // 标准航线和标准货物可点击
        standardGoodsStatus  = true;
        standardRouteStatus = true;
        routeAndGoods.css("background", "#4d90fe");// 蓝底
        routeAndGoods.css("color", "#FFF"); // 白字
    }
    else{
        title.text("航次详情(未确认)");
        // 标准航线和标准货物不能点击
        standardGoodsStatus  = false;
        standardRouteStatus = false;
        routeAndGoods.css("background", "#ccc"); // 灰底
        routeAndGoods.css("color", "#060205"); // 黑字
    }
    updateSaveStatus(); // 更新保存按钮状态
});


/**
 * 监听select的变化
 */

$(".oneVoyageInfo select").change(function () {
    console.log("change");
    voyageBtn_saveStatus = true;
    updateSaveStatus(); // 更新保存按钮状态
});


/**
 * 监听DWT的变化
 */
$(".oneVoyageInfo .DWT").bind("input", function () {
    voyageBtn_saveStatus = true;
    updateSaveStatus(); // 更新保存按钮状态
});


/**
 * 悬浮在停靠列表上时会出现结束航次按钮
 */
$(".oneVoyage_DockedList>li").mouseover(function () {
    var endButton = $(this).find(".oneVoyage_EndBtn");
    endButton.css("display", "block");
});

/**
 * 离开列表
 */
$(".oneVoyage_DockedList>li").mouseout(function () {
    console.log("结束航次");
    var endButton = $(this).find(".oneVoyage_EndBtn");
    endButton.css("display", "none");
});

/**
 * 点击结束航次
 */

$(".oneVoyage_DockedList").delegate(".oneVoyage_EndBtn", "click", function () {
    console.log("结束航次");
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

