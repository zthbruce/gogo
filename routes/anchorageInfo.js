/**
 * Created by ShiTianCi on 2017/6/27.
 */
// require('javascripts/route')
// getShipList();
require('util');
// var status = {'0': "在建", '1': "正服役", '2': "维护中", '3': "闲置", '4': "已拆解", '5': "未知", '6': "数据不再维护"};
// console.log(status[1]);
//


// var year = date.getUTCFullYear() - 1
// var
// // console.log(year)
//
// var endTime = Date.parse(date) / 1000;
// var oneMonth = 25920000;
// var startTime = endTime - oneMonth;
// console.log(startTime);
// //
// //
// // function getLastMonth
//
// console.log(30*24*36000);

// var name = "as";
// console.log(util.format("SELECT * FROM `T0181_ShipType` SELECT * FROM `T0181_ShipType` WHERE NAME LIKE '%s%' OR CNName LIKE '%s%'", name, name));

function format(num) {
    var prefix = '';
    if(num>=0 && num <=9)
        prefix = '0';
    return prefix + num

}
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var strMonth = format((date.getMonth() + 1));
    // month =  month.length === 1 ? '0' + month: month ;
    console.log(date.getDate());
    var strDate = format(date.getDate());
    var strHours = format(date.getHours());
    var strMinutes = format(date.getMinutes());
    var strSecond = format(date.getMinutes());
    return date.getFullYear() + seperator1 + strMonth + seperator1 + strDate
        + " " + strHours + seperator2 + strMinutes + seperator2 + strSecond;
}

console.log(getNowFormatDate())