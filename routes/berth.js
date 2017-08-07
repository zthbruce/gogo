/**
 * 泊位的接口设置
 * Created by Truth on 2017/7/27.
 */

// 引入依赖
var mysql = require('../db/BlmMysql');
var util = require('util');
var utils = require('../util/Utils');
var express = require('express');
var router = express.Router();

/**
 * 根据键盘输入信息进行模糊搜索
 * 请求参数 companyStr
 */
router.get('/addPierSelectCompanyName', function(req, res, next){
    var companyStr = req.query.companyStr;
    var sqls = util.format("SELECT CompanyNumber, Name FROM T2107_Company WHERE Name LIKE '%" + companyStr  + "%'  LIMIT 50" );
    mysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            // console.log(results);
            if(results.length>0){
                // var sendData = "[";
                // var name = '';
                // for(var i=0;i<results.length;i++){
                //     if (i > 0) {sendData += ",";}
                //     if(results[i].CNName!=null&&results[i].CNName!=''&&(results[i].ENName==''||results[i].ENName==null)){
                //         name = results[i].CNName;
                //     }else{}
                //     sendData += util.format('{"ENName":"%s", "CNName":"%s", "CompanyNumber":"%s"}',
                //         results[i].ENName, results[i].CNName, results[i].CompanyNumber);
                // }
                // sendData += "]";
                // console.log(sendData);
                res.jsonp(['200', results]);
            }else{
                res.jsonp(['304', "return nothing"]);
            }
        }
    });
});

/**
 * 根据码头返回泊位信息
 * 请求数据：{TerminalKey}
 */
router.get('/getBerthListFromPier', function(req, res, next){
    var TerminalKey = req.query.TerminalKey;
    var sqls = util.format('SELECT StationaryAreaKey, LOA, Moulded_Beam, Draft, LoadDischargeRate FROM T2103_TerminalDetails WHERE TerminalKey = "%s"', TerminalKey);
    mysql.query(sqls, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        }else {
            console.log("成功连接数据库");
            var areaKeyList = {};
            if(results.length>0){
                for(var i = 0; i< results.length; i++){
                    var StationaryAreaKey = results[i]["StationaryAreaKey"];
                    areaKeyList[StationaryAreaKey] = {
                        LOA: results[i]["LOA"], Moulded_Beam: results[i]["Moulded_Beam"],
                        Draft: results[i]["Draft"], LoadDischargeRate: results[i]["LoadDischargeRate"]
                    }
                }
                // var sendData = "{";
                // for (var i = 0; i < results.length; i++) {
                //     if (i > 0) {
                //         sendData += ",";
                //     }
                //     sendData += util.format('"%s":{"LOA":%s, "BEAM":%s, "Moulded_Beam":%s, "Draft":%s, "BEAM_MAX":%s, "DRAFT_MAX":%s, "DWT_MAX": %s}',
                //         results[i].StationaryAreaKey, results[i].LOA_MAX,
                //         results[i].BEAM_MAX, results[i].DRAFT_MAX, results[i].DWT_MAX);
                // }
                // sendData += "}";
                res.jsonp(['200', areaKeyList]);
            }else{
                res.jsonp(['304', "return nothing"]);
            }
        }
    });
});

/**
 * 根据静止区域Id获得码头详情信息
 * 请求参数 {staticAreaKey}
 */
