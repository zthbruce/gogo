/**
 * Created by Truth on 2017/8/21.
 * 标准航线
 */

/**
 * 获取航线的基本信息
 */
function getRouteInfo(){


}







/*********************************分割线*******************************************************************************/
// 交互事件模块

/** 点击最外层航线按钮 */
$(".route_Info_btn").click(function () {
    console.log("here");
    $('.routeType_list').fadeToggle(300);
    $('.oneRoute_List').fadeOut(300);
    $('#routeInfo').fadeOut(600);
});

/** 鼠标移动到航线上显示航线的二级信息*/
$('.routeType_list>li').mouseenter(function(){
    // var fleetName = $(this).text().replace(" ","");
    // var fleetType = $(this).attr("id");
    $('.ShipType_list>li').removeClass("choose");
    $(this).addClass("choose");
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

