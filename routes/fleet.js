/**
 * Created by Truth on 2017/8/11.
 * 船队信息的列表
 */

// 引入依赖
var mysql = require('../db/BlmMysql');
var util = require('util');
var utils = require('../util/Utils');
var express = require('express');
var router = express.Router();

/**
 * 请求船队大类的基本信息
 * 请求参数 fleetName
 * 返回数据: {fleetNumber, ENName, CNName, Number}
 */
router.get("/getFleetBasicInfo", function (req, res, next) {
    // var fleetType = req.query.FleetType;
    // var sql = util.format('SELECT t1.FleetNumber, t2.ENName, t2.CNName, COUNT(*) AS Number FROM T4101_Fleet t1 INNER JOIN T4102_FleetType t2 ' +
    //     'ON t1.FleetNumber = t2.FleetNumber WHERE TYPE = "%s" AND LeaveTime IS NULL GROUP BY t1.FleetNumber', fleetType);
    var sql = util.format('SELECT Type, t1.FleetNumber, t2.ENName, t2.CNName, COUNT(*) AS Number FROM T4101_Fleet t1 INNER JOIN T4102_FleetType t2 ' +
        'ON t1.FleetNumber = t2.FleetNumber LEFT JOIN T0101_Ship t3 ON t1.ShipNumber = t3.ShipNumber ' +
        'WHERE ShipStatus IN ("1", "2", "3") GROUP BY t1.FleetNumber');
    mysql.query(sql, function (err, results) {
      if(err){
          console.log(utils.eid1);
          res.jsonp(['404', utils.eid1])
      }
      else{
          if(results.length > 0){
              console.log("成功连接数据库");
              var fleet_0 = [];
              var fleet_1 = [];
              var fleet_2 = [];
              for(var i = 0; i < results.length; i++){
                  var ele = results[i];
                  var fleetType = ele.Type;
                  var content = {FleetNumber:ele.FleetNumber, ENName: ele.ENName, CNName: ele.CNName, Number: ele.Number};
                  if(fleetType === "0"){
                      fleet_0.push(content)
                  }
                  else if(fleetType === "1"){
                      fleet_1.push(content)
                  }
                  else{
                      fleet_2.push(content);
                  }
              }
              res.jsonp(['200', {"0": fleet_0, "1": fleet_1, "2": fleet_2}])
          }
          else{
              console.log("无返回数据");
              res.jsonp(['304', "return nothing"])
          }
      }
    })
});

/**
 * 获得某个具体船队的信息
 * 请求参数 FleetNumber
 * 返回 {ShipNumber, IMO, MMSI, ENMV, DWT, ShipStatus, JoinTime, LeaveTime}
 */
router.get("/getFleetDetailInfo", function (req, res, next) {
    var fleetNumber = req.query.FleetNumber;
    var timePoint = req.query.TimePoint;
    console.log(fleetNumber);

    // 如果请求当前的船舶信息
    if(timePoint === ""){
        var sql = util.format('SELECT t1.ShipNumber, t2.Name AS ShipName, IMO, MMSI, t3.Name AS Type, DWT, ShipStatus, ' +
            'BuiltDate, JoinTime, LeaveTime FROM T4101_Fleet t1 LEFT JOIN T0101_Ship t2 ON t1.ShipNumber = t2.ShipNumber' +
            ' LEFT JOIN `T0181_ShipType` t3 ON t2.ShipType = t3.TypeKey ' +
            'WHERE FleetNumber = "%s" AND ShipStatus IN ("1", "2", "3")', fleetNumber);
    }
    // 请求历史上某一天的船舶信息
    else{
         sql = util.format('SELECT t1.ShipNumber, t2.Name AS ShipName, IMO, MMSI, t3.Name AS Type, DWT, ShipStatus, ' +
             'BuiltDate, JoinTime, LeaveTime FROM T4101_Fleet t1 LEFT JOIN T0101_Ship t2 ON t1.ShipNumber = t2.ShipNumber ' +
             'LEFT JOIN `T0181_ShipType` t3 ON t2.ShipType = t3.TypeKey' +
            ' WHERE FleetNumber = "%s" AND (((JoinTime IS NULL OR JoinTime <= "%s") AND ShipStatus IN ("1", "2", "3")) OR (ShipStatus = "4" AND LeaveTime = "%s")) ORDER BY DWT DESC', fleetNumber, timePoint, timePoint);
    }
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1])
        }
        else{
            if(results.length > 0){
                console.log("成功连接数据库");
                res.jsonp(['200', results])
            }
            else{
                console.log("无返回数据");
                res.jsonp(['304', "return nothing"])
            }
        }
    })
});

