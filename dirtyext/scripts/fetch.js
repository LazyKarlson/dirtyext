T.lang('ru');
function getNotificationHTML(model) {
	return 	'<div  class="box-header"><div data-read-url="' + model.url + '" data-id="' + model.id + '" class="notification group left-cell">' +
			'<h4>' + model.title + '</h4>' +
			'<p>' + model.body + '</p>' +			
			'</div><div class="right-cell"><i inbox-id="' + model.id + '" class="inbox fa fa-check-circle"></i></div></div>';
}

function getMyThingsHTML(model) {
    return  '<div  class="box-header"><div mything-read-url="' + model.url + '" class="mythings group left-cell">' +
            '<p>' + model.body + '</p>' +           
            '</div><div class="right-cell"><i id="' + model.id + '" alert-type="' + model.type + '" mything-id="' + model.markread + '" class="mything fa fa-check-circle"></i></div></div>';
}

function getAlertsHTML(model) {
    return  '<div  class="box-header"><div alert-read-url="' + model.url + '" class="myalerts group left-cell">' +
            '<p>' + model.body + '</p>' +           
            '</div><div class="right-cell"><i id="' + model.id + '" alert-type="' + model.type + '" alert-id="' + model.markread + '" class="alert fa fa-check-circle"></i></div></div>';
}
var alertTypes = {
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
"mycomments_answer":"Ответы на комментарии",
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
        notificationsHTML = '<div class="no-notifications"><h4>Здесь пусто, нет ничего вообще.</h4></div>';
        $('.tab1').removeClass( "fa fa-comment" ).addClass( "fa fa-comment-0" );
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
        $('.tab1').removeClass( "fa fa-comment-o" ).addClass( "fa fa-comment" );
    }
    $("#notifications").html(notificationsHTML);
    if (parseInt(localStorage.getItem('karma')) < 0){userKarma = '<span id="karma" class="negative"><b>&nbsp;'+localStorage.getItem('karma')+'&nbsp;</b></span>';}else{
    userKarma = '<span id="karma" class="positive"><b>&nbsp;'+localStorage.getItem('karma')+'&nbsp;</b></span>';}
    
    $("#userinfo").html('<i title="Карма" class="fa fa-user"></i>'+userKarma+'<i title="Плюсы" class="fa fa-arrow-up"></i><span id="plus" class="positive">&nbsp;'+localStorage.getItem('upVotes')+'&nbsp;</span><i title="Минусы" class="fa fa-arrow-down"></i><span id="plus" class="negative">&nbsp;'+localStorage.getItem('downVotes')+'&nbsp;</span><i title="Посты" class="fa fa-file-text"></i><span id="plus" class="positive">&nbsp;'+localStorage.getItem('user_posts')+'&nbsp;</span><i title="Комментарии" class="fa fa-comments"></i><span id="plus" class="positive">&nbsp;'+localStorage.getItem('user_comments')+'</span>');
}

function displayUserInfo(){    
}

