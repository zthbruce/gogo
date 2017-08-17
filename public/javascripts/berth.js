/**
 * 泊位管理的函数和操作， 上部分为函数，下部分为操作事件
 * Created by Truth on 2017/7/27.
 */

/**
 * 根据输入的部分公司名来匹配数据库中的公司名
 * @param companyStr
 */
function addPierSelectCompanyName(companyStr){
    $.ajax({
        url:'/berth/addPierSelectCompanyName',
        type:'get',
        data:{companyStr: companyStr},
        success: function(data){
            console.log(data);
            if(data[0] === "200"){
                var jsonData = data[1];
                for(var i=0;i<jsonData.length;i++){
                    var companyName = jsonData[i].Name;
                    var companyNumber =  jsonData[i].CompanyNumber;
                    // 显示公司列表
                    $("#company_name_list").append('<li "companyNumber" = ' + companyNumber + '>' + companyName + '</li>');
                }
                $("#company_name_list").slideDown(200);
                // 点击选择按钮
                $('#company_name_list>li').on('click', function () {
                    console.log($(this).text());
                    // $('#company_name').val($(this).text());
                    $('#company_name').attr("companyNumber", $(this).attr("companyNumber"));
                    $('#company_name').val($(this).text());
                    $(this).slideUp(400)
                });
            }
        },
        error: function(err){
            console.log(err);
        }
    });
}

/**
 * 根据静止区域ID获取码头详情信息
 * @param clusterId
 * @param lon
 * @param lat
 */
function getPierInfo(clusterId, lon, lat){
    // pierStatus = false; // 初始化码头信息修改状态
    // berthStatus = false; // 初始化泊位信息修改状态
    saveStatus = false; //
    var closePortList = getClosePortList(lon, lat, AllPortBasicList, 5);
    console.log(closePortList);
    /* 港口列表模块 */
    $("#berth_port_list").empty();
    for(var i = 0; i < closePortList.length; i++){
        var port = closePortList[i];
        $("#berth_port_list").append('<li port_id="'+port.PortID+'">'+port.ENName+'</li>');
    }
    // 可点击选择港口
    $('#berth_port_list>li').on('click', function () {
        $("#port_name").attr("port_id", $(this).attr("port_id"));
        $('#port_name').text($(this).text());
        changeBerthSaveButton(true);
        $(this).parent().slideUp(200);
    });
    // 请求码头信息
    $.ajax({
        url:'/berth/getTerminal',
        type:'get',
        data:{staticAreaKey : clusterId},
        success: function(data){
            console.log(data);
            // 如果有数据就显示当前码头数据
            var terminalKey = "";
            if(data[0] === "200"){
                var jsonData = data[1];
                var pierInfo = jsonData[0]; // 获取当前码头信息
                console.log(pierInfo);
                terminalKey = pierInfo.TerminalKey;
                // $(".pierInfo_list").attr("terminalKey", terminalKey);
                $("#port_name").attr("port_id", pierInfo.PortID);
                $("#port_name").text(pierInfo.PortName);
                $("#pier_name").val(pierInfo.Name); // 码头名字
                // $("#company_name").val(pierInfo.BelongtoCompany); // 公司名字
                $("#company_name").attr("companyNumber", pierInfo.BelongtoCompany);
                $("#company_name").val(pierInfo.CompanyName); // 公司名字
                $("#berth_num").val(pierInfo.BerthQuantity); // 泊位数量
                $("#tide").val(pierInfo.Tide); // 潮汐
                $("#import_export_type").text(pierInfo.ImportExportType);
                $("#cargo_type_key").text(pierInfo.CargoTypeKey);
                // 经纬度的显示
                $("#LON_LAT").val(pierInfo.Latitude + ", " + pierInfo.Longitude);
                $("#LON_LAT").attr("numeric", pierInfo.LatitudeNumeric + "," + pierInfo.LongitudeNumeric);
                $("#location").val(pierInfo.Location); //位置
                $("#des").val(pierInfo.Des) // 说明
            }
            // 如果没有数据, 就显示默认信息
            else{
                console.log("不属于任何码头");
                // $(".pierInfo_list").attr("terminalKey", "");
                var default_port =  closePortList[0];
                $("#port_name").attr("port_id", default_port.PortID);
                $("#port_name").text(default_port.ENName);
                $("#pier_name").val("");
                $("#company_name").attr("companyNumber", "");
                $("#company_name").val("");
                $("#berth_num").val(""); // 泊位数量
                $("#location").val("");//位置
                $("#des").val("");// 说明
                // $(".pier_info>input").val(""); //初始化输入
                $("#import_export_type").text("进口");
                $("#cargo_type_key").text("Iron Ore");
                // 经纬度显示当前泊位的中心点
                var latLonInfo = transLonLatToNormal(lat, lon);
                $("#LON_LAT").val( latLonInfo[0] + ", " + latLonInfo[1]);
                $("#LON_LAT").attr("numeric", lat + "," + lon);
            }
            // console.log(terminalKey);
            $(".pierInfo_list").attr("terminalKey", terminalKey);
            getCloseBerthList(terminalKey, lon, lat, allPoints, 10)
        },
        error: function(err){
            console.log(err);
        }
    });

}

