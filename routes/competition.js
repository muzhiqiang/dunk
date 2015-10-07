var express = require('express');
var router = express.Router();
var AV = require('avoscloud-sdk');
var Competition = AV.Object.extend("Competition");
var CompetitionComment = AV.Object.extend("CompetitionComment");

router.get('/:competitionId',function(req,res,next){
	var competitionId = req.params.competitionId;
	if(competitionId=="getComment"){
		next();
	}
	var query = new AV.Query(Competition);
	query.equalTo("objectId",competitionId);
	query.include("teamAId");
	query.include("teamBId");
	query.find({
		success:function(competition){
			res.render("competition",{competition:competition[0]});
		},
		error:function(object,error){
			console.log(error);
		}
	})
});
router.get("/getComment",function(req,res,next){
	var competitionId = req.query.competitionId;
	var query = new AV.Query(CompetitionComment);
	var competition = new Competition();
	competition.id = competitionId;
	query.equalTo("competitionId",competition);
	query.include("userId");
	query.include("userid.campusId");
	query.limit(20);
	query.find({
		success:function(comments){
			var query = new AV.Query(CompetitionComment);
			query.equalTo("competitionId",competition);
			query.count({
				success:function(count){
					var users = new Array();
					var campuses = new Array();
					for(var i=0;i<comments.length;i++){
						users[i] = comments[i].get("userId");
						campuses[i] = comments[i].get("userId").get("campusId").get("name");
						comments[i].updatedAt = format_date(comments[i].createdAt);
					}
					res.json({number:count,comments:comments,users:users,campuses:campuses});
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