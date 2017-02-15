T.lang('ru');
function getNotificationHTML(model) {
	return 	'<div data-read-url="' + model.url + '" data-id="' + model.id + '" class="notification group">' +
			'<h4>' + model.title + '</h4>' +
			'<p>' + model.body + '</p>' +			
			'</div><div inbox-id="' + model.id + '" class="inbox">Отметить как прочитанные</div><hr />';
}
var alertTypes = {"comment_answer":"Ответы",
"mention":"Упоминания",
"new_comment":"Новые комментарии",
"post_became_gold":"Золотой пост",
"permission_grant":"Получите лопату",
"given_gold":"Получите золото",
"ban":"Вас забанили",
"unban":"Вас разбанили",
"president_elected":"Выборы закончились",
"election_voting_start":"Голосование началось",
"election_nomination_start":"Выдвижение началось",
"post_from_subscribed_user":"Новый пост"};
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
function displayAlerts(alerts) {

	var alertsHTML = '';

	// Loop through each notification

    var length = alerts.length;    
    if(length == 0) {        
        alertsHTML = '<div class="no-alerts"><h4>Здесь пусто</h4></div>';
    } else {        
        for(var i = 0; i < length; i++ ) {
            
            var item = alerts[i];            
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
                alertsHTML += getAlertsHTML(viewModel);
            
        }
    }

	$("#alerts").html(alertsHTML);
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

function fetchAlerts(){
		var jsonAlerts = [];
        for (var key in alertTypes) {
        	if (localStorage.getItem('count_'+key) != 0){
        		jsonAlerts += localStorage.getItem(key);
        	}              
        }               
        if (jsonAlerts.length > 0){
        var fetchedAlerts = JSON.parse(jsonAlerts);        
    } else {
    	var fetchedAlerts = 0;    	
    }
    return fetchedAlerts;
}
// Add logic after dom is ready

$(document).ready(function() {

	var notifications = localStorage.getItem('inboxcomments');
	var alerts = fetchAlerts();
	if(notifications === null) {
		updateAndDisplayNotifications();
	} else {
		notifications = JSON.parse(notifications);
		displayNotifications(notifications);
	}
	if(alerts != 0) {
		DisplayAlerts(alerts);
	} else {
		updateAndDisplayAlerts();
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