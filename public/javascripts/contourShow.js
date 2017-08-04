/**
 * Created by Truth on 2017/6/26.
 */

/**
 * 根据 cluster_id 生成对应的轮廓线
 * @param cluster_id
 */
function contourLayer(cluster_id)
{
    $.ajax({
        data: {cluster_id: cluster_id},
        // async: false,
        url: "/contourShow",
        dataType: 'json',
        cache: false,
        timeout: 5000,
        type:'GET',
        success: function(data){
            var res = data;
            // 成功获取数据,数据结构{info:}
            if(res[0] === '200')
            {
                console.log('成功获取信息');
                var ele;
                var feature;
                var sendData = res[1];
                var jsonData = JSON.parse(sendData);
                var lonLatInfo = jsonData.info.split(";");
                for(var i = 0; i < lonLatInfo.length; i++){
                    ele = lonLatInfo[i].split("#");
                    lonLatInfo[i] = ol.proj.fromLonLat([parseFloat(ele[0]), parseFloat(ele[1])])
                }
                // var polygon = new ol.geom.Polygon([lonLatInfo]);
                // polygon.transform('EPSG:4326', 'EPSG:3857');
                feature = new ol.Feature({
                    id: cluster_id,
                    geometry: new ol.geom.Polygon([lonLatInfo])
                });
                feature.setStyle(contour_style);
                point.getSource().addFeature(feature);
            }
            else
            {
                console.log(res[0] + ': return nothing');
            }
        },
        error: function(data, status, e){
            console.log("unknown error");
        }
    });
}
