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
        if (!checkedStatus){
            $(".voyageList_content>.checked").hide() // 默认隐藏已经确认的选项
        }
        else{
            var checked = $(".voyageList_content>.checked")
            checked.css("color", "green");
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
                            var voyage_li = "<li class=checked ShipNumber=" + ele.ShipNumber + " voyageID=" + ele.ID + "><span>" + ele.Name + "</span>" +
                                "<span>" + ele.IMO + "</span><span>" + startPortName + "</span><span>" + startTime + "</span><span>" +
                                stopPortName + "</span><span>" + stopTime + "</span></li>";
                        } else {
                            var voyage_li = "<li class=toCheck ShipNumber=" + ele.ShipNumber + " voyageID=" + ele.ID + "><span>" + ele.Name + "</span>" +
                                "<span>" + ele.IMO + "</span><span>" + startPortName + "</span><span>" + startTime + "</span><span>" +
                                stopPortName + "</span><span>" + stopTime + "</span></li>";
                        }
                        $(".voyageList_content").append(voyage_li);
                    }
                    updateByCheckSelect()
                }
            },
            complete: function () {
                console.log("加载结束");
                voyageList.css("background", ""); // 清除背景
            }
        })
}

/**
 * 根据操作更新
 */






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
    $("#voyageList").fadeIn(500);
    $('.route_List_ul').fadeOut(300);
    $(".Fleet_List_ul").fadeOut(300);
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
    var fleetNumber = $(this).attr("FleetNumber")
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


$(".voyageList_content").delegate("li", "click", function () {
    console.log("航次详情");
    $('#voyageDetails').fadeIn(300);
});