function displayAlerts(alerts) {
    var events = alerts;    
	var alertsHTML = '';
    var mythingsHTML = '';        
    if (typeof events === 'undefined' || events === null){
    var length = fetchAlerts();   
    } else {
    var length = events.length;
    }
    if(length == 0)
    {        
        alertsHTML = '<div class="no-alerts"><h4>Здесь пусто, нет ничего вообще.</h4></div>';
        mythingsHTML = '<div class="no-alerts"><h4>Здесь пусто, нет ничего вообще.</h4></div>';
        $('.tab3').removeClass( "fa fa-bell" ).addClass( "fa fa-bell-o" );
        $('.tab2').removeClass( "fa fa-file-text" ).addClass( "fa fa-file-text-o" );
    } 
    else 
    {        
        for(var i = 0; i < length; i++ ) 
        {            
            var item = events[i];                       
            var viewModel = {
                id: '',
                type: '',
                title: '',
                body: '',
                url: ''
            };

            switch(item.type)
            {

                case 'ban':
                viewModel.id = item.id;
                viewModel.type = item.type;
                viewModel.url = item.data.domain.url;
                viewModel.body = 'Так случилось, что вас забанили в сообществе <b>"' + item.data.domain.title + '"</b>';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'unban':
                viewModel.id = item.id;
                viewModel.type = item.type;
                viewModel.url = item.data.domain.url;
                viewModel.body = 'Хорошие новости – вас разбанили в сообществе <b>"' + item.data.domain.title + '"</b>';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'permission_grant':
                viewModel.id = item.id;
                viewModel.type = item.type;
                viewModel.url = item.data.domain.url;
                viewModel.body = 'Вы стали "' + item.data.permission + '"" сообщества <b>' + item.data.domain.title + '!</b> Будьте благоразумны и удачи!';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'election_nomination_start':
                viewModel.id = item.id;
                viewModel.type = item.type;
                viewModel.url = item.data.domain.url;
                viewModel.body = 'В сообществе <b>"' + item.data.domain.title + '"</b> начались выборы';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'election_voting_start':
                viewModel.id = item.id;
                viewModel.type = item.type;
                viewModel.url = item.data.domain.url;
                viewModel.body = 'В сообществе <b>"' + item.data.domain.title + '"</b> началось голосование на выборах президента.';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'mycomments_answer':
                var strippedCommend = item.data.comment.body.replace(/<(?:.|\n)*?>/gm, '');
                viewModel.id = item.id;
                viewModel.type = item.type;
                viewModel.url = item.data.comment.domain.url+'/comments/'+item.data.comment.post.id+'/#new';
                viewModel.body = item.data.comment.user.login +' ответил на  комментарий в посте "' + item.data.comment.post.title +
                '" ' + item.data.post.rating + '<br />"'+strippedCommend+'"';
                viewModel.markread = item._links[0].href;                             
                alertsHTML += getAlertsHTML(viewModel);
                break;

                case 'new_comment':
                viewModel.id = item.id;
                viewModel.type = item.type;
                viewModel.url = item.data.post._links[1].href;
                viewModel.body = 'В посте "'+ item.data.post.title + '" '  + T('new_comments.added', { comments: item.data.post.unread_comments_count});
                ' ' + item.data.post.rating;
                viewModel.markread = item._links[0].href;                             
                mythingsHTML += getMyThingsHTML(viewModel);
                break;

                case 'post_from_subscribed_user':
                viewModel.id = item.id;
                viewModel.type = item.type;
                if (item.data.post.created == 0) { 
                    viewModel.url = '';
                    var metka = 'Распубликован';
                } else {
                    viewModel.url = item.data.post._links[1].href;
                    var metka = '';
                }
                viewModel.body = 'Новый пост '+item.data.post.user.login + ' <b>"' + item.data.post.title+'"</b> ' + metka;
                viewModel.markread = item._links[0].href;                                     
                alertsHTML += getAlertsHTML(viewModel);                
                break;

                default:
                viewModel.id = item.id;
                viewModel.type = item.type;
                viewModel.url = '';
                viewModel.body = item.type;
                viewModel.markread = '';                             
                alertsHTML += getAlertsHTML(viewModel);
                break;
            }
                           
        }
    if (alertsHTML == '' || alertsHTML.lenght == 0){
    $("#myalerts").html('<div class="no-alerts"><h4>Здесь пусто, нет ничего вообще.</h4></div>');
    $('.tab3').removeClass( "fa fa-bell" ).addClass( "fa fa-bell-o" );
}
    else {
   $('.tab3').removeClass( "fa fa-bell-o" ).addClass( "fa fa-bell" );
   $("#myalerts").html(alertsHTML + '<button type="button" alert-type="all" alert-id="https://dirty.ru/api/my/notifications/mark_read/"><i class="alert fa fa-check-circle"></i> Отметить всё как прочитанное</button><hr />');
   }
   if (mythingsHTML.length >0 ){
   $('.tab2').removeClass( "fa fa-file-text-o" ).addClass( "fa fa-file-text" );
   $("#mythings").html(mythingsHTML);  
   }
    else
     {
    $("#mythings").html('<div class="no-alerts"><h4>Здесь пусто, нет ничего вообще.</h4></div>');
    $('.tab2').removeClass( "fa fa-file-text" ).addClass( "fa fa-file-text-o" );
    }
    }   
}