/**
 * 根据当前中心点，获取10公里范围内的泊位列表
 * @param terminalKey 码头ID， 如果为空
 * @param centerLon
 * @param centerLat
 * @param allPoints
 * @param n
 */
function getCloseBerthList(terminalKey, centerLon, centerLat, allPoints, n){
    // 首先会获取该码头下的stationAreaKey
    var belongDistanceList = {};
    $.ajax({
        url:'/berth/getBerthListFromPier',
        type:'get',
        data:{TerminalKey: terminalKey},
        success: function(data){
            console.log(data);
            if(data[0] === "200") {
                belongDistanceList = data[1];
            }
            var distanceList = [];
            // var num = belongDistanceList.length;
            // console.log("泊位数目：" + num);
            // 遍历所有静止区域中心点
            for(var key in allPoints) {
                var ele = allPoints[key];
                var type = ele['type']; // 属于哪一类， 目前有0：锚地， 1：泊位， 2：未知区域
                if(type === 1){
                    var lon = ele['lon'];
                    var lat = ele['lat'];
                    var distance = getGreatCircleDistance(centerLon, centerLat, lon, lat);
                    if(distance <= 10.0){
                        var status = 1; // 1表示默认不属于该码头
                        var info = {LOA: "", Moulded_Beam: "", Draft: "", LoadDischargeRate: ""};
                        if(key in belongDistanceList){
                            status = 0; // 属于该码头的泊位状态
                            info = belongDistanceList[key];
                        }
                        distanceList.push({cluster_id: key, distance: distance, status: status, LOA: info.LOA, Moulded_Beam: info.Moulded_Beam,
                            Draft: info.Draft, LoadDischargeRate: info.LoadDischargeRate})
                    }
                }
            }
            // 按照从小到大的顺序
            distanceList.sort(function (x, y) {
                if(x.status < y.status){
                    return -1;
                }
                if(x.status > y.status){
                    return 1;
                }
                return (x.distance  - y.distance)
            });

            // 获取最近的N个静止区域的统计信息列表
            var len = distanceList.length;
            n = Math.min(len, n);
            // 初始化泊位列表
            $(".berth_list").empty();
            for(var i = 0; i < n; i++){
                var berthInfo = distanceList[i];
                var staticAreaKey = berthInfo.cluster_id;
                status = berthInfo.status;
                var belongStatus = status === 0 ? "belong" : "notBelong";
                var ele = allPoints[staticAreaKey];
                // 将信息写入html, 并赋予一个状态,根据状态进行筛选
                // 当前静止区域默认属于
                if(i === 0){
                    belongStatus = "belong";
                    status = 0;
                }
                var str = '<li><ul class="oneBerth_info"><li>' + (i + 1) + '</li><li><span class = ' + belongStatus +' seq='+ (i + 1) +'>' +
                    '</span></li> <li> <ul class="oneBerth_list" status=' +  status +  ' staticAreaKey = ' + staticAreaKey + ' lon = ' + ele.lon + ' lat=' + ele.lat + '><li>LOA: '
                    + ele.LOA_MAX + 'm</li><li>Beam: ' + ele.BEAM_MAX + 'm</li><li>Draft: ' + ele.DRAFT_MAX + 'm</li> <li>DWT: ' + ele.DWT_MAX
                    +'T</li><li>长: <input type="text" placeholder="0.00" value=' + berthInfo.LOA+ '>M</li> <li>宽: <input type="text" placeholder="0.00" value=' + berthInfo.Moulded_Beam+ '>M</li> ' +
                    '<li>深: <input type="text" placeholder="0.00" value=' + berthInfo.Draft+ '>M</li> <li>装载率: <input type="text" placeholder="0.00" value=' + berthInfo.LoadDischargeRate + '>t/h</li></ul> </li> </ul> </li>';
                $(".berth_list").append(str);
            }
            $(".oneBerth_info>li:nth-child(2)>span").click(function () {
                changeBerthSaveButton(true); // 改变保存状态
                // 第一个不允许修改状态
                if($(this).attr('seq') === "1"){
                    console.log("第一个不允许修改");
                    return;
                }
                if ($(this).attr('class') === "notBelong") {
                    // $(this).removeClass("notBelong");
                    // $(this).addClass("belong");
                    $(this).attr("class", "belong");
                    $(this).parent().next().children().attr("status", "0")
                }else{
                    // $(this).removeClass("belong");
                    // $(this).addClass("notBelong");
                    $(this).attr("class", "notBelong");
                    $(this).parent().next().children().attr("status", "1")
                }
                // 改变对应码头的位置信息
                var i = 0;
                var lonSum = 0;
                var latSum = 0;
                $("[status='0']").each(function () {
                    console.log(i);
                    i++;
                    lonSum += parseFloat($(this).attr("lon"));
                    latSum += parseFloat($(this).attr("lat"));
                });
                var latCenter = latSum / i;
                var lonCenter = lonSum / i;
                var latLonInfo = transLonLatToNormal(latCenter, lonCenter);
                $("#LON_LAT").val(latLonInfo[0] + "," + latLonInfo[1]);
                $("#LON_LAT").attr("numeric", latCenter + "," + lonCenter);
            });
            // 监听输入
            $('.oneBerth_list>li>input, .pier_BerthNum>input').keyup(function(){
            // $('.oneBerth_list>li>input').keyup(function(){
                console.log("输入信息");
                var nowVal = $(this).val();
                if(isNaN(nowVal)){
                    // dataIsEffective=false;
                    changeBerthSaveButton(false); //
                    // $(this).css({'border-color':'#f00','box-shadow':'0px 0px 1px 1px #f00'});
                    $(this).css({'color':'#f00'});
                }
                else{
                    $(this).css({'color':'#060205'});
                    changeBerthSaveButton(true);
                }
            });
        },
        error: function(err){
            console.log(err);
        }
    });
}

