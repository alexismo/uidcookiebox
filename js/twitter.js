var users = [];
var fed_users = [];
var minFeedTime = 25;//in minutes

var hashtag = "uidcookiebox";

var arduinoIsReady = false;

var interval = 5000;

function checkForFedUsers(feed){
    var dNow = new Date();
    var foundUsers = [];//only record the latest tweet for each user
    $.each(feed, function(i, val){
        var dAtTweet = new Date(val.created_at);
        var timeDiffInMinutes = Math.round(dateDiff(dNow, dAtTweet)/1000/60);//in minutes
        var indexOfFed = fed_users.indexOf(val.from_user);

        if(foundUsers.indexOf(val.from_user) == -1){//only take the latest tweet from a user
            foundUsers.push(val.from_user);

            if(timeDiffInMinutes < minFeedTime){
                if(indexOfFed  == -1){//if the user isn't found
                    //FEED USER HERE
                    if(arduinoIsReady && !feedingInitiated){
                        fed_users.push(val.from_user);
                        feedUser(val.from_user);
                    }
                }else{
                    //white.off();
                    //red.blink(2000, 1, BO.generators.Oscillator.SIN);//user is already fed
                    console.log("user " + val.from_user + " already fed");
                }
            }else{
                if(indexOfFed > -1){
                    console.log('found user '+val.from_user+' at '+indexOfFed);
                    //you can feed this user again, remove him from the array
                    fed_users.splice(indexOfFed, indexOfFed+1);
                }
            }
        }
    });
    if(!feedingInitiated){
        setTimeout(function(){getTweetsForTag(hashtag)}, interval);
    }
}

function dateDiff(date1,date2) {//returns the time diff in milliseconds
    return date1.getTime() - date2.getTime();
}

function getTweetsForTag(tag){
    var url = "http://search.twitter.com/search.json?q=%23"+tag;
    console.log('getting tweets');
    $.ajax(url,{
        type: "GET",
        dataType:"jsonp",
        success:twSuccess
    });
}

function twSuccess(data, statusTxt, request){
    if(statusTxt == "success"){
        if(data.results.length > 0){
            var user_time = [];
            $.each(data.results, function(i, val){
                user_time.push({from_user:val.from_user,created_at:val.created_at});
            });

            checkForFedUsers(user_time);

            $('#content').html('');
            $.each(fed_users, function(i, val){
                $('#content').append(val +"<br />");
            });
        }
    }else{
        console.log(status);
        console.log(request);
    }
}