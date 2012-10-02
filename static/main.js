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

var stream = function(){
	var source = new EventSource('stream');

	source.addEventListener('twitter', function(e) {
		var data = JSON.parse(e.data),
				/*htm = [];
		htm.push( '<li class="twitter" style="display: none;">' );
		htm.push( '<div class="profile">' );
			htm.push( '<img src="'+data.user.profile_image_url+'" />' );
			htm.push( '<a href="#">'+ data.user.screen_name + '</a>' );
		htm.push( '</div>' );
		htm.push( '<div class="text">'+data.text+'</div>' );
		htm.push( '</li>' );

		$("#results").prepend( htm.join("") );
		$("#results li:first-child").fadeIn();*/
		log.add(data);
	}, false);

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