/**
 * 获取目前归为该码头下泊位的输入信息
 * @param portID
 * @param terminalKey
 * @returns {Array}
 */
function getBerthList(portID, terminalKey) {
    var berthList = [];
    var i = 0;
    $("[status='0']").each(function () {
        i++;
        var LOA = $(this).children().eq(4).children().val();
        var BEAM = $(this).children().eq(5).children().val();
        var DRAFT = $(this).children().eq(6).children().val();
        var LoadRate = $(this).children().eq(7).children().val();
        var staticAreaKey = $(this).attr("staticAreaKey");
        berthList.push({TerminalKey:terminalKey, Seq:i, LOA: LOA, Moulded_Beam: BEAM, Draft: DRAFT,
            LoadDischargeRate: LoadRate, StationaryAreaKey:staticAreaKey})
    });
    return berthList;
}

/**
 * 根据所选的泊位改变码头位置信息
 * @param berthLonLatList [[lon, lat], [lon, lat], ...]
 * @return
 */
function changePierCenter(berthLonLatList) {
    var lonSum = 0;
    var latSum = 0;
    var len = berthLonLatList.length;
    for(var i = 0; i < len; i++){
        lonSum += berthLonLatList[i][0];
        latSum += berthLonLatList[i][1];
    }
    return [lonSum / len, latSum / len]
}




/*********************************分割线*******************************************************************************/
// 交互事件模块
/**
 * 地图弹出框拖动事件
 */
var newBerthDown = false; //泊位管理弹出框
var newAnchDown = false; //泊位管理弹出框
var newBerthStatDown = false; //泊位信息统计弹出框
var DivLeft;
var DivTop;

// 拖动效果
$('.newBerthAnch_title').mousedown(function(event){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId=='newBerth'){newBerthDown = true;}
    if(changeDivId=='newAnch'){newAnchDown = true;}
    if(changeDivId=='newBerthStatistics'){newBerthStatDown = true;}
    DivLeft = event.clientX - $(this).offset().left;
    DivTop = event.clientY - $(this).offset().top;
    $(this).css('cursor','all-scroll');
});
var portDivZIndex = 0;
$('#newBerth,#newAnch,#newBerthStatistics').click(function(){
    portDivZIndex++;
    $(this).css('zIndex',portDivZIndex);
});

