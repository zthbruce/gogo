/**
 * Created by ShiTianCi on 2017/6/27.
 */
// require('javascripts/route')
// getShipList();

var nowdate = new Date();
var nowday = nowdate.toLocaleDateString();
console.log(nowday);

function generateNewPierKey(){
    //新建码头key值
    var nowdate = new Date();
    var nowday = nowdate.toLocaleDateString();
    // console.log(date);
    // console.log(nowdate);
    var nowDayArr = nowday.split('/');
    nowDayArr[1] = nowDayArr[1].length<2 ? '0'+nowDayArr[1]:nowDayArr[1];
    nowDayArr[2] = nowDayArr[2].length<2 ? '0'+nowDayArr[2]:nowDayArr[2];
    var nowDayStr = nowDayArr.join('');
    var nowdate_hours=nowdate.getHours();
    var nowdate_minutes=nowdate.getMinutes();
    var nowdate_seconds=nowdate.getSeconds();
    nowdate_hours = nowdate_hours<10?'0'+nowdate_hours:nowdate_hours;
    nowdate_minutes = nowdate_minutes<10?'0'+nowdate_minutes:nowdate_minutes;
    nowdate_seconds = nowdate_seconds<10?'0'+nowdate_seconds:nowdate_seconds;
    nowDayStr = nowDayStr + nowdate_hours + nowdate_minutes + nowdate_seconds;
    console.log(nowDayStr);
    return nowDayStr;
}

var m = 2;

var n = {3: "aas", 2: "as"};

console.log(m in n);

