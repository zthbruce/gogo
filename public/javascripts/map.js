/**
 * Created by Truth on 2017/11/3.
 * 显示地图
 */

// 初始缩放等级
let initLevel = 4;

// 基本地图
let basic = blmol.layer.createGoogleTile('basic');
// 卫星地图
let satellite = blmol.layer.createGGSatelliteTile("satellite");
// 电子海图
let haitu = blmol.layer.createESeaTile('haitu');
// 停泊区域图标层
let icon = blmol.layer.createVectorLayer('icon', 0, 30);
// 停泊区域点层
let  point = blmol.layer.createVectorLayer('point', 0, 30);
// 航线层
let  route = blmol.layer.createVectorLayer('route', 0, 30);
// 定位图标显示层
let position = blmol.layer.createVectorLayer('position', 0, 30);
// 当前操作图层
let current = blmol.layer.createVectorLayer('current', 0, 30);
// 锚地区域图层
let anch = blmol.layer.createVectorLayer('anch', 0, 30);
//港口图标显示层
let portLayer = blmol.layer.createVectorLayer('portLogo',0, 30);
// 标尺层
let range_source = new ol.source.Vector({wrapX:true});
let range_vector = new ol.layer.Vector({
    id : "draw layer",
    source : range_source,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#AE7528',       //测距完成后线颜色
            width: 2                //测距完成后线宽度
        })
    })
});


// 地图基本作画功能
let draw = new ol.interaction.Draw({});
let source = new ol.source.Vector({wrapX:true});
let vector = new ol.layer.Vector({
    id : "draw layer",
    source:source,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#AE7528',       //测距完成后线颜色
            width: 2                //测距完成后线宽度
        })
    })
});

// 创造地图
let map = blmol.map.createMap('map', [-45.496166, -23.907], initLevel, [], true, false, false);

// 显示的图层
blmol.map.addLayer(map, basic);
blmol.map.addLayer(map, satellite);
blmol.map.addLayer(map, haitu);
blmol.map.addLayer(map, icon);
blmol.map.addLayer(map, point);
blmol.map.addLayer(map, route);
blmol.map.addLayer(map, portLayer);
blmol.map.addLayer(map, range_vector);
blmol.map.addLayer(map, vector);
blmol.map.addLayer(map, position);
blmol.map.addLayer(map, anch);
blmol.map.addLayer(map, current);



function setMapShow() {
    satellite.setVisible(false);
    haitu.setVisible(false);
    basic.setVisible(false);
    if($('.map_mouse_select').index() == 0){
        haitu.setVisible(false);
        basic.setVisible(true);
        satellite.setVisible(false);
        $(".basic_map_list>div").eq(0).addClass("map_mouse_select");
    }else if($('.map_mouse_select').index() == 1){
        satellite.setVisible(true);
        haitu.setVisible(false);
        basic.setVisible(false);
        $(".basic_map_list>div").eq(1).addClass("map_mouse_select");
    }else if($('.map_mouse_select').index() == 3){
        satellite.setVisible(false);
        haitu.setVisible(true);
        basic.setVisible(true);
        $(".basic_map_list>div").eq(2).addClass("map_mouse_select");
    }else{
        basic.setVisible(true);
    }
    $('#weitu').on('click',function () {
        satellite.setVisible(true);
        haitu.setVisible(false);
        basic.setVisible(false);
    });
    $('#haitu').on('click',function () {
        satellite.setVisible(false);
        haitu.setVisible(true);
        basic.setVisible(false);
    });
    $('#ditu').on('click',function () {
        haitu.setVisible(false);
        basic.setVisible(true);
        satellite.setVisible(false);
    });
}

// 获取初始地图
setMapShow();