$('.newBerthAnch_title').mouseup(function(){
    var changeDivId = $(this).parent().attr('id');
    if(changeDivId=='newBerth'){newBerthDown = false;}
    if(changeDivId=='newAnch'){newAnchDown = false;}
    if(changeDivId=='newBerthStatistics'){newBerthStatDown = false;}
    $(this).css('cursor','auto');
});

$(window).mousemove(function(event){
    var newLeft = event.clientX-DivLeft;
    var newTop = event.clientY-DivTop;
    if(newLeft<=0){newLeft = 0;}
    if(newTop<=0){newTop = 0;}
    if(newBerthDown){
        if(newLeft>$(document).width()-$('#newBerth>.newBerthAnch_title').width()){newLeft = $(document).width()-$('#newBerth>.newBerthAnch_title').width();}
        if(newTop>$(window).height()-$('#newBerth>.newBerthAnch_title').height()){newTop = $(window).height()-$('#newBerth>.newBerthAnch_title').height();}
        $('#newBerth').offset({top:newTop,left:newLeft});
    }else if(newAnchDown){
        if(newLeft>$(document).width()-$('#newAnch>.newBerthAnch_title').width()){newLeft = $(document).width()-$('#newAnch>.newBerthAnch_title').width();}
        if(newTop>$(window).height()-$('#newAnch>.newBerthAnch_title').height()){newTop = $(window).height()-$('#newAnch>.newBerthAnch_title').height();}
        $('#newAnch').offset({top:newTop,left:newLeft});
    }else if(newBerthStatDown){
        if(newLeft>$(document).width()-$('#newBerthStatistics>.newBerthAnch_title').width()){newLeft = $(document).width()-$('#newBerthStatistics>.newBerthAnch_title').width();}
        if(newTop>$(window).height()-$('#newBerthStatistics>.newBerthAnch_title').height()){newTop = $(window).height()-$('#newBerthStatistics>.newBerthAnch_title').height();}
        $('#newBerthStatistics').offset({top:newTop,left:newLeft});
    }
});

// 输入下拉框
$('.span_select>span:nth-child(2)').click(function(){
    $(this).next('ul').slideDown(200);
});

$('.span_select,.input_select').mouseleave(function(){
    $(this).children('ul').slideUp(200);
});

// 选择下拉框 按钮
$('.span_select>ul>li,.input_select>ul>li').click(function(){
    var val = $(this).text();
    $(this).parent().prev('span').text(val);
    $(this).parent().prev('input').val(val);
    $(this).parent().slideUp(200);
    changeBerthSaveButton(true);
});


// 泊位管理界面关闭
$('#berth_cancel').click(function () {
    $('#newBerth').fadeOut("normal");
    position.getSource().clear();
});

// 港口下拉框的点击
$('#berth_port_list>li').on('click', function () {
    console.log("click port");
   $('#port_name').text($(this).text())
});

// var pierStatus = false;
// var berthStatus = false;
// var saveStatus = false;
// 关于保存按钮的状态

