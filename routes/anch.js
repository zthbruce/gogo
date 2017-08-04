/**
 * Created by Truth on 2017/7/30.
 */

// 引入依赖
var mysql = require('../db/BlmMysql');
var util = require('util');
var utils = require('../util/Utils');
var express = require('express');
var router = express.Router();

/**
 * 根据锚地主键获得对应的信息
 * 传入参数 anchKey
 */
router.get('/getAnchInfo', function(req, res, next){
    var anchKey = req.query.anchKey;
    var sqls = util.format("SELECT * FROM T2104_Anchorage WHERE AnchorageKey = '%s'", anchKey);
    mysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            if(results.length>0){
                res.jsonp(['200', results]);
            }else{
                res.jsonp(['304', "return nothing"]);
            }
        }
    });
});


/**
 *
 */
router.get('/anchNameSearch', function(req, res, next){
    var anchNameStr = req.query.anchNameStr;
    var sqls = util.format("SELECT AnchorageKey, Name, Purpose, Des, centerLon, centerLat FROM T2104_Anchorage WHERE binary Name LIKE '" + anchNameStr  + "%'  LIMIT 20" );
    mysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            // console.log(results);
            if(results.length>0){
                // 符合名字的
                res.jsonp(['200', results]);
            }else{
                res.jsonp(['304', "return nothing"]);
            }
        }
    });
});

/**
 * 根据港口列表
 */
router.get('/anchNameSearch', function(req, res, next){
    var anchNameStr = req.query.anchNameStr;
    var sqls = util.format("SELECT AnchorageKey, Name, Purpose, Des, centerLon, centerLat FROM T2104_Anchorage WHERE binary Name LIKE '" + anchNameStr  + "%'  LIMIT 20" );
    mysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            // console.log(results);
            if(results.length>0){
                // 符合名字的
                res.jsonp(['200', results]);
            }else{
                res.jsonp(['304', "return nothing"]);
            }
        }
    });
});

/**
 * 根据cluster_id列表 删除Park_Area中相关的数据
 */
router.get('/deleteStaticArea', function(req, res, next){
    // 直接用都好相连
    var clusterIDListStr = req.query.clusterIDList.join(",");
    var sqls = util.format("DELETE FROM T2105_ParkArea WHERE cluster_id IN (%s)", clusterIDListStr);
        mysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            // console.log(results);
            res.jsonp(["200", "成功删除静止区域"])
        }
    });
});

router.get('/saveAnchInfo', function(req, res, next){
    // 直接用都好相连
    var anchInfo = req.query.anchInfo;
    var sqls = util.format("REPLACE INTO `T2104_Anchorage` (AnchorageKey, NAME, Purpose, Des, CenterLon, CenterLat, Location," +
        " DestinationPort) VALUE ('%s', '%s', '%s','%s', '%s', '%s', '%s','%s')", anchInfo.AnchorageKey, anchInfo.Name,
        anchInfo.Purpose, anchInfo.Des, anchInfo.CenterLon, anchInfo.CenterLat, anchInfo.Location, anchInfo.DestinationPort);
    mysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            // console.log(results);
            res.jsonp(["200", "成功保存锚地信息"])
        }
    });
});

router.get('/getAnchShowInfo', function(req, res, next){
    var sqls = util.format("SELECT AnchorageKey, Name, CenterLon, CenterLat, Location FROM T2104_Anchorage");
    mysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            if(results.length>0){
                res.jsonp(['200', results]);
            }else{
                res.jsonp(['304', "return nothing"]);
            }
        }
    });
});





module.exports = router;