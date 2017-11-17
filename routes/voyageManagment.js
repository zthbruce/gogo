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
    var checkList = req.query.CheckList;
    var checkInfo;
    if(checkList.length === 2){
        checkInfo = "('0', '1')"
    }
    else{
        checkInfo = "('" + checkList[0] + "')";
    }
    let sql = util.format('SELECT * FROM (SELECT t1.VoyageKey, t1.ShipNumber, Name, LocalName, IMO, DepartureTime , ' +
        'DeparturePortID, ArrivalTime, ArrivalPortID, t1.Checked FROM T3101_Voyage_20171117bak_copy t1 LEFT JOIN T0101_Ship t2 ON t1.ShipNumber = t2.ShipNumber ' +
        'LEFT JOIN T4101_Fleet t3 ON t2.ShipNumber = t3.ShipNumber WHERE FleetNumber = "%s" AND t1.Checked IN %s AND IsValid = "1" ' +
        'ORDER BY t1.Checked DESC, IFNULL(ArrivalTime,"9999999999") DESC) t GROUP BY t.ShipNumber ORDER BY IFNULL(ArrivalTime,"9999999999") DESC, DepartureTime DESC', fleetNumber, checkInfo);
    // var sql = util.format('SELECT t1.VoyageKey, t1.ShipNumber, Name, LocalName, IMO, DepartureTime , ' +
    //     'DeparturePortID, ArrivalTime, ArrivalPortID, t1.Checked FROM T3101_Voyage_20171117bak_copy t1 ' +
    //     'LEFT JOIN T0101_Ship t2 ON t1.ShipNumber = t2.ShipNumber LEFT JOIN T4101_Fleet t3 ON t2.ShipNumber = t3.ShipNumber ' +
    //     'WHERE FleetNumber = "%s" AND t1.Checked IN %s ORDER BY t1.Checked DESC, ArrivalTime LIMIT 100', fleetNumber, checkInfo);
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

// router.get("/getVoyageList", function (req, res, next) {
//     var fleetNumber = req.query.FleetNumber;
//     var sql = util.format('SELECT t1.VoyageKey, t1.MMSI, Name, LocalName, IMO, DepartureTime , ' +
//         'DeparturePortID, ArrivalTime, ArrivalPortID, t1.Checked FROM T3101_Voyage_20171117bak_copy t1 ' +
//         'LEFT JOIN T4101_Fleet t2 ON t1.MMSI = t2.MMSI LEFT JOIN T0101_Ship t3 ON t2.ShipNumber = t3.ShipNumber ' +
//         'WHERE FleetNumber = "%s" ORDER BY t1.Checked DESC, ArrivalTime DESC LIMIT 100', fleetNumber);
//     mysql.query(sql, function (err, results) {
//         if(err){
//             res.jsonp(["404", utils.eid1])
//         }
//         else{
//             if(results.length > 0){
//                 res.jsonp(["200", results])
//             }
//             else{
//                 res.jsonp(["304", "return nothing"])
//             }
//         }
//     })
// });


/**
 * 请求该船对应航次信息
 * 传入参数: voyageKey
 */
router.get("/getVoyage", function (req, res, next) {
    var voyageKey = req.query.VoyageKey;
    var sql = util.format("SELECT * FROM T3101_Voyage_20171117bak_copy t1 LEFT JOIN T0101_Ship t2 " +
        "ON t1.ShipNumber = t2.ShipNumber WHERE VoyageKey = '%s' AND IsValid = '1' ", voyageKey);
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
    var sql = util.format("SELECT * FROM T3102_VoyageDetails_20171117bak_copy WHERE VoyageKey = '%s'", voyageKey);
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
    var ShipNumber = req.query.ShipNumber;
    var sql = util.format("SELECT VoyageKey, DepartureTime FROM T3101_Voyage_20171117bak_copy WHERE ShipNumber = '%s' AND IsValid = '1' ORDER BY DepartureTime DESC", ShipNumber);
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


/**
 * 保存航次信息
 */
router.post('/saveVoyage', function (req, res, next) {
    var voyageInfo = req.body;
    var sql = util.format("UPDATE T3101_Voyage_20171117bak_copy SET Cargo = '%s', DepartureTime = %s, DeparturePortID = '%s', ArrivalTime = %s, ArrivalPortID = '%s', " +
        "CargoChecked = '%s', DeparturePortChecked = '%s',  ArrivalPortChecked = '%s', Checked = '%s' WHERE VoyageKey = '%s'",
        voyageInfo.Cargo, voyageInfo.DepartureTime, voyageInfo.DeparturePortID, voyageInfo.ArrivalTime, voyageInfo.ArrivalPortID,
        voyageInfo.CargoChecked, voyageInfo.DeparturePortChecked, voyageInfo.ArrivalPortChecked, voyageInfo.Checked, voyageInfo.VoyageKey);
    console.log(sql);
    mysql.query(sql, function (err, result) {
        if(err){
            res.jsonp(['404', '保存航次信息失败'])
        }
        else{
            res.jsonp(['200', '保存航次信息成功'])
        }
    })
});

/**
 * 保存航次详细信息
 */
router.post('/saveVoyageDetail', function (req, res, next) {
    var MMSI = req.body.MMSI;
    var voyageKey = req.body.VoyageKey;
    var sql1 = util.format("DELETE FROM T3102_VoyageDetails_20171117bak_copy WHERE VoyageKey = '%s'", voyageKey);
    mysql.query(sql1, function (err, result) {
        if(err){
            res.jsonp(['404', '清空航次详细信息失败'])
        }
        else{
            console.log("清空航次详细信息成功");
            var voyageDetailList = req.body.VoyageDetailList;
            var sql2 = "INSERT INTO T3102_VoyageDetails_20171117bak_copy VALUES ";
            for (var i = 0; i < voyageDetailList.length; i++) {
                var info = voyageDetailList[i];
                if (i > 0) {
                    sql2 += ","
                }
                sql2 += "('" + MMSI + "','" + info.DepartureTime + "','" + info.ArrivalTime + "','" + info.StationaryAreaKey +
                    "','" + voyageKey + "','" + info.Purpose + "','" + info.CenterLon + "','" + info.CenterLat + "')";
            }
            console.log(sql2);
            mysql.query(sql2, function (err, data) {
                if(err){
                    console.log(['404', '保存航次详细信息失败'])
                }
                else{
                    res.jsonp(['200', '保存航次详细信息成功'])
                }
            });
        }
    })
});


/**
 * 拆分出新航次
 */
router.post('/AddVoyage', function (req, res, next) {
    let voyageInfo = req.body;
    let sql = util.format('INSERT INTO T3101_Voyage_20171117bak_copy (VoyageKey, MMSI, Type, DepartureTime, DeparturePortID, ArrivalTime, ArrivalPortID, ShipNumber)' +
        'VALUE("%s", "%s", "%s", %s, "%s",  %s, "%s", "%s" )', voyageInfo.Voyagekey, voyageInfo.MMSI, voyageInfo.Type,
        voyageInfo.DepartureTime, voyageInfo.DeparturePortID, voyageInfo.ArrivalTime, voyageInfo.ArrivalPortID, voyageInfo.ShipNumber);
    console.log(sql);
    mysql.query(sql, function (err, result) {
        if(err){
            res.jsonp(['404', '插入航次信息失败'])
        }
        else{
            res.jsonp(['200', '插入航次信息成功'])
        }
    })
});




module.exports = router;