// 保存按钮单击事件
// var dataIsEffective=true;
$('#berth_save').click(function () {
    // 输入检查
    // 检查泊位列表输入框的输入问题
    // for(var i=0;i<$('.berth_list input').length;i++){
    //     if(isNaN($('.berth_list input').eq(i).val())){
    //         dataIsEffective=false;
    //         $('.berth_list input').eq(i).css({'border-color':'#f00','box-shadow':'0px 0px 1px 1px #f00'});
    //     }
    // }
    // if(dataIsEffective) {
    console.log("保存当前信息");
    changeBerthSaveButton(false); // 改变按钮
    var terminalKey = $(".pierInfo_list").attr("terminalKey"); //TerminalKey
    if (terminalKey === "") {
        // 生成一个码头ID
        terminalKey = generateNewPierKey();
    }

    // 如果公司的number为0
    var companyNumber = $("#company_name").attr('companyNumber');
    // 当还不是公司的时候，生成一个公司key值
    if(companyNumber === ""){
        companyNumber = 'C' + generateNewPierKey();
    }
    var portID = $("#port_name").attr("port_id");
    // 码头发生改变时保存码头信息
    console.log("保存码头信息");
    var Lat_Lon = $("#LON_LAT").val().split(",");
    console.log($("#LON_LAT").val());
    var Lat_Lon_Numeric = $("#LON_LAT").attr("numeric").split(",");
    var lat_numeric = Lat_Lon_Numeric[0];
    var lon_numeric = Lat_Lon_Numeric[1];
    var lat = Lat_Lon[0];
    var lon = Lat_Lon[1];
    var reqPram = {
        TerminalKey: terminalKey,
        Name: $("#pier_name").val(),
        PortID: portID,
        // BelongtoCompany: $("#company_name").val(),
        BelongtoCompany: companyNumber,
        BerthQuantity: $("#berth_num").val(),
        ImportExportType: $("#import_export_type").text(),
        CargoTypeKey: $("#cargo_type_key").text(),
        LatitudeNumeric: lat_numeric,
        LongitudeNumeric: lon_numeric,
        Latitude: lat,
        Longitude: lon,
        Location: $("#location").val(),
        Des: $("#des").val()
    };
    console.log(reqPram);
    $.ajax({
        url: '/berth/saveTerminal',
        type: 'get',
        data: reqPram,
        success: function (data) {
            console.log(data[1])
        },
        error: function (err) {
            console.log(err);
        }
    });
    // 保存公司信息
    $.ajax({
        url: '/berth//savePierCompany',
        type: 'get',
        data: {CompanyNumber: companyNumber, Name:$("#company_name").val()},
        success: function (data) {
            console.log(data[1])
        },
        error: function (err) {
            console.log(err);
        }
    });
    // 保存泊位信息
    console.log("保存泊位信息");
    var berthList = getBerthList(portID, terminalKey);
    console.log(terminalKey);
    console.log(berthList);
    $.ajax({
        url: '/berth/saveBerthList',
        type: 'get',
        data: {berthList: berthList},
        success: function (data) {
            console.log(data[1]);
            $('.alert').html('保存信息成功').addClass('alert-success').show().delay(1000).fadeOut();
            $('#newBerth').fadeOut("normal");
        },
        error: function (err) {
            console.log(err);
        }
    });
    // }
});

// 统计按钮
$('#berth_statistic').click(function(){
    // $('#newBerth').fadeOut("normal");
    var berthZIndex = $('#newBerth').css('zIndex');
    berthZIndex++;
    console.log(berthZIndex);
    $('#newBerthStatistics').fadeIn(600);
    $('#newBerthStatistics').css('zIndex',berthZIndex);
    var shipType = $('#newBerthStatistics .berthStat_shipType>span:nth-child(2)').text();
    var staticareakey = $('#newBerth>.berth_list>li:first-child .oneBerth_list').attr('staticareakey');
    reqBerthStaticData(shipType,staticareakey);
});


// 监听码头信息, 改变码头修改状态
$('.pierInfo_list>.pier_info').bind('input propertychange',function() {
    //进行相关操作
    // content_is_changed = true;
    // pierStatus = true;
    // 将状态保存为可保存状态
    changeBerthSaveButton(true);
});


$('.company_select>input').keyup(function(){
    console.log("输入公司信息");
    var nowVal = $(this).val();
    // 清空列表
    $("#company_name_list").empty();
    // 做一下规范化,将" '等符号正则化
    nowVal = nowVal.replace(/[\'\"]/g,"");
    // 根据输入字符串请求数据
    addPierSelectCompanyName(nowVal);
    // 根据字符串向数据库请求
});

// 点击状态会定位
$(".berth_list").delegate("li>ul>li:nth-child(3)", "click",function(){
    // var lon = parseFloat($(this).find($(".oneBerth_list")).attr("lon"));
    // var lat = parseFloat($(this).find($(".oneBerth_list")).attr("lat"));
    var lon = parseFloat($(this).children().attr("lon"));
    var lat = parseFloat($(this).children().attr("lat"));
    console.log(lon + "," + lat);
    var position_feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
    });
    position_feature.setStyle(position_style);
    position.getSource().clear();
    // console.log(position_feature);
    position.getSource().addFeatures([position_feature]);
});

/**
 * 根据保存状态，改变按钮状态
 * @param saveStatus
 */
function changeBerthSaveButton(saveStatus) {
    if(saveStatus){
        $('#berth_save').removeAttr("style");
        $('#berth_save').removeAttr("disabled")
    }
    else{
        $('#berth_save').attr("style", "background:#ccc");
        $('#berth_save').attr("disabled", "disabled")
    }
}


