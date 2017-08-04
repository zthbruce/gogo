var config = {
	"appenders":
		[
			{
				"type":"console"
			},
			//{
			//	"type":"file",
			//	"filename":"./logs/rizhi.log",
			//	"category":"blmlog"
			//}
			{
				"category":"blmlog",
				"type":"dateFile",
				"filename":"./logs/rizhi",
				"alwaysIncludePattern":true,
				"pattern":"yyyyMMdd.log"
			}
		]
};

function ConfigLog(){
	this.getConfig = function (){
		return config;
	};

}

module.exports = ConfigLog;