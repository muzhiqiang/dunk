var express = require('express');
var router = express.Router();
var AV = require('../avos.js');
AV.initialize('rERfeCb5UDfcONYQykxCIkKM', 'hyG3cmbmPhAhOcQ1fwVWSyk0');
var Report = AV.Object.extend("Report");
var ReportComment = AV.Object.extend("ReportComment");
var ReportLike = AV.Object.extend("ReportLike");

/*  获取战报  */
router.get("/getReport",function(req,res,next){
	var reportId = req.query.reportId;
	var query = new AV.Query(Report);
	query.equalTo("objectId",reportId);
	query.find({
		success:function(reports){
			var time = new Date(reports[0].createdAt);
			var year = time.getFullYear();
			var month = time.getMonth()+1;
			month = month<10?"0"+month:month;
			var day = time.getDate();
			day = day<10?"0"+day:day;
			reports[0].createdAt = year+"-"+month+"-"+day;
			res.render("report",{report:reports[0],reportId:reportId});
		},
		error:function(object,error){
			console.log(error);
		}
	})
})

router.get("/getComment",function(req,res,next){
	var reportId = req.query.reportId;
	var report = new Report();
	report.id = reportId;
	var query = new AV.Query(ReportComment);
	query.include("userId");
	query.include("userId.campusId");
	query.equalTo("reportId",report);
	query.limit(50);
	query.find({
		success:function(comments){
			var query = new AV.Query(ReportLike);
			query.equalTo("reportId",report);
			query.count({
				success:function(count){
					var users = new Array();
					var campuses = new Array();
					for(var i=0;i<comments.length;i++){
						users[i] = comments[i].get("userId");
						campuses[i] = comments[i].get("userId").get("campusId").get("name");
						comments[i].createdAt = format_date(comments[i].createdAt);
					}
					res.json({number:comments.length,comments:comments,reportLike:count,users:users,campuses:campuses});
				}
			})
			
		},
		error:function(object,error){
			console.log(error);
		}
	})
})

function format_date(date){
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
module.exports = router;