/**
 * 泊位统计分析弹出框事件
 */
//弹出框关闭事件
$('.newBerthAnch_title>.close_btn').click(function(){
    $(this).parent().parent().css('display','none');
    // $('#newBerth').fadeIn(600);
});
//船舶类型选择
$('.berthStat_shipType>ul>li').click(function(){
    var shipType = $(this).text();
    $('.berthStat_shipType>span:nth-child(2)').text(shipType);
    $(this).parent().slideUp(200);
    //获取统计数据
    var staticareakey = $('#newBerth>.berth_list>li:first-child .oneBerth_list').attr('staticareakey');
    reqBerthStaticData(shipType,staticareakey);
});

//设置获取泊位统计数据函数
function reqBerthStaticData(shipType,staticareakey){
    // console.log(shipType);
    var param = '{"shipType":"'+shipType+'","staticareakey":"'+staticareakey+'"}';
    $.ajax({
        url:'/berth/reqShipStaticData',
        type:'get',
        data:{param:param},
        success: function(data){
            // console.log(data);
            var sendData = data[1];
            var jsonData = JSON.parse(sendData);
            // console.log(jsonData);
            $('#BerthStatistics>tbody').empty();
            var MAXLOA = [0,0,0,0,0,0,0,0,0,0,0,0];
            var MAXBEAM = [0,0,0,0,0,0,0,0,0,0,0,0];
            var MAXDRAFT = [0,0,0,0,0,0,0,0,0,0,0,0];
            var MAXDWT = [0,0,0,0,0,0,0,0,0,0,0,0];
            var MAXDTPH = [0,0,0,0,0,0,0,0,0,0,0,0];
            for(var i=0;i<jsonData.length;i++) {
                var j = parseInt(jsonData[i].Date.substr(4,2))-1;
                var LOA = jsonData[i].LOA=='null' ? 0 : parseFloat(jsonData[i].LOA);
                var BRAM = jsonData[i].MouldedBeam=='null' ? 0 : parseFloat(jsonData[i].MouldedBeam);
                var DRAFT = jsonData[i].DesignedDraft=='null' ? 0 : parseFloat(jsonData[i].DesignedDraft);
                var DWT = jsonData[i].DWT=='null' ? 0 : parseInt(jsonData[i].DWT);
                var DTPH = jsonData[i].DTPH=='null' ? 0 : parseFloat(jsonData[i].DTPH);
                if(LOA > parseFloat(MAXLOA[j])){MAXLOA[j] = LOA;}
                if(BRAM > parseFloat(MAXBEAM[j])){MAXBEAM[j] = BRAM;}
                if(DRAFT > parseFloat(MAXDRAFT[j])){MAXDRAFT[j] = DRAFT;}
                if(DWT > parseInt(MAXDWT[j])){MAXDWT[j] = DWT;}
                if(DTPH > parseFloat(MAXDTPH[j])){MAXDTPH[j] = DTPH;}
            }
            for(var i=0;i<12;i++){
                var StaticInfoStr = '<tr><td>'+parseInt(i+1)+'月</td><td>'+MAXLOA[i]+'</td><td>'+MAXBEAM[i]+'</td><td>'+MAXDRAFT[i]+'</td><td>'+MAXDWT[i]+'</td><td>'+MAXDTPH[i]+'</td></tr>';
                // var StaticInfoStr = '<tr><td>'+parseInt(i+1)+'月</td><td>'+MAXLOA[i]+'</td><td>'+MAXBEAM[i]+'</td><td>'+MAXDRAFT[i]+'</td><td>'+MAXDWT[i]+'</td></tr>';
                $('#BerthStatistics>tbody').append(StaticInfoStr);
            }
        },
        error: function(err){
            console.log(err);
        }
    });
}

/**
 * 锚地管理
 */

