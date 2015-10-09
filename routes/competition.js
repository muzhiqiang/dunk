var express = require('express');
var router = express.Router();
var AV = require('avoscloud-sdk');
var Competition = AV.Object.extend("Competition");
var CompetitionComment = AV.Object.extend("CompetitionComment");
var dateUtil = require("../util/date.js");

router.get('/:competitionId',function(req,res,next){
	var competitionId = req.params.competitionId;
	if(competitionId=="getComment"){
		next();
		return;
	}
	var query = new AV.Query(Competition);
	query.equalTo("objectId",competitionId);
	query.include("teamAId");
	query.include("teamBId");
	query.include("reportId");
	query.include("gameId");
	query.find({
		success:function(competition){
			if(competition[0].get('reportId')){
				competition[0].get('reportId').set('time',dateUtil.format_date(competition[0].get('reportId').get('time')))
			}
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
	query.include("userId.campusId");
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
						comments[i].updatedAt = dateUtil.format_date(comments[i].createdAt);
					}
					res.json({number:count,comments:comments,users:users,campuses:campuses});
					res.end();
				}
			})
		},
		error:function(object,error){
			console.log(error);
		}
	})
});

module.exports = router;