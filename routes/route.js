/**
 * Created by Truth on 2017/8/21.
 */

// 引入依赖
var mysql = require('../db/BlmMysql');
var util = require('util');
var utils = require('../util/Utils');
var express = require('express');
var router = express.Router();

/**
 * 获取航线的基本信息
 * 返回数据{"0":[{RouteID:, Name：}], "1":{})
 */
router.get("/getRouteBasicInfo", function (req, res, next) {
    var sql = 'SELECT BelongTo, RouteId, NAME FROM `T4103_Route';
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1])
        }
        else{
            if(results.length > 0){
                console.log("成功连接数据库");
                var route_0 = [];
                var route_1 = [];
                var route_2 = [];
                var route_3 = [];
                var route_4 = [];
                var route_5 = [];
                var route_6 = [];
                var route_7 = [];
                for(var i = 0; i < results.length; i++){
                    var ele = results[i];
                    var routeType = ele.BelongTo;
                    var content = {RouteId:ele.RouteId, Name: ele.Name};
                    switch (routeType)
                    {
                        case "0":
                            route_0.push(content);
                            break;
                        case "1":
                            route_1.push(content);
                            break;
                        case "2":
                            route_2.push(content);
                            break;
                        case "3":
                            route_3.push(content);
                            break;
                        case "4":
                            route_4.push(content);
                            break;
                        case "5":
                            route_5.push(content);
                            break;
                        case "6":
                            route_6.push(content);
                            break;
                        case "7":
                            route_7.push(content);
                            break;
                    }
                }
                res.jsonp(['200', {"0": route_0, "1": route_1, "2": route_2, "3": route_3, "4": route_4,
                    "5": route_5, "6": route_6, "7": route_7}])
            }
            else{
                console.log("无返回数据");
                res.jsonp(['304', "return nothing"])
            }
        }
    })
});

/**
 * 获取航线的具体信息
 * 请求参数 {RouteId}
 */
router.get("/getRouteDetailInfo", function (req, res, next) {
    var sql = ""
});
