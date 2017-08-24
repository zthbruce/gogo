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
    var sql = 'SELECT BelongTo, RouteId, Name FROM T4103_Route';
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
                    // console.log(routeType.length);
                    var content = {RouteId:ele.RouteId, Name: ele.Name};
                    // if(routeType == "0"){
                    //     console.log("here");
                    //     route_0.push(content);
                    // }
                    // else if(routeType == "1"){
                    //     route_1.push(content);
                    // }
                    // else if(routeType == "2"){
                    //     route_2.push(content);
                    // }
                    // else if(routeType == "3"){
                    //     route_3.push(content);
                    // }
                    // else if(routeType == "4"){
                    //     route_4.push(content);
                    // }
                    // else if(routeType == "5"){
                    //     route_5.push(content);
                    // }
                    // else if(routeType == "6"){
                    //     route_6.push(content);
                    // }
                    // else if(routeType == "7"){
                    //     route_7.push(content);
                    // }
                    //
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
                        default:
                            console.log("nothing");
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
 * 返回信息 航线具体信息
 */
router.get("/getRouteDetailInfo", function (req, res, next) {
    var routeId = req.query.RouteId;
    var sql = util.format("SELECT * FROM `T4103_Route`  WHERE RouteId = '%s'", routeId);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(["404", utils.eid1])
        }
        else{
            if(results.length>0){
                console.log(["200", results]);
                res.jsonp(["200", results])
            }
            else{
                console.log(["304", 'return nothing']);
                res.jsonp(["304", 'return nothing'])
            }
        }
    })
});

/**
 * 获取相关的码头
 */
router.get("/getRelatePort", function (req, res, next) {
    var sql =   "SELECT portID FROM `T2103_TerminalDetails` t1 LEFT JOIN `T2102_Terminal`  t2 ON t1.`TerminalKey` = t2.`TerminalKey`";
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(["404", utils.eid1])
        }else{
            // console.log(["200", results]);
            res.jsonp(["200", results])
        }
    })
});

/**
 * 保存信息
 */
router.get("/saveRouteDetailInfo", function (req, res, next) {
    var param = req.query;
    var sql = util.format("UPDATE T4103_Route SET DeparturePort = '%s',  ArrivalPort = '%s', DWT = '%s', LOA = '%s', Beam= '%s', Draft= '%s', LoadingWaitTime= '%s', DischargeWaitTime= '%s', DWTPH= '%s', Sun_Holiday= '%s', ENDes= '%s', CNDes = '%s' WHERE RouteId = '%s'",
        param.DeparturePort, param.ArrivalPort, param.DWT, param.LOA, param.Beam, param.Draft, param.LoadingWaitTime,
        param.DischargeWaitTime, param.DWTPH, param.Sun_Holiday, param.ENDes, param.CNDes, param.RouteId);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(["404", utils.eid1])
        }else{
            console.log(["200", "成功保存航线信息"]);
            res.jsonp(["200", "成功保存航线信息"])
        }
    })
});


module.exports = router;
