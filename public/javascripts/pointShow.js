/**
 * Created by Truth on 2017/6/19.
 */
// function pointLayer(cluster_id)
// {
//     $.ajax({
//         data: {cluster_id: cluster_id},
//         // async: false,
//         url: "/pointShow",
//         dataType: 'jsonp',
//         cache: true,
//         timeout: 500000,
//         type:'GET',
//         success: function(data){
//             var res = data;
//             // point.getSource().clear();
//             // 成功获取数据,数据结构<cluster_id, [[lon, lat], ...]
//             if(res[0] === '200')
//             {
//                 console.log('成功获取信息');
//                 var ele;
//                 var feature;
//                 var sendData = res[1];
//                 // console.log(sendData);
//                 var jsonData = JSON.parse(sendData);
//                 var lon_lat_info = jsonData['lat_lon_info'];
//                 var count = lon_lat_info.length;
//                 var features = new Array(count);  //形成图标集合列表,Array<ol.Features>
//                 console.log(count);
//                 while(count--) {
//                     ele = lon_lat_info[count];
//                     feature = new ol.Feature({
//                         id: jsonData['cluster_id'],
//                         geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(ele[0]), parseFloat(ele[1])]))
//                     });
//                     feature.setStyle(point_style);
//                     features[count] = feature;
//                 }
//                 point.getSource().addFeatures(features);
//             }
//             else
//             {
//                 console.log( res[0] + ': return nothing');
//             }
//         },
//         error: function(data, status, e){
//             console.log("unknown error");
//         }
//     });
// }

// 根据当前区域做请求
function pointLayer(level, area) {
    var _cluster_id_list = [];
    for(var key in allPoints) {
        var ele = allPoints[key];
        var lon = ele['lon'];
        var lat = ele['lat'];
        // 范围内部的点击加载
        if (lon >= area[0] && lon <= area[2] && lat >= area[1] && lat <= area[3]) {
            _cluster_id_list.push(key);
        }
    }
    if(level >= 17 && cluster_id_list.toString() !== _cluster_id_list.toString()){
        console.log("显示点集");
        cluster_id_list = _cluster_id_list;
        point.getSource().clear();
        // 点图
        $.ajax({
            data: {cluster_id_list: cluster_id_list},
            url: "/pointShow",
            dataType: 'jsonp',
            cache: true,
            timeout: 500000,
            type:'GET',
            success: function(data){
                var res = data;
                // point.getSource().clear();
                // 成功获取数据,数据结构<cluster_id, [[lon, lat], ...]
                if(res[0] === '200')
                {
                    console.log('成功获取信息');
                    var ele;
                    var feature;
                    var sendData = res[1];
                    // console.log(sendData);
                    var jsonData = JSON.parse(sendData);
                    var lon_lat_info = jsonData['lat_lon_info'];
                    var count = lon_lat_info.length;
                    var features = new Array(count);  //形成图标集合列表,Array<ol.Features>
                    console.log(count);
                    while(count--) {
                        ele = lon_lat_info[count];
                        feature = new ol.Feature({
                            // id: jsonData['cluster_id'],
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(ele[0]), parseFloat(ele[1])]))
                        });
                        feature.setStyle(point_style);
                        features[count] = feature;
                    }
                    point.getSource().addFeatures(features);
                }
                else
                {
                    console.log( res[0] + ': return nothing');
                }
            },
            error: function(data, status, e){
                console.log("unknown error");
            }
        });
    }
    else {
        if(level < 17){
            cluster_id_list = [];
            point.getSource().clear()
        }
    }
}
// function pointLayer(cluster_id_list)
// {
//     $.ajax({
//         data: {cluster_id_list: cluster_id_list},
//         // async: false,
//         url: "/pointShow",
//         dataType: 'jsonp',
//         cache: true,
//         timeout: 500000,
//         type:'GET',
//         success: function(data){
//             var res = data;
//             // point.getSource().clear();
//             // 成功获取数据,数据结构<cluster_id, [[lon, lat], ...]
//             if(res[0] === '200')
//             {
//                 console.log('成功获取信息');
//                 var ele;
//                 var feature;
//                 var sendData = res[1];
//                 // console.log(sendData);
//                 var jsonData = JSON.parse(sendData);
//                 var lon_lat_info = jsonData['lat_lon_info'];
//                 var count = lon_lat_info.length;
//                 var features = new Array(count);  //形成图标集合列表,Array<ol.Features>
//                 console.log(count);
//                 while(count--) {
//                     ele = lon_lat_info[count];
//                     feature = new ol.Feature({
//                         // id: jsonData['cluster_id'],
//                         geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(ele[0]), parseFloat(ele[1])]))
//                     });
//                     feature.setStyle(point_style);
//                     features[count] = feature;
//                 }
//                 point.getSource().addFeatures(features);
//             }
//             else
//             {
//                 console.log( res[0] + ': return nothing');
//             }
//         },
//         error: function(data, status, e){
//             console.log("unknown error");
//         }
//     });
// }


// load data from mysql
// var rootURL = "http://192.168.30.112:8047/query.json";
//
// function queryToJSON(query) {
//     return JSON.stringify({
//         "queryType": "SQL",
//         "query": query
//     });
// }
//
//
// function pointLayer(cluster_id)
// {
//     var zero = "0000000000";
//     var cluster = zero.substring(0, 10 - cluster_id.length) + cluster_id;
//     // var query = "SELECT CONVERT_FROM(t.f.v, 'UTF8') AS info FROM hbase.`result` t  WHERE row_key >= '" + cluster + "' AND row_key < '" + cluster + "\$'";
//     var query = "SELECT CONVERT_FROM(t.f.v, 'UTF8') AS info FROM hbase.`result` t LIMIT 10";
//     console.log(query);
//     $.ajax({
//         type: 'POST',
//         contentType: 'application/json',
//         url: rootURL,
//         dataType: "json",
//         crossDomain : true,
//         data: queryToJSON(query),
//         success: function(data) {
//             console.log(' success: ' + data);
//             var ele;
//             var feature;
//             var jsData = JSON.parse(data);
//             var count = jsData.length;
//             var features = new Array(count);  //形成图标集合列表,Array<ol.Features>
//             point.getSource().clear();
//             console.log(count);
//             while(count--) {
//                 ele = jsData[count].info.split(","); // 将info分割
//                 feature = new ol.Feature({
//                     id: cluster_id,
//                     geometry: new ol.geom.Point(ol.proj.fromLonLat([parseFloat(ele[0]), parseFloat(ele[1])]))
//                 });
//                 // feature.setStyle(point_style);
//                 // features[count] = feature;
//             }
//             // point.getSource().addFeatures(features);
//         },
//         error: function(jqXHR, textStatus, errorThrown) {
//             alert('error: ' + textStatus);
//         }
//     });
// }