// router.get("/getFleetDetailInfo", function (req, res, next) {
//     var fleetNumber = req.query.FleetNumber;
//     var sql = util.format('SELECT t1.ShipNumber, IMO, MMSI, ENMV, DWT, ShipStatus, JoinTime, LeaveTime FROM T4101_Fleet t1 LEFT JOIN ' +
//         'T0101_Ship t2 ON t1.ShipNumber = t2.ShipNumber LEFT JOIN T0105_Tonage t3 ON t1.ShipNumber = t3.ShipNumber ' +
//         ' WHERE FleetNumber = "%s" AND LeaveTime IS NULL AND ShipStatus IN ("1", "2", "3")', fleetNumber);
//     mysql.query(sql, function (err, results) {
//         if(err){
//             console.log(utils.eid1);
//             res.jsonp(['404', utils.eid1])
//         }
//         else{
//             if(results.length > 0){
//                 console.log("成功连接数据库");
//                 res.jsonp(['200', results])
//             }
//             else{
//                 console.log("无返回数据");
//                 res.jsonp(['304', "return nothing"])
//             }
//         }
//     })
// });

/**
 * 获得历史中所有出现join和leave的时间点
 * 请求参数 fleetNumber
 * 返回 timePointList
 */
router.get("/getFleetTimePoint", function (req, res, next) {
    var fleetNumber = req.query.FleetNumber;
    var sql = util.format('SELECT JoinTime FROM T4101_Fleet WHERE LENGTH(JoinTime) = 10 AND fleetNumber = "%s" UNION ' +
        'SELECT LeaveTime FROM T4101_Fleet WHERE LENGTH(LeaveTime) = 10 AND fleetNumber = "%s" ORDER BY JoinTime DESC', fleetNumber, fleetNumber);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1])
        }
        else{
            if(results.length > 0){
                console.log("成功连接数据库");
                res.jsonp(['200', results])
            }
            else{
                console.log("无返回数据");
                res.jsonp(['304', "return nothing"])
            }
        }
    })
});

// /**
//  * 根据历史点获得相应船队列表
//  * 请求参数 1. fleetNumber 2. timePoint
//  * 返回 {ShipNumber, IMO, MMSI, ENMV, DWT, ShipStatus, JoinTime, LeaveTime}
//  */

// router.get("/getFleetHistoryInfo", function (req, res, next) {
//     var fleetNumber = req.query.FleetNumber;
//     var timePoint = req.query.TimePoint;
//     var sql = util.format('SELECT t1.ShipNumber, LEVEL2EN, LEVEL3EN, IMO, MMSI, ENMV, DWT, ShipStatus FROM T4101_Fleet t1 LEFT JOIN ' +
//         'T0101_Ship t2 ON t1.ShipNumber = t2.ShipNumber LEFT JOIN T0105_Tonage t3 ON t1.ShipNumber = t3.ShipNumber LEFT JOIN T9904_ShipType t4 on t2.ShipType = t4.ShipTypeKey' +
//         ' WHERE FleetNumber = "%s" AND (LeaveTime IS NULL OR LeaveTime >= %s) AND (JoinTime IS NULL OR JoinTime <=%s)', fleetNumber, timePoint, timePoint);
//     mysql.query(sql, function (err, results) {
//         if(err){
//             console.log(utils.eid1);
//             res.jsonp(['404', utils.eid1])
//         }
//         else{
//             if(results.length > 0){
//                 console.log("成功连接数据库");
//                 res.jsonp(['200', results])
//             }
//             else{
//                 console.log("无返回数据");
//                 res.jsonp(['304', "return nothing"])
//             }
//         }
//     })
// });

