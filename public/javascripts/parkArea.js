/**
 * Created by Truth on 2017/6/15.
 */

var cluster_id_list = [];
var cluster_id = '';
var allPoints = {};


// 获取点信息
function getAllPoints() {
    $.ajax({
        async: false,
        url: "/parkArea/getInfo",
        dataType: 'json',
        cache: false,
        timeout: 5000,
        type: 'GET',
        success: function (data) {
            var res = data;
            // 返回的代码
            // 成功获取数据,数据结构<cluster_id, lon, lat, level, type>
            if (res[0] === '200') {
                console.log('成功获取信息');
                var sendData = res[1];
                // console.log(sendData);
                allPoints = JSON.parse(sendData);
                parkAreaLayer(); // 首先刷新一次
            }
        },
        error: function (data, status, e) {
            console.log(e);
        }
    })
}

/**
 * 显示停泊区域图标
 */
function parkAreaLayer(){
    var ele;
    var park_feature;
    var lon;
    var lat;
    var features = [];
    for(var key in allPoints){
        ele = allPoints[key];
        lon = ele['lon'];
        lat = ele['lat'];
        var lat_lon = WGS84transformer(lat, lon);
        var type = ele['type']; // 属于哪一类， 目前有0：锚地， 1：泊位， 2：未知区域
        park_feature = new ol.Feature({
            'lon' : lon,
            'lat': lat,
            'name': 'parkArea',
            // 'CargoTypeKey': ele["CargoTypeKey"], //装载类型
            'portID': ele["PortID"],
            'type': type,
            'cluster_id' : key,
            'Checked': ele['Checked'],
            geometry: new ol.geom.Point(ol.proj.fromLonLat([lat_lon[1], lat_lon[0]]))
        });
        park_feature.setId(key);
        // if(type === 0){
        //     // 锚地
        //     park_feature.set('anch', true)
        // }
        // else{
        //     park_feature.set('berth', true)
        // }
        if(ele['Checked'] === 0){
            park_feature.setStyle(park_style[type]);
        }
        else{
            park_feature.setStyle(berth_yes);
        }
        features.push(park_feature);
    }
    icon.getSource().clear();
    icon.getSource().addFeatures(features);
}

// function iconLayer(level, area){
//     // var count = allPoints.length;
//     var ele;
//     var park_feature;
//     // var pie_feature;
//     var lon;
//     var lat;
//     var features = [];
//     var areaNum = 0;
//     // var _cluster_id;
//     // var type = 0;
//     var _cluster_id_list = [];
//     for(var key in allPoints){
//         ele = allPoints[key];
//         lon = ele['lon'];
//         lat = ele['lat'];
//         type = ele['type']; // 属于哪一类， 目前有0：锚地， 1：泊位， 2：未知区域
//         // if(lon >= area[0] && lon <= area[2] && lat >= area[1] && lat <= area[3] && ele['level'] <= level) {
//         if(lon >= area[0] && lon <= area[2] && lat >= area[1] && lat <= area[3]) {
//             // 保留目前这个点的cluster_id
//             park_feature = new ol.Feature({
//                 'lon' : lon,
//                 'lat': lat,
//                 'CargoTypeKey': ele["CargoTypeKey"], //装载类型
//                 'portID': ele["PortID"],
//                 'type': type,
//                 'cluster_id' : key,
//                 geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
//             });
//             park_feature.setId(key);
//             if(ele['Checked'] == 0){
//                 park_feature.setStyle(park_style[type]);
//             }
//             else{
//                 park_feature.setStyle(berth_yes);
//             }
//             features.push(park_feature);
//             areaNum++;
//             _cluster_id_list.push(key);
//             // _cluster_id = key;
//         }
//     }
//     // console.log(areaNum);
//     icon.getSource().clear();
//     icon.getSource().addFeatures(features);
//     // if(areaNum === 1 && level >= 14 && cluster_id !== _cluster_id){
//     if(level >= 17 && cluster_id_list.toString() !== _cluster_id_list.toString()){
//         // cluster_id = _cluster_id;
//         // console.log("只有一个区域");
//         // console.log(cluster_id);
//         console.log("显示点集");
//         cluster_id_list = _cluster_id_list;
//         point.getSource().clear();
//         // 点图
//         pointLayer(cluster_id_list);
//         // 轮廓线图
//         // contourLayer(cluster_id);
//     }
//     else {
//         if(level < 17){
//             //清除图层，并将cluster_id归位
//             // cluster_id = '';
//             cluster_id_list = [];
//             point.getSource().clear()
//         }
//     }
// }


/**
 * 更新停泊区域的类型
 * @param cluster_id
 * @param type
 * 0表示锚地， 1表示泊位，2表示不明区域
 */
function updateParkAreaType(cluster_id, type) {
    $.ajax({
        // url: OL_Action_Root + "/icon/getInfo",
        data: {cluster_id: cluster_id, type: type},
        url: "/icon/modifyType",
        dataType: 'json',
        cache: false,
        timeout: 5000,
        type: 'GET',
        success: function (data) {
            // 返回的代码
            if (data[0] === '200') {
                console.log(data[1]);
                var zoom = blmol.operation.getZoom(map);
                // 更新内存内的信息
                var info = allPoints[cluster_id];
                info["type"] = type;
                allPoints[cluster_id] = info;
                if(zoom >= 7){
                    // var extent = blmol.operation.getCurrentExtent(map);
                    parkAreaLayer();
                }
            }
            else{
                console.log('修改失败');
            }
        },
        error: function (data, status, e) {
            console.log(e);
        }
    })
}







