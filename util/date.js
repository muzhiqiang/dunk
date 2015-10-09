exports.format_date = function(date){
	var date = new Date(date);
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var now = new Date();
	var mseconds = now.getTime()-date.getTime();
	var time_std = [1000,60*1000,60*60*1000,60*60*24*1000];
	if(mseconds<time_std[0]){
		return "刚刚";
	}
	if(mseconds>=time_std[0]&&mseconds<time_std[1]){
		return Math.floor(mseconds/time_std[0]).toString() + "秒前";
	}
	if(mseconds>=time_std[1]&&mseconds<time_std[2]){
		return Math.floor(mseconds/time_std[1]).toString() + "分钟前";
	}
	if(mseconds>=time_std[2]&&mseconds<time_std[3]){
		return Math.floor(mseconds/time_std[2]).toString() + "小时前";
	}
	month = ((month<10) ? "0" : "") + month;
	day = ((day<10) ? "0" : "") + day;

	var thisYear = now.getFullYear();
	year = (year==thisYear) ? "" : (year+"年");
	return year+""+month+"月"+day+"日";
}