/**
 * 请求船舶的详细信息
 * 请求参数 ShipNumber
 */
router.get("/getShipDetailInfo", function (req, res, next) {
    var shipNumber = req.query.ShipNumber;
    var sql = util.format('SELECT t1.Flag, BuildNumber, BuiltDate, CS, LOA, BM, Draft, t3.FleetNumber, t4.ENName,' +
        ' t4.CNName, JoinTime, LeaveTime, t5.Name AS PortName, t1.Source, t1.UpdateDate FROM T0101_Ship t1 LEFT JOIN  `T0181_ShipType` t2 ON t1.ShipType = t2.TypeKey ' +
        'LEFT JOIN T4101_Fleet t3 ON t1.ShipNumber = t3.ShipNumber LEFT JOIN T4102_FleetType t4 ON t3.FleetNumber = t4.FleetNumber ' +
        'LEFT JOIN `T2101_Port` t5 ON t1.RegistryPort = t5.PortID ' +
        'WHERE t1.ShipNumber = "%s"', shipNumber);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1])
        }
        else{
            if(results.length > 0){
                console.log("成功连接数据库");
                res.jsonp(['200', results])
            }
            else{
                console.log("无返回数据");
                res.jsonp(['304', "return nothing"])
            }
        }
    })
});

/**
 * 获得所有的筛选条件
 */
router.get("/getSearchTypeList", function (req, res, next) {
    var name = req.query.Name;
    var sql = util.format("SELECT * FROM `T0181_ShipType` WHERE NAME LIKE '%s%' OR CNName LIKE '%s%'", name, name);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(utils.eid1);
        }
        else{
            if(results.length>0){
                res.jsonp(['200', results])
            }
            else{
                res.jsonp(["304", "return nothing"])
            }
        }
    })
});

/**
 * 根据条件筛选对应的船舶
 * 请求参数1 type 0: 散货, 1: 原油 2：集装箱
 * 请求参数2 Min_DWT DWT下限
 * 请求参数3 MIN_DWT DWT上限
 */

