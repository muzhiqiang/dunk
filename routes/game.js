var express = require('express');
var router = express.Router();
var AV = require('avoscloud-sdk');
var Competition = AV.Object.extend("Competition");
var Game = AV.Object.extend("Game");
var Report = AV.Object.extend("Report");
var dateUtil = require("../util/date.js");

router.get("/:gameId",function(req,res,next){
	var gameId = req.params.gameId;
	var query = new AV.Query(Game);
	query.equalTo("objectId",gameId);
	query.find({
		success:function(games){
			if(games.length>0){
				var game = games[0];
				var query = game.relation("teams").query();
				query.find({
					success:function(teams){
						query = game.relation("reports").query();
						query.find({
							success:function(reports){
								query = new AV.Query(Competition);
								query.include("teamAId");
								query.include("teamBId");
								query.descending("level");
								query.equalTo("gameId",game);
								query.find({
									success:function(competitions){
										for(var i=0;i<reports.length;i++){
											reports[i].set("time",dateUtil.format_date(reports[i].get("time")))
										}
										res.render('game',{game:game,teams:teams,reports:reports,competitions:competitions});
									},
									error:function(object,error){
										console.log(error);
									}

								})
								
							},
							error:function(object,error){
								console.log(error);
							}
						})
					},
					error:function(object,error){
						console.log(error);
					}
				})
				
				
			}
		},
		error:function(object,error){
			console.log(error);
		}
	})
});

module.exports = router;