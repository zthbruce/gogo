/**
 * Created by Truth on 2017/9/7.
 * 航次管理
 */


// 引入依赖
var mysql = require('../db/BlmMysql');
var util = require('util');
var utils = require('../util/Utils');
var express = require('express');
var router = express.Router();

/**
 * 请求航次列表信息
 * 传入参数: FleetNumber
 */
router.get("/getVoyageList", function (req, res, next) {
    var fleetNumber = req.query.FleetNumber;
    var sql = util.format('SELECT t1.VoyageKey, t1.ShipNumber, Name, LocalName, IMO, DepartureTime , ' +
        'DeparturePortID, ArrivalTime, ArrivalPortID, t1.Checked FROM T3101_Voyage t1 ' +
        'LEFT JOIN T0101_Ship t2 ON t1.ShipNumber = t2.ShipNumber LEFT JOIN T4101_Fleet t3 ON t2.ShipNumber = t3.ShipNumber ' +
        'WHERE FleetNumber = "%s" ORDER BY t1.Checked DESC, ArrivalTime DESC', fleetNumber);
    mysql.query(sql, function (err, results) {
        if(err){
            res.jsonp(["404", utils.eid1])
        }
        else{
            if(results.length > 0){
                res.jsonp(["200", results])
            }
            else{
                res.jsonp(["304", "return nothing"])
            }
        }
    })
});


/**
 * 请求该船对应航次信息
 * 传入参数: voyageKey
 */
router.get("/getVoyage", function (req, res, next) {
    var voyageKey = req.query.VoyageKey;
    var sql = util.format("SELECT * FROM T3101_Voyage t1 LEFT JOIN T0101_Ship t2 " +
        "ON t1.ShipNumber = t2.ShipNumber WHERE VoyageKey = '%s'", voyageKey);
    mysql.query(sql, function (err, results) {
        if(err){
            res.jsonp(["404", utils.eid1]);
        }
        else{
            if(results.length > 0){
                res.jsonp(["200", results])
            }
            else{
                res.jsonp(['304', '没有返回数据'])
            }
        }
    })
});

/**
 * 获取航线流水详情
 */
router.get("/getVoyageDetail", function (req, res, next) {
    var voyageKey = req.query.VoyageKey;
    var sql = util.format("SELECT * FROM T3102_VoyageDetails WHERE VoyageKey = '%s'", voyageKey);
    mysql.query(sql, function (err, results) {
        if(err){
            res.jsonp(["404", utils.eid1]);
        }
        else{
            if(results.length > 0){
                res.jsonp(["200", results])
            }
            else{
                res.jsonp(['304', '没有返回数据'])
            }
        }
    })
});

/**
 * 获得一艘船的历史航次
 */
router.get("/getVoyageList2Ship", function (req, res, next) {
    var shipNumber = req.query.ShipNumber;
    var sql = util.format("SELECT VoyageKey, DepartureTime FROM T3101_Voyage WHERE ShipNumber = '%s' ORDER BY VoyageKey DESC", shipNumber);
    mysql.query(sql, function (err, results) {
        if(err){
            res.jsonp(["404", utils.eid1]);
        }
        else{
            if(results.length > 0){
                res.jsonp(["200", results])
            }
            else{
                res.jsonp(['304', '没有返回数据'])
            }
        }
    })
});

/**
 * 获取用途
 */
router.get("/getPurpose", function (req, res, next) {
    var sql = 'SELECT * FROM T2111_Purpose';
    mysql.query(sql, function (err, results) {
        if(err){
            res.jsonp(["404", utils.eid1]);
        }
        else{
            if(results.length > 0){
                res.jsonp(["200", results])
            }
            else{
                res.jsonp(['304', '没有返回数据'])
            }
        }
    })
});

// /**
//  * 获取货物类型
//  */
// router.get("/getCargo", function (req, res, next) {
//     var sql = 'SELECT * FROM T2110_CargoType';
//     mysql.query(sql, function (err, results) {
//         if(err){
//             res.jsonp(["404", utils.eid1]);
//         }
//         else{
//             if(results.length > 0){
//                 res.jsonp(["200", results])
//             }
//             else{
//                 res.jsonp(['304', '没有返回数据'])
//             }
//         }
//     })
// });






module.exports = router;
