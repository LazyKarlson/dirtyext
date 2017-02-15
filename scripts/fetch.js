T.lang('ru');
function getNotificationHTML(model) {
	return 	'<div data-read-url="' + model.url + '" data-id="' + model.id + '" class="notification group">' +
			'<h4>' + model.title + '</h4>' +
			'<p>' + model.body + '</p>' +			
			'</div><div inbox-id="' + model.id + '" class="inbox">Отметить как прочитанные</div><hr />';
}

// Display the notifications
function displayNotifications(notifications) {

	var notificationsHTML = '';

	// Loop through each notification

    var length = notifications.length;    
    if(length == 0) {        
        notificationsHTML = '<div class="no-notifications"><h4>No notifications.</h4></div>';
    } else {        
        for(var i = 0; i < length; i++ ) {

            // Set up notification and its view model
            var item = notifications[i];            
            var viewModel = {
                id: '',
                title: '',
                body: '',
                url: ''
            };
                
                viewModel.id = item.id;
                viewModel.title = '<strong>' + T('new_comments.uploaded', { comments: item.unread_comments_count}) + '</strong>';
                viewModel.url = "https://dirty.ru/my/inbox/"+ item.id + "/" ;
                viewModel.body = item.data.text.replace(/<\/?[^>]+(>|$)/g, "");                              
                notificationsHTML += getNotificationHTML(viewModel);
            
        }
    }

	$("#notifications").html(notificationsHTML);
}

// Will force a refresh of notifications and will then display them
function updateAndDisplayNotifications(callback) {
    chrome.runtime.sendMessage({action : 'updateInboxComments'}, function(response) {
		displayNotifications(response);
        if(callback) callback(response);
    });
}

function markAsRead(i_id, callback) {
    chrome.runtime.sendMessage({action : 'markAsRead', inbox: i_id}, function(response) {
        displayNotifications(response);
        if(callback) callback(response);
    });
}

// truncates input to defined length while ensuring that the text always ends in a full word
function truncate(text,length){
	if(text.length > length){
		text = text.substring(0,length);
		if(text.charAt(text.length - 1 ) != " "){
			var lastSpace = text.lastIndexOf(" ");
			text = text.substring(0, lastSpace);
		}
		text += "...";
	}

	return text;
}

// Add logic after dom is ready

$(document).ready(function() {

	var notifications = localStorage.getItem('inboxcomments');

	if(notifications === null) {
		updateAndDisplayNotifications();
	} else {
		notifications = JSON.parse(notifications);
		displayNotifications(notifications);
	}

	$("body").on("click", "[data-read-url]", null, function(event) {
	
	var notifications = JSON.parse(localStorage.getItem('inboxcomments'));
	
    var notification = $(event.target).closest('.notification');    
	var url = notification[0].getAttribute('data-read-url') + '#new';
    var id = notification[0].getAttribute('data-id');	
	var foundNotification = false;
	var i = 0;
	chrome.tabs.create({url: url, active: false});
	for(; i < notifications.length; i++) {
		if(notifications[i].id == id)  {
			foundNotification = true;
			break;
		}
	}
	if(foundNotification) {
		notifications.splice(i, 1);
		localStorage.setItem('inboxcomments', JSON.stringify(notifications));
	}	
    chrome.notifications.clear(id);
	});
	$("body").on("click", "[inbox-id]", null, function(event) {
        var inbox = $(event.target).closest('.inbox');    
        var inbox_id = inbox[0].getAttribute('inbox-id');
        markAsRead(inbox_id);
    });

	$(".openOptions").click(function() {
		chrome.tabs.create({url: 'options.html'});
	});


  $(".forceRefresh").click(function() {
    $('.forceRefresh').addClass('fa-spin');
	setTimeout(function() {
        $('.forceRefresh').removeClass('fa-spin');
    }, 1000)
	//causes spinner to go around a minimum of one cycle
	
    updateAndDisplayNotifications(function() {
        setTimeout(updateAndDisplayNotifications);
    });    
  });  
});
//tabs
$(function(){
  $('ul.tabs li:first').addClass('active');
  $('.block article').hide();
  $('.block article:first').show();
  $('ul.tabs li').on('click',function(){
    $('ul.tabs li').removeClass('active');
    $(this).addClass('active')
    $('.block article').hide();
    var activeTab = $(this).find('a').attr('href');
    $(activeTab).show();
    return false;
  });
})