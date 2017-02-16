T.lang('ru');
function getNotificationHTML(model) {
	return 	'<div data-read-url="' + model.url + '" data-id="' + model.id + '" class="notification group">' +
			'<h4>' + model.title + '</h4>' +
			'<p>' + model.body + '</p>' +			
			'</div><div inbox-id="' + model.id + '" class="inbox">Отметить как прочитанные</div><hr />';
}
function getAlertsHTML(model) {
    return  '<div alert-read-url="' + model.url + '" class="notification group">' +
            '<p>' + model.body + '</p>' +           
            '</div><div alert-id="' + model.markread + '" class="inbox">Отметить как прочитанные</div><hr />';
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
"comment_answer":"Ответы на комментарии",
"post_from_subscribed_user":"Новый пост"};
// 
function displayNotifications(notifications) {

	var notificationsHTML = '';

    var length = notifications.length;    
    if(length == 0) {        
        notificationsHTML = '<div class="no-notifications"><h4>Здесь пусто</h4></div>';
    } else {        
        for(var i = 0; i < length; i++ ) {            
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
            switch(item.type){

                case 'ban':
                viewModel.url = item.data.domain.url;
                viewModel.body = 'Так случилось, что вас забанили в сообществе <b>' + item.data.domain.title + '</b>';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'unban':
                viewModel.url = item.data.domain.url;
                viewModel.body = 'Хорошие новости – вас разбанили в сообществе <b>' + item.data.domain.title + '</b>';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'permission_grant':
                viewModel.url = item.data.domain.url;
                viewModel.body = 'Вы стали ' + item.data.permission + ' сообщества<b>' + item.data.domain.title + '!</b> Будьте благоразумны и удачи!';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'election_nomination_start':
                viewModel.url = item.data.domain.url;
                viewModel.body = 'В сообществе<b>' + item.data.domain.title + '</b> начались выборы';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'election_voting_start':
                viewModel.url = item.data.domain.url;
                viewModel.body = 'В сообществе<b>' + item.data.domain.title + '</b> началось голосование на выборах президента.';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'comment_answer':
                viewModel.url = item.data.comment.domain.url+'/comments/'+item.data.comment.post.id+'/#new';
                viewModel.body = item.data.comment.user.login +' ответил на  комментарий в посте ' + item.data.comment.post.title +
                ' ' + item.data.post.rating + '<br />'+item.data.comment.body;
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'post_from_subscribed_user':
                if (item.data.post.created == 0) { 
                    viewModel.url = '';
                    var metka = 'Распубликован';
                } else {
                    viewModel.url = item.data.post._links[1].href;
                    var metka = '';
                }
                viewModel.body = 'Новый пост '+item.data.post.user.login + ' <b>' + item.data.post.title+'</b> ' + metka;
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                default:
                viewModel.url = '';
                viewModel.body = item.type;
                viewModel.markread = '';                             
                alertsHTML += getAlertsHTML(viewModel);
            }
                           
        }
    }
   $("#alerts").html(alertsHTML);   
}

function updateAndDisplayNotifications(callback) {
    chrome.runtime.sendMessage({action : 'updateInboxComments'}, function(response) {
		displayNotifications(response);
        if(callback) callback(response);
    });
}

function updateAndDisplayAlerts(callback) {
    chrome.runtime.sendMessage({action : 'getAlerts'}, function(response) {
        displayAlerts(response);
        if(callback) callback(response);
    });
}

function markAsRead(i_id, callback) {
    chrome.runtime.sendMessage({action : 'markAsRead', inbox: i_id}, function(response) {
        displayNotifications(response);
        if(callback) callback(response);
    });
}

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
        	if (localStorage.getItem('count_'+key) != 0 && key != "new_comment"){
        		jsonAlerts += localStorage.getItem(key);
        	}            
        }       
        var replaced = jsonAlerts.replace(/\]\[/g,",");        
        if (replaced.length > 0){
        var fetchedAlerts = JSON.parse(replaced);
        } else {
    	var fetchedAlerts = 0;    	
    }    
    return fetchedAlerts;
}

function fetchMyThings(){        
        var jsonMyThings = [];
        for (var key in alertTypes) {
            if (localStorage.getItem('count_'+key) != 0 && key == "new_comment"){
                jsonMyThings += localStorage.getItem(key);
            }           
        }       
        if (jsonMyThings.length > 0){
        var fetchedMyThings = JSON.parse(jsonMyThings);
        } else {
        var fetchedMyThings = 0;      
    }    
    return fetchedMyThings;
}  

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
		displayAlerts(alerts);
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
	
    updateAndDisplayNotifications(function() {
        setTimeout(updateAndDisplayNotifications);
    });    
    updateAndDisplayAlerts(function() {
        setTimeout(updateAndDisplayAlerts);
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