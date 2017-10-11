var anchInfoList;

function getAllAnch() {
    anchInfoList =[]; // 初始化
    $.ajax({
        url: "/anch/getAnchShowInfo",
        dataType: 'json',
        cache: false,
        timeout: 5000,
        type: 'GET',
        success: function (data) {
            var res = data;
            if (res[0] === '200') {
                console.log('成功获取信息');
                var sendData = res[1];
                for (var i = 0; i < sendData.length; i++) {
                    var ele = sendData[i];
                    var anchorageKey = ele.AnchorageKey;
                    var location = ele.Location;
                    var name = ele.Name;
                    // 中心点坐标
                    var lon = ele.CenterLon;
                    var lat = ele.CenterLat;
                    // console.log(name);
                    if(location !== "") {
                        var lonLatInfo = location.split(";");
                        var lonLatList = [];
                        for (var j = 0; j < lonLatInfo.length; j++) {
                            var lon_lat = lonLatInfo[j].split("#");
                            // 正常情况
                            if(lon_lat.length === 2) {
                                lonLatList.push(ol.proj.fromLonLat([parseFloat(lon_lat[0]), parseFloat(lon_lat[1])]))
                            }
                        }
                        anchInfoList.push({
                            anchorageKey: anchorageKey,
                            name: name,
                            lonLatList: lonLatList,
                            lon: lon,
                            lat: lat
                        })
                    }
                }
                anchLayer(zoom);
            }
        },
        error: function (data, status, e) {
            console.log(e);
        }
    })
}
//
// function getLonLatList() {
//
//
// }

/**
 *  根据锚地表显示相应的区域
 */
function anchLayer(zoom){
    console.log("加载锚地详细区域");
    // console.log(anchInfoList);
    anch.getSource().clear();
    // var features = [];
    var style = {
        stroke: new ol.style.Stroke({
            color: 'blue',
            lineDash: [1, 2, 3, 4, 5, 6],
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.1)'
        })
    };
    for (var i = 0; i < anchInfoList.length; i++) {
        var anch_info = anchInfoList[i];
        var name = anch_info.name;
        var anchorageKey = anch_info.anchorageKey;
        // console.log(name);
        var lon = anch_info.lon;
        var lat = anch_info.lat;
        if(zoom>=10){
            style.text=new ol.style.Text({
                // font: '10px sans-serif' 默认这个字体，可以修改成其他的，格式和css的字体设置一样
                font: "15px",
                text: name !== "" ? name : "未命名锚地",
                fill: new ol.style.Fill({
                    color: 'black'
                }),
                textAlign: "center"
            })
        }
        var anch_style = new ol.style.Style(style);
        // 获取特性
        // console.log(anch_info.lonLatList.length);
        var feature = new ol.Feature({
            type: 0,
            anchKey: anchorageKey,
            lon: lon,
            lat: lat,
            geometry: new ol.geom.Polygon([anch_info.lonLatList])
        });
        feature.setStyle(anch_style);
        // features.push(feature);
        anch.getSource().addFeature(feature);
    }
    // anch.getSource().addFeatures(features);
}
// function anchLayer(level){
//     if (level >= 10) {
//         console.log("加载锚地详细区域");
//         // console.log(anchInfoList);
//         anch.getSource().clear();
//         // var features = [];
//         for (var i = 0; i < anchInfoList.length; i++) {
//             var anch_info = anchInfoList[i];
//             var name = anch_info.name;
//             var anchorageKey = anch_info.anchorageKey;
//             var lon = anch_info.lon;
//             var lat = anch_info.lat;
//             console.log(anchorageKey);
//             console.log(name);
//             var anch_style = new ol.style.Style({
//                 stroke: new ol.style.Stroke({
//                     color: 'blue',
//                     lineDash: [1, 2, 3, 4, 5, 6],
//                     width: 3
//                 }),
//                 fill: new ol.style.Fill({
//                     color: 'rgba(0, 0, 255, 0.1)'
//                 }),
//                 text: new ol.style.Text({
//                     // font: '10px sans-serif' 默认这个字体，可以修改成其他的，格式和css的字体设置一样
//                     font: "15px",
//                     text: name !== "" ? name : "未命名锚地",
//                     fill: new ol.style.Fill({
//                         color: 'black'
//                     }),
//                     textAlign: "center"
//                 })
//             });
//             // 获取特性
//             console.log(anch_info.lonLatList);
//             var feature = new ol.Feature({
//                 type: 0,
//                 anchKey: anchorageKey,
//                 lon: lon,
//                 lat: lat,
//                 geometry: new ol.geom.Polygon([anch_info.lonLatList])
//             });
//             feature.setStyle(anch_style);
//             // features.push(feature);
//             anch.getSource().addFeature(feature);
//         }
//         // anch.getSource().addFeatures(features);
//     }
//     else{
//         console.log("加载中心位置信息");
//         anch.getSource().clear();
//         // var features = [];
//         for (var i = 0; i < anchInfoList.length; i++) {
//             var anch_info = anchInfoList[i];
//             // var name = anch_info.name;
//             var anchorageKey = anch_info.anchorageKey;
//             var lon = anch_info.lon;
//             var lat = anch_info.lat;
//             // console.log(anchorageKey);
//             // console.log(name);
//             // var anch_style = new ol.style.Style({
//             //     stroke: new ol.style.Stroke({
//             //         color: 'blue',
//             //         lineDash: [1, 2, 3, 4, 5, 6],
//             //         width: 3
//             //     }),
//             //     fill: new ol.style.Fill({
//             //         color: 'rgba(0, 0, 255, 0.1)'
//             //     }),
//             //     text: new ol.style.Text({
//             //         // font: '10px sans-serif' 默认这个字体，可以修改成其他的，格式和css的字体设置一样
//             //         font: "15px",
//             //         text: name !== "" ? name : "未命名锚地",
//             //         fill: new ol.style.Fill({
//             //             color: 'black'
//             //         }),
//             //         textAlign: "center"
//             //     })
//             // });
//             // 获取特性
//             // console.log(anch_info.lonLatList);
//             var feature = new ol.Feature({
//                 type: 0,
//                 anchKey: anchorageKey,
//                 lon: lon,
//                 lat: lat,
//                 geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
//                 // geometry: new ol.geom.Polygon([anch_info.lonLatList])
//             });
//             feature.setStyle(exist_anch_style);
//             anch.getSource().addFeature(feature);
//         }
//     }
// }