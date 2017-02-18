T.lang('ru');
function getNotificationHTML(model) {
	return 	'<div data-read-url="' + model.url + '" data-id="' + model.id + '" class="notification group">' +
			'<h4>' + model.title + '</h4>' +
			'<p>' + model.body + '</p>' +			
			'</div><button type="button" inbox-id="' + model.id + '" class="inbox"><i class="fa fa-check-circle"></i> Отметить как прочитанное</button><hr />';
}
function getAlertsHTML(model) {
    return  '<div alert-read-url="' + model.url + '" class="notification group">' +
            '<p>' + model.body + '</p>' +           
            '</div><button type="button" alert-type="' + model.id + '" alert-id="' + model.markread + '" class="alert fa fa-check-circle"><i class="fa fa-check-circle"></i> Отметить как прочитанное</button><hr />';
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
 
function displayNotifications(notifications) {
    var notice = notifications;
	var notificationsHTML = '';
    if (typeof notice === 'undefined'){
     notice = JSON.parse(localStorage.getItem('inboxcomments'));
     if (notice === null){
     var length = 0;
     }else{
     var length = notice.length; 
 	}    
    } else {
    var length = notice.length; 
    } 
   //var length = notifications.length;    
    if(length == 0) {        
        notificationsHTML = '<div class="no-notifications"><h5>Здесь пусто, нет ничего вообще.</h5></div>';
    } else {        
        for(var i = 0; i < length; i++ ) {            
            var item = notice[i];            
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
    var events = alerts;    
	var alertsHTML = '';
    var mythingsHTML = '';        
    if (typeof events === 'undefined' || events == 'null'){
    var length = fetchAlerts();   
    } else {
    var length = events.length;
    }
    if(length == 0) {        
        alertsHTML = '<div class="no-alerts"><h4>Здесь пусто, нет ничего вообще.</h4></div>';
        mythingsHTML = '<div class="no-alerts"><h4>Здесь пусто, нет ничего вообще.</h4></div>';
    } else {        
        for(var i = 0; i < length; i++ ) {            
            var item = events[i];                       
            var viewModel = {
                id: '',
                title: '',
                body: '',
                url: ''
            };
            switch(item.type){

                case 'ban':
                viewModel.id = item.type;
                viewModel.url = item.data.domain.url;
                viewModel.body = 'Так случилось, что вас забанили в сообществе <b>' + item.data.domain.title + '</b>';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'unban':
                viewModel.id = item.type;
                viewModel.url = item.data.domain.url;
                viewModel.body = 'Хорошие новости – вас разбанили в сообществе <b>' + item.data.domain.title + '</b>';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'permission_grant':
                viewModel.id = item.type;
                viewModel.url = item.data.domain.url;
                viewModel.body = 'Вы стали ' + item.data.permission + ' сообщества <b>' + item.data.domain.title + '!</b> Будьте благоразумны и удачи!';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'election_nomination_start':
                viewModel.id = item.type;
                viewModel.url = item.data.domain.url;
                viewModel.body = 'В сообществе <b>' + item.data.domain.title + '</b> начались выборы';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'election_voting_start':
                viewModel.id = item.type;
                viewModel.url = item.data.domain.url;
                viewModel.body = 'В сообществе <b>' + item.data.domain.title + '</b> началось голосование на выборах президента.';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'comment_answer':
                viewModel.id = item.type;
                viewModel.url = item.data.comment.domain.url+'/comments/'+item.data.comment.post.id+'/#new';
                viewModel.body = item.data.comment.user.login +' ответил на  комментарий в посте ' + item.data.comment.post.title +
                ' ' + item.data.post.rating + '<br />'+item.data.comment.body;
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'new_comment':
                viewModel.id = item.type;
                viewModel.url = item.data.post._links[1].href;
                viewModel.body = 'В посте '+ item.data.post.title + ' '  + T('new_comments.added', { comments: item.data.post.unread_comments_count});
                ' ' + item.data.post.rating;
                viewModel.markread = item._links[0].href;                             
                mythingsHTML += getAlertsHTML(viewModel);
                break;

                case 'post_from_subscribed_user':
                viewModel.id = item.type;
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
                viewModel.id = item.type;
                viewModel.url = '';
                viewModel.body = item.type;
                viewModel.markread = '';                             
                alertsHTML += getAlertsHTML(viewModel);
            }
                           
        }
    }   
   if (alertsHTML == '' || alertsHTML.lenght == 0){$("#myalerts").html('<div class="no-alerts"><h4>Здесь пусто, нет ничего вообще.</h4></div>')}
    else {
   $("#myalerts").html(alertsHTML + '<button type="button" alert-type="all" alert-id="https://dirty.ru/api/my/notifications/mark_read/" class="alert"><i class="fa fa-check-circle"></i> Отметить всё как прочитанное</button><hr />');
   }
   if (mythingsHTML.length >0 ){
   $("#mythings").html(mythingsHTML);  
   } else {
   $("#mythings").html('<div class="no-alerts"><h4>Здесь пусто, нет ничего вообще.</h4></div>')} 
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
    chrome.runtime.sendMessage({action : 'markAsRead', inbox: i_id }, function(response) {
        displayNotifications(response);
        if(callback) callback(response);
    });
}

function alertMarkAsRead(url, type, callback) {
    chrome.runtime.sendMessage({action : 'alertsMarkAsRead', alert: url, alert_type: type}, function(response) {
        displayAlerts(response);
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
        	//if (localStorage.getItem('count_'+key) != 0 && key != "new_comment"){
            if (localStorage.getItem('count_'+key) === null){
                jsonAlerts = [];
            }    
            else if (localStorage.getItem('count_'+key) != 0){
        		jsonAlerts += localStorage.getItem(key);
        	}            
        }       
            
        if (jsonAlerts.length > 0){
        var replaced = jsonAlerts.replace(/\]\[/g,",");        
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
        $('.inbox').addClass('fa-spin');
    setTimeout(function() {
        $('.inbox').removeClass('fa-spin');
    }, 1000)
        markAsRead(inbox_id);
    });

    $("body").on("click", "[alert-id]", null, function(event) {
        var alert = $(event.target).closest('.alert');    
        var alert_url = alert[0].getAttribute('alert-id');
        var alert_type = alert[0].getAttribute('alert-type');
        alertMarkAsRead(alert_url, alert_type);
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