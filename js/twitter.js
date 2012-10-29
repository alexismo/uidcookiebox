var users = [];
var fed_users = [];
var minFeedTime = 25;//in minutes

var arduinoIsReady = false;

var log = function(){
    var w = window;
    return {
        add: function(m) { w.console && w.console.log(m) },
        js: function() { w.console && w.console.profile() },  
        jsEnd: function() { w.console && w.console.profileEnd() },
        prof: function(code) {
            if ( w.console ) {
                console.profile();
                try { code() } catch(err) { };
                console.profileEnd();
            }
        }
    }
}();

function checkForFedUsers(user){
    if(is_user_in_fed(user)){
        console.log(user.from_user+' has been fed already');
        denyUser();
        return;
    }else{
        user.created_at = new Date();
        feedUser(user);
    }
}

function is_user_in_fed(user){
    for(var x = 0; x<fed_users.length;x++){
        console.log(fed_users[x].from_user, user.from_user);

        if(fed_users[x].from_user == user.from_user){
            
            var minutesSince = dateDiff(new Date(), fed_users[x].created_at);
            console.log(minutesSince);

            if(minutesSince < 5){
                console.log('we have already fed this person');
                denyUser();
                return true;
            }
        }
    }
    return false;
}

function dateDiff(date1,date2) {//returns the time diff in milliseconds
    return Math.round((date1.getTime() - date2.getTime())/1000/60);
}

var stream = function(){
    var source = new EventSource('stream');

    source.addEventListener('twitter', function(e) {
        var data = JSON.parse(e.data),
                htm = [];

        //console.log(data.user);

        if(data.user.name != null){
            htm.push( '<li class="twitter" style="display: none;">' );
            htm.push( '<div class="profile">' );
                htm.push( '<img src="'+data.user.profile_image_url+'" />' );
                htm.push( '<a href="#">'+ data.user.name + ', '+data.user.screen_name+'</a>' );
            htm.push( '</div>' );
            htm.push( '<div class="text">'+data.text+'</div>' );
            htm.push( '</li>' );

            if(arduinoIsReady){
                var user = {};
                user.from_user = data.user.screen_name;
                user.created_at = new Date(data.created_at);

                checkForFedUsers(user);
            }

            $("#results").prepend( htm.join("") );
            $("#results li:first-child").fadeIn();
            log.add(data);
        }else{
            console.log(data);
        }
    }, false);

    source.addEventListener('keepalive', function(e){
        console.log("keepalive received");
    });

    source.addEventListener('open', function(e) {
        log.add("opened");
    }, false);

    source.addEventListener('error', function(e) {
        log.add(e);
        if (e.eventPhase == EventSource.CLOSED) {
            log.add("closed");
        }
    }, false);
};

function renderFedUsers(){
    $('#content').html('');
        $.each(fed_users, function(i, val){
            $('#content').append(val.from_user+ " at "+val.created_at +"<br />");
    });
}

$(function(){
    if (!!window.EventSource) {
        stream();
    } else {
        // Result to xhr polling :(
    }
});