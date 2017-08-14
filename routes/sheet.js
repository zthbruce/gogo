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
 * 请求参数 sheetName
 * 返回数据: {sheetNumber:, ENName, CNName, Number}
 */
router.get("/getSheetBasicInfo", function (req, res, next) {
    var sheetName = req.param.SheetName;
    var sql = util.format('SELECT t1.SheetNumber, t2.ENName, t2.CNName, COUNT(*) AS Number FROM T4101_Sheet t1 INNER JOIN T4102_SheetType t2 ' +
        'ON t1.SheetNumber = t2.SheetNumberWHERE TYPE = "%s" AND LeaveTime IS NULL GROUP BY t1.SheetNumber', sheetName)
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
 * 获得某个具体船队的信息
 * 请求参数 SheetNumber
 * 返回 {ShipNumber, IMO, MMSI, ENMV, DWT, ShipStatus, JoinTime, LeaveTime}
 */
router.get("/getSheetDetailInfo", function (req, res, next) {
    var sheetNumber = req.param.SheetNumber;
    var sql = util.format('SELECT t1.ShipNumber, IMO, MMSI, ENMV, DWT, ShipStatus, JoinTime, LeaveTime FROM T4101_Sheet t1 LEFT JOIN ' +
        'T0101_Ship t2 ON t1.ShipNumber = t2.ShipNumber LEFT JOIN T0105_Tonage t3 ON t1.ShipNumber = t3.ShipNumber ' +
        ' WHERE SheetNumber = "%s" AND LeaveTime IS NULL', sheetNumber);
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
 * 获得历史中所有出现join和leave的时间点
 * 请求参数 sheetNumber
 * 返回 timePointList
 */
router.get("/getSheetDetailInfo", function (req, res, next) {
    var sheetNumber = req.param.SheetNumber;
    var sql = util.format('SELECT JoinTime FROM T4101_Sheet WHERE LENGTH(JoinTime) = 10 AND sheetNumber = "%s" UNION ' +
        'SELECT LeaveTime FROM T4101_Sheet WHERE LENGTH(LeaveTime) = 10 AND sheetNumber = "%s"', sheetNumber, sheetNumber);
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
 * 根据历史点获得相应船队列表
 * 请求参数 1. sheetNumber 2. timePoint
 * 返回 {ShipNumber, IMO, MMSI, ENMV, DWT, ShipStatus, JoinTime, LeaveTime}
 */

router.get("/getSheetHistoryInfo", function (req, res, next) {
    var sheetNumber = req.param.SheetNumber;
    var timePoint = req.param.TimePoint;
    var sql = util.format('SELECT t1.ShipNumber, IMO, MMSI, ENMV, DWT, ShipStatus, JoinTime, LeaveTime FROM T4101_Sheet t1 LEFT JOIN ' +
        'T0101_Ship t2 ON t1.ShipNumber = t2.ShipNumber LEFT JOIN T0105_Tonage t3 ON t1.ShipNumber = t3.ShipNumber ' +
        ' WHERE SheetNumber = "%s" AND ((LeaveTime IS NULL AND JoinTime <= "%s") OR (LeaveTime >= "%s"))', sheetNumber, timePoint, timePoint);
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
 * 请求船舶的详细信息
 * 请求参数 ShipNumber
 */
router.get("/getShipDetailInfo", function (req, res, next) {
    var shipNumber = req.param.ShipNumber;
    var sql = util.format('SELECT t2.LEVEL2EN, t2.Level3EN, t1.Flag, BuiltDate, Class_Notation, LOA, MouldedBeam, Depth,  DesignedDraft, t4.SheetNumber, ENName, CNName,  JoinTime, LeaveTime FROM T0101_Ship t1 LEFT JOIN T9904_ShipType t2  ON t1.ShipType = t2.ShipTypeKey LEFT JOIN T0106_Size t3 ON t1.ShipNumber = t3.ShipNumber LEFT JOIN T4101_Sheet t4 ON t1.ShipNumber= t4.ShipNumber LEFT JOIN T4102_SheetType t5 ON t4.SheetNumber = t5.SheetNumber  WHERE t1.ShipNumber = "%s"', shipNumber);
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