function updateAndDisplayNotifications(callback) {
    chrome.runtime.sendMessage({action : 'updateInboxComments'}, function(response) {
		displayNotifications(response);
        if(callback) callback(response);
    });
}

function updateAndDisplayUserInfo(callback) {
    chrome.runtime.sendMessage({action : 'getUser'}, function(response) {
        displayUserInfo();
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
            if (!localStorage.getItem('count_'+key)){
                jsonAlerts = [];
            }    
            else if (localStorage.getItem('count_'+key) != '0'){
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
            if (localStorage.getItem('count_'+key) != '0' && key == "new_comment"){
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
    /*var jsonNotes = "{";
    Object.keys(localStorage).forEach(function(key){                      
             if (key.substring(0,7) == 'comment') {                       
      jsonNotes += '"' + key + '" :' + localStorage.getItem(key) + ', ';                 
             }
             });
        jsonNotes = jsonNotes.substr(0, jsonNotes.length-2);
        jsonNotes += "}";       
    var notesCount = JSON.parse(jsonNotes);        
    console.log(notesCount);*/
    var notifications = localStorage.getItem('inboxcomments');
    //var notifications = notesCount;
    var alerts = fetchAlerts();    	
	if(!notifications) {
		updateAndDisplayNotifications();
	} else {
		notifications = JSON.parse(notifications);
		displayNotifications(notifications);
	}
	//if(alerts == 0) {
    if(!alerts) {    
		updateAndDisplayAlerts();
	} else {
		displayAlerts(alerts);
	}
    updateAndDisplayUserInfo();
    //displayUserInfo(); 

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

    $("body").on("click", "[alert-read-url]", null, function(event) {    
    var notification = $(event.target).closest('.myalerts');        
    var url = notification[0].getAttribute('alert-read-url') + '#new';
    var id = notification[0].getAttribute('data-id');    
    chrome.tabs.create({url: url, active: false});    
    });

    $("body").on("click", "[mything-read-url]", null, function(event) {    
    var notification = $(event.target).closest('.mythings');     
    var url = notification[0].getAttribute('mything-read-url') + '#new';
    var id = notification[0].getAttribute('data-id');    
    chrome.tabs.create({url: url, active: false});    
    });

	$("body").on("click", "[inbox-id]", null, function(event) {
        var inbox = $(event.target).closest('.inbox');    
        var inbox_id = inbox[0].getAttribute('inbox-id');
        $('.inbox').addClass('fa-spin');
    setTimeout(function() {
        $('.inbox').removeClass('fa-spin');
    }, 3000)
        markAsRead(inbox_id);
    });

    $("body").on("click", "[alert-id]", null, function(event) {
        var alert = $(event.target).closest('.alert');    
        var alert_url = alert[0].getAttribute('alert-id');
        var alert_type = alert[0].getAttribute('alert-type');
        var alert_id = "'#" + alert[0].getAttribute('id');
        //$('.alert').addClass('fa-spin');
        $(alert_id).addClass('fa-spin');
    setTimeout(function() {
        //$('.alert').removeClass('fa-spin');
        $(alert_id).removeClass('fa-spin');
    }, 3000)
        alertMarkAsRead(alert_url, alert_type);
    });

    $("body").on("click", "[mything-id]", null, function(event) {
        var alert = $(event.target).closest('.mything'); 
        var alert_url = alert[0].getAttribute('mything-id');
        var alert_type = alert[0].getAttribute('alert-type');
        var alert_id = "'#" + alert[0].getAttribute('id');
        //$('.mything').addClass('fa-spin');
        $(alert_id).addClass('fa-spin');
    setTimeout(function() {
       // $('.mything').removeClass('fa-spin');
       $(alert_id).removeClass('fa-spin');
    }, 3000)
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
    /*updateAndDisplayUserInfo (function() {
        setTimeout(updateAndDisplayUserInfo);
    });*/
    
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