router.get('/getTerminal', function(req, res, next){
    var staticAreaKey = req.query.staticAreaKey;
    var sqls = util.format('SELECT  t1.*, t2.ENName AS PortName, t3.Name AS CompanyName FROM T2102_Terminal t1 LEFT JOIN T2101_Port t2 ON t1.PortID = t2.PortID LEFT JOIN T2107_Company t3 ON t1.BelongtoCompany = t3.CompanyNumber WHERE TerminalKey = (SELECT TerminalKey FROM T2103_TerminalDetails ' +
        ' WHERE StationaryAreaKey = "%s")', staticAreaKey);
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
 * 保存码头信息
 */
router.get('/saveTerminal', function(req, res, next) {
    var sqls = util.format('REPLACE INTO T2102_Terminal (TerminalKey, Name, PortID, BerthQuantity, Tide, ImportExportType,' +
        'BelongtoCompany, Des, Location, LatitudeNumeric, LongitudeNumeric, Latitude, Longitude, CargoTypeKey) ' +
        'value ("%s","%s","%s","%s", "%s","%s","%s","%s","%s","%s","%s","%s","%s", "%s")', req.query.TerminalKey, req.query.Name, req.query.PortID,
        req.query.BerthQuantity, req.query.Tide, req.query.ImportExportType, req.query.BelongtoCompany, req.query.Des,
        req.query.Location, req.query.LatitudeNumeric, req.query.LongitudeNumeric, req.query.Latitude, req.query.Longitude,
        req.query.CargoTypeKey);
    mysql.query(sqls, function (err, results) {
        if (err) {
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        } else {
            console.log("成功连接数据库");
            res.jsonp(['200', "保存码头信息成功"]);
        }
    });
});


/**
 * 保存单个泊位信息
 */
router.get('/saveBerth', function(req, res, next) {
    var sqls = util.format('REPLACE INTO T2103_TerminalDetails (TerminalKey, Seq, LOA, Moulded_Beam, Draft, LoadDischargeRate, StationaryAreaKey) ' +
        'value (%s, %s, %s, %s, %s, %s, %s)',req.query.TerminalKey, req.query.Seq, req.query.LOA,
        req.query.Moulded_Beam, req.query.Draft, req.query.LoadDischargeRate, req.query.StationaryAreaKey);
    mysql.query(sqls, function (err, results) {
        if (err) {
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        } else {
            console.log("成功连接数据库");
            res.jsonp(['200', "保存码头信息成功"]);
        }
    });
});

/**
 * 保存N个泊位信息
 * 先清空然后再写入
 */
router.get('/saveBerthList', function(req, res, next) {
    // var terminalKey = req.query.terminalKey;
    var berthList = req.query.berthList;
    var terminalKey = berthList[0].TerminalKey;
    var sql = "DELETE FROM T2103_TerminalDetails WHERE TerminalKey = " + terminalKey;
    mysql.query(sql, function (err, results) {
        if (err) {
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        } else {
            console.log("成功清空当前码头");
            var sqls = 'INSERT INTO T2103_TerminalDetails (TerminalKey, Seq, LOA, Moulded_Beam, Draft, LoadDischargeRate, StationaryAreaKey) value ';
            for(var i = 0; i< berthList.length; i++) {
                if(i > 0){
                    sqls += ",";
                }
                var ele = berthList[i];
                sqls += util.format('("%s", "%s", "%s", "%s", "%s", "%s", "%s")', ele.TerminalKey, ele.Seq, ele.LOA,
                    ele.Moulded_Beam, ele.Draft, ele.LoadDischargeRate, ele.StationaryAreaKey);
            }
            mysql.query(sqls, function (err, results) {
                if (err) {
                    console.log(utils.eid1);
                    res.jsonp(['404', utils.eid1]);
                } else {
                    console.log("成功连接数据库");
                    res.jsonp(['200', "保存泊位信息成功"]);
                }
            });
        }
    })
});

/**
 * 删除单个泊位信息
 */
router.get('/DeleteBerth', function(req, res, next) {
    var sqls = util.format('DELETE FROM T2103_TerminalDetails WHERE StationaryAreaKey = %s', req.query.StationaryAreaKey);
    mysql.query(sqls, function (err, results) {
        if (err) {
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        } else {
            console.log("成功连接数据库");
            res.jsonp(['200', "删除码头信息成功"]);
        }
    });
});

/**
 * 删除一系列
 */
router.get('/DeleteBerthList', function(req, res, next) {
    var StationaryAreaKeyList = req.query.StationaryAreaKeyList;
    var sqls = 'DELETE FROM T2103_TerminalDetails WHERE StationaryAreaKey in (';
    for(var i = 0; i< StationaryAreaKeyList.length; i++){
        if( i > 0){
            sqls += ","
        }
        sqls += StationaryAreaKeyList[i]
    }
    mysql.query(sqls, function (err, results) {
        if (err) {
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        } else {
            console.log("成功连接数据库");
            res.jsonp(['200', "删除码头信息成功"]);
        }
    });
});


/**
 * 获取泊位某个船舶类型统计数据
 */
router.get('/reqShipStaticData', function(req, res, next){
    var data=req.query;
    var reqParam=JSON.parse(data.param);
    console.log(reqParam.shipType);
    // var sql = util.format("SELECT Date,LOA,MouldedBeam,DesignedDraft,DWT,DWTpth FROM T2106_Area_Statistic " +
    //     "WHERE Level3EN = '%s' AND StaticAreaKey IN (SELECT StationaryAreaKey FROM " +
    //     "T2103_TerminalDetails WHERE TerminalKey = ( SELECT TerminalKey FROM T2103_TerminalDetails " +
    //     "WHERE StationaryAreaKey='%s' ))",reqParam.shipType,reqParam.staticareakey);
    var sql = util.format("SELECT Date,LOA,MouldedBeam,DesignedDraft,DWT,DWTpth FROM T2106_Area_Statistic " +
        "WHERE Level3EN = '%s' AND StaticAreaKey = '%s'",reqParam.shipType,reqParam.staticareakey);
    mysql.query(sql, function (err, results) {
        if(err){
            console.log(utils.eid1);
            res.jsonp(['304', utils.eid1]);
            console.log("here");
        }else {
            console.log("成功连接数据库");
            var sendData = "[";
            for(var i = 0; i< results.length; i++) {
                if(i > 0){
                    sendData += ",";
                }
                sendData += util.format('{"LOA":"%s", "MouldedBeam":"%s", "DesignedDraft":"%s", "DWT":"%s", "DTPH":"%s", "Date":"%s"}',
                    results[i].LOA, results[i].MouldedBeam, results[i].DesignedDraft, results[i].DWT, results[i].DWTpth, results[i].Date);
            }
            sendData += "]";
            console.log(sendData);
            res.jsonp(['200', sendData]);
        }
    });
});

/**
 * 保存码头公司信息
 */
router.get('/savePierCompany', function(req, res, next) {
    var sqls = util.format('REPLACE INTO `T2107_Company` (CompanyNumber, NAME) VALUE ("%s", "%s")',req.query.CompanyNumber, req.query.Name);
    mysql.query(sqls, function (err, results) {
        if (err) {
            console.log(utils.eid1);
            res.jsonp(['404', utils.eid1]);
        } else {
            console.log("成功连接数据库");
            res.jsonp(['200', "保存公司信息成功"]);
        }
    });
});

// 作为中间路由传递
module.exports = router;