router.get("/getSearchShipList", function (req, res, next) {
    var type = req.query.Type; //货物类型
    var min_DWT = req.query.Min_DWT;
    var max_DWT = req.query.Max_DWT;
    var sql = util.format('SELECT t1.ShipNumber, t2.Name AS Type, IMO, MMSI, t1.Name AS ShipName, DWT, ShipStatus, BuiltDate, FleetNumber ' +
        'FROM T0101_Ship t1 LEFT JOIN T0181_ShipType t2 ON t1.ShipType = t2.TypeKey LEFT JOIN imn.`T4101_Fleet` t3 ON ' +
        't1.ShipNumber = t3.ShipNumber  WHERE TypeKey = "%s" AND DWT >= %s AND DWT <= %s AND ShipStatus IN ("1", "2", "3")  ORDER BY DWT DESC' , type, min_DWT, max_DWT);  // // 散货船
    // if(type === "0"){
    //     var sql = util.format('SELECT t1.ShipNumber, LEVEL2EN, LEVEL3EN, IMO, MMSI, ENMV, DWT, ShipStatus, BuiltDate, ' +
    //         'FleetNumber FROM imn.`T0101_Ship` t1 LEFT JOIN T9904_ShipType t2 ON t1.ShipType = t2.ShipTypeKey LEFT JOIN ' +
    //         'imn.`T4101_Fleet`  t3 ON t1.ShipNumber = t3.ShipNumber LEFT JOIN T0105_Tonage t4 ON t1.ShipNumber = t4.ShipNumber ' +
    //         'WHERE ShipStatus IN ("1", "2", "3") AND DWT >= %s AND DWT <= %s AND Level2EN = "Bulk Carrier" ORDER BY DWT DESC' , min_DWT, max_DWT);
    // }
    // // 原油船
    // else if(type === "1"){
    //     sql = util.format('SELECT t1.ShipNumber, LEVEL2EN, LEVEL3EN, IMO, MMSI, ENMV, DWT, ShipStatus, BuiltDate, ' +
    //         'FleetNumber FROM imn.`T0101_Ship` t1 LEFT JOIN T9904_ShipType t2 ON t1.ShipType = t2.ShipTypeKey LEFT JOIN ' +
    //         'imn.`T4101_Fleet`  t3 ON t1.ShipNumber = t3.ShipNumber LEFT JOIN T0105_Tonage t4 ON t1.ShipNumber = t4.ShipNumber ' +
    //         'WHERE  ShipStatus IN ("1", "2", "3") AND DWT >= %s AND DWT <= %s AND Level3EN IN ("Crude oil", "LNG", "LPG", "Product carrier") ORDER BY DWT DESC', min_DWT, max_DWT);
    // }
    // // 集装箱
    // else{
    //     sql = util.format('SELECT t1.ShipNumber, LEVEL2EN, LEVEL3EN, IMO, MMSI, ENMV, DWT, ShipStatus, BuiltDate, ' +
    //         'FleetNumber FROM imn.`T0101_Ship` t1 LEFT JOIN T9904_ShipType t2 ON t1.ShipType = t2.ShipTypeKey LEFT JOIN ' +
    //         'imn.`T4101_Fleet`  t3 ON t1.ShipNumber = t3.ShipNumber LEFT JOIN T0105_Tonage t4 ON t1.ShipNumber = t4.ShipNumber ' +
    //         'WHERE  ShipStatus IN ("1", "2", "3") AND DWT >= %s AND DWT <= %s AND Level2EN = "Container Ship" ORDER BY DWT DESC', min_DWT, max_DWT);
    // }
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1])
        }
        else{
            if(results.length > 0){
                console.log("成功连接数据库");
                res.jsonp(['200', results])
            }
            else{
                console.log("无返回数据");
                res.jsonp(['304', "return nothing"])
            }
        }
    })
});

/**
 * 保存船队，进入船队时间，离开船队时间
 */
router.get("/saveShip2Fleet", function (req, res, next) {
    var shipNumber = req.query.ShipNumber;
    var fleetNumber = req.query.FleetNumber;
    var joinTime = req.query.JoinTime;
    var leaveTime = req.query.LeaveTime;

    var sql = util.format('REPLACE INTO `T4101_Fleet` (ShipNumber, JoinTime, LeaveTime, FleetNumber) ' +
        'VALUE ("%s", %s, %s, "%s")', shipNumber, joinTime, leaveTime, fleetNumber);
    console.log(sql);
    // mysql.query(sql, function (err, results) {
    //     if(err){
    //         console.log(utils.eid1);
    //         res.jsonp(['404', utils.eid1])
    //     }
    //     else{
    //         console.log("成功连接数据库");
    //         res.jsonp(['200', "成功保存数据"])
    //     }
    // })
});

/**
 * 获取对应IMO的图片URL
 */
router.get("/getShipImage", function (req, res, next) {
    var IMO = req.query.IMO;
    var sql = util.format('SELECT URL FROM T0107_ShipPics WHERE IMO = "%s"', IMO);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1])
        }
        else{
            if(results.length > 0){
                console.log("成功连接数据库");
                res.jsonp(['200', results])
            }
            else{
                console.log("无返回数据");
                res.jsonp(['304', "return nothing"])
            }
        }
    })
});

module.exports = router;