//锚地目的港列表显示
$('.add_oneIntentPort_btn').click(function(){
    $(this).next().slideDown(200);
});
$('.anchInfo_intentPort').mouseleave(function(){
    $(this).children('.anch_IntentPort').children('.AllIntentPort_List').slideUp(200);
});
// shiptest();
function shiptest(){
    var sendData = "[";
    sendData += '{"LOA":"111", "BEAM":"111", "DRAFT":"111", "DWT":"111111", "DTPH":"111111", "date":"2017/01/11 11:11:11"},';
    sendData += '{"LOA":"121", "BEAM":"121", "DRAFT":"121", "DWT":"122221", "DTPH":"112111", "date":"2017/01/12 11:11:11"},';
    sendData += '{"LOA":"101", "BEAM":"121", "DRAFT":"121", "DWT":"100001", "DTPH":"100001", "date":"2017/01/14 11:11:11"},';
    sendData += '{"LOA":"222", "BEAM":"222", "DRAFT":"222", "DWT":"222222", "DTPH":"222222", "date":"2017/02/12 11:11:11"},';
    sendData += '{"LOA":"333", "BEAM":"333", "DRAFT":"333", "DWT":"333333", "DTPH":"333333", "date":"2017/03/13 11:11:11"},';
    sendData += '{"LOA":"444", "BEAM":"444", "DRAFT":"444", "DWT":"444444", "DTPH":"444444", "date":"2017/04/14 11:11:11"},';
    sendData += '{"LOA":"123", "BEAM":"123", "DRAFT":"123", "DWT":"112323", "DTPH":"212313", "date":"2017/05/14 11:11:11"},';
    sendData += '{"LOA":"123", "BEAM":"434", "DRAFT":"234", "DWT":"3232131", "DTPH":"123123", "date":"2017/06/14 11:11:11"},';
    sendData += '{"LOA":"425", "BEAM":"234", "DRAFT":"345", "DWT":"131232", "DTPH":"341232", "date":"2017/07/14 11:11:11"},';
    sendData += '{"LOA":"345", "BEAM":"435", "DRAFT":"456", "DWT":"212334", "DTPH":"413223", "date":"2017/08/14 11:11:11"},';
    sendData += '{"LOA":"879", "BEAM":"345", "DRAFT":"567", "DWT":"312345", "DTPH":"512323", "date":"2017/09/14 11:11:11"},';
    sendData += '{"LOA":"213", "BEAM":"768", "DRAFT":"567", "DWT":"967123", "DTPH":"412335", "date":"2017/10/14 11:11:11"},';
    sendData += '{"LOA":"324", "BEAM":"678", "DRAFT":"546", "DWT":"131232", "DTPH":"431235", "date":"2017/11/14 11:11:11"},';
    sendData += '{"LOA":"456", "BEAM":"678", "DRAFT":"565", "DWT":"312324", "DTPH":"123123", "date":"2017/12/14 11:11:11"}';
    sendData += "]";
    var jsonData = JSON.parse(sendData);
    console.log(jsonData);
    $('#BerthStatistics>tbody').empty();
    var date = new Date;
    var MAXLOA = [0,0,0,0,0,0,0,0,0,0,0,0];
    var MAXBEAM = [0,0,0,0,0,0,0,0,0,0,0,0];
    var MAXDRAFT = [0,0,0,0,0,0,0,0,0,0,0,0];
    var MAXDWT = [0,0,0,0,0,0,0,0,0,0,0,0];
    var MAXDTPH = [0,0,0,0,0,0,0,0,0,0,0,0];
    for(var i=0;i<jsonData.length;i++) {
        date = new Date(jsonData[i].date);
        var j = date.getMonth();
        // console.log(j);
        if(parseFloat(jsonData[i].LOA) > parseFloat(MAXLOA[j])){MAXLOA[j] = parseFloat(jsonData[i].LOA);}
        if(parseFloat(jsonData[i].BEAM) > parseFloat(MAXBEAM[j])){MAXBEAM[j] = parseFloat(jsonData[i].BEAM);}
        if(parseFloat(jsonData[i].DRAFT) > parseFloat(MAXDRAFT[j])){MAXDRAFT[j] = parseFloat(jsonData[i].DRAFT);}
        if(parseInt(jsonData[i].DWT) > parseInt(MAXDWT[j])){MAXDWT[j] = parseInt(jsonData[i].DWT);}
        if(parseInt(jsonData[i].DTPH) > parseInt(MAXDTPH[j])){MAXDTPH[j] = parseInt(jsonData[i].DTPH);}
    }
    for(var i=0;i<12;i++){
        var StaticInfoStr = '<tr><td>'+parseInt(i+1)+'月</td><td>'+MAXLOA[i]+'</td><td>'+MAXBEAM[i]+'</td><td>'+MAXDRAFT[i]+'</td><td>'+MAXDWT[i]+'</td><td>'+MAXDTPH[i]+'</td></tr>';
        $('#BerthStatistics>tbody').append(StaticInfoStr);
    }
}