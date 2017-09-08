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

router.get("/getVoyageList", function (req, res, next) {
    var fleetNumber = req.query.FleetNumber;
    console.log(fleetNumber);
    var sql = util.format('SELECT t1.ID,t1.ShipNumber, Name, IMO, StartTime, StartPortID, StopTime, StopPortID,  t1.Checked FROM voyage_tmp t1 ' +
        'LEFT JOIN T0101_Ship t2 ON t1.ShipNumber = t2.ShipNumber LEFT JOIN T4101_Fleet t3 ON t2.ShipNumber = t3.ShipNumber ' +
        'WHERE FleetNumber = "%s" ORDER BY t1.Checked DESC, StopTime DESC', fleetNumber);
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
 * 请求该船历史航次
 */
router.get("/getHistoryVoyage", function (req, res, next) {

});
module.exports = router;
