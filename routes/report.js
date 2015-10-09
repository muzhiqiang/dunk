var express = require('express');
var router = express.Router();
var AV = require('../avos.js');
var Report = AV.Object.extend("Report");
var ReportComment = AV.Object.extend("ReportComment");
var ReportLike = AV.Object.extend("ReportLike");
var User = AV.Object.extend("_User");
var dateUtil = require('../util/date.js')

/*  获取战报  */
router.get("/:reportId",function(req,res,next){
	var reportId = req.params.reportId;
	if(reportId=="getComment"||reportId=="isReportLike"){
		next();
		return;
	}
	var query = new AV.Query(Report);
	query.equalTo("objectId",reportId);
	query.find({
		success:function(reports){
			if(reports.length>0){
				var time = new Date(reports[0].get("time"));
				var year = time.getFullYear();
				var month = time.getMonth()+1;
				month = month<10?"0"+month:month;
				var day = time.getDate();
				day = day<10?"0"+day:day;
				reports[0].set("time",year+"-"+month+"-"+day);
				res.render("report",{report:reports[0],reportId:reportId});
			}
			
		},
		error:function(object,error){
			console.log(error);
		}
	})
})

router.get("/isReportLike",function(req,res,next){
	var userId = req.query.userId;
	var reportId = req.query.reportId;
	var report = new Report();
	report.id = reportId;
	var user = new User();
	user.id = userId;
	var query = new AV.Query(ReportLike);
	query.equalTo("userId",user);
	query.equalTo("reportId",report);
	query.find({
		success:function(reportLike){
			res.json({number:reportLike.length});
			res.end();
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
					var query = new AV.Query(ReportComment);
					query.equalTo("reportId",report);
					query.count({
						success:function(number){
							var users = new Array();
							var campuses = new Array();
							for(var i=0;i<comments.length;i++){
								users[i] = comments[i].get("userId");
								campuses[i] = comments[i].get("userId").get("campusId").get("name");
								comments[i].updatedAt = dateUtil.format_date(comments[i].createdAt);
							}
							res.json({number:number,comments:comments,reportLike:count,users:users,campuses:campuses});
						},
						error:function(object,error){
							console.log(error);
						}
					})
					
				}
			})
			
		},
		error:function(object,error){
			console.log(error);
		}
	})
})

module.exports = router;