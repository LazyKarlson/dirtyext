var sid;
var uid;
var updateNotificationsInterval = null;
var lastInboxCommentsCount = 0;
var xhr = new XMLHttpRequest();
var req = new XMLHttpRequest();
var subs = new XMLHttpRequest();
var alertsCount;
T.lang('ru');

var actions = {
	updateInboxComments: function(request, callback) {        
        var refreshInterval = localStorage.getItem('refreshInterval');
	chrome.cookies.getAll({url:"http://dirty.ru/"}, function(cookies) {	
	getInboxes(cookies[0].value, cookies[1].value);	   
  		});
	},

    markAsRead: function(request, callback) {    
    chrome.cookies.getAll({url:"http://dirty.ru/"}, function(cookies) { 
    markRead(cookies[0].value, cookies[1].value, request.inbox);
       
        });
    },

    getAlerts: function(request, callback) {    
    chrome.cookies.getAll({url:"http://dirty.ru/"}, function(cookies) { 
    getMyAlerts(cookies[0].value, cookies[1].value);
       
        });
    },

	initNotificationsInterval: function() {        
        var refreshInterval = localStorage.getItem('refreshInterval');

        if(refreshInterval === null) {
            refreshInterval = 60000;
        } else {
            refreshInterval = +refreshInterval;
        }

        if(updateNotificationsInterval) {
            clearInterval(updateNotificationsInterval);
        }
        updateNotificationsInterval = setInterval(actions.updateInboxComments, refreshInterval);
    }
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

function getInboxes(u_id, s_id){
xhr.open('GET', "https://dirty.ru/api/inboxes/unread/", true);
xhr.setRequestHeader('X-Futuware-UID', u_id);
xhr.setRequestHeader('X-Futuware-SID', s_id);
xhr.onreadystatechange = processInboxes;
xhr.send();
}

function markRead(u_id, s_id, i_id){
localStorage.removeItem('inbox'+i_id);
var inboxUrl = "https://dirty.ru/api/inbox/" + i_id + "/view/";    
req.open('POST', inboxUrl, true);
req.setRequestHeader('X-Futuware-UID', u_id);
req.setRequestHeader('X-Futuware-SID', s_id);
req.onreadystatechange = getInboxes(u_id, s_id);
req.send();
}

function getMyAlerts(u_id, s_id){
var alertsUrl = "https://dirty.ru/api/my/notifications/unread/"; 
//var inboxUrl = "https://dirty.ru/api/my/notifications/mark_read/"; 
subs.open('GET', alertsUrl, true);
subs.setRequestHeader('X-Futuware-UID', u_id);
subs.setRequestHeader('X-Futuware-SID', s_id);
subs.onreadystatechange = processAlerts;
subs.send();
}

function processAlerts(e) {
    if (subs.readyState == 4) {
        var response = JSON.parse(subs.responseText);
        localStorage.setItem('totalAlertsCount', response["item_count"]);
        if (response["item_count"] > 0){
        var alerts = response['notifications'];
        var jsonAlerts = "{";
        for (var key in alertTypes) {
        var filtered = filterAlerts(alerts, key);
        if (filtered > 0){ 
        jsonAlerts += '"' + key + '" :' + filtered + ', ';}       
        }               
        jsonAlerts = jsonAlerts.substr(0, jsonAlerts.length-2);
        jsonAlerts += "}";
        var alertsCount = JSON.parse(jsonAlerts);        
        var prepareList = [];
        if(typeof alertsCount != "undefined" &&  Object.keys(alertsCount).length > 0) {            
            Object.keys(alertsCount).forEach(function(k) {
                var new_alert_count = alertsCount[k] - localStorage.getItem('count_'+k);                
                if(new_alert_count > 0) {
                    prepareList.push({
                                    title: alertTypes[k],
                                    message: alertsCount[k] + "/" + new_alert_count
                            });
                 } 
                 localStorage.setItem('count_'+k, alertsCount[k]);               
            });
                if (localStorage.getItem('showDesktopNotifications') === "true") {
            var desktopNotificationTemplate = {
                type: 'list',
                title: "Новые уведомления, %username%!",
                message: "",
                iconUrl: 'images/128.png',
                items: prepareList
            }
                chrome.notifications.create('alerts', desktopNotificationTemplate);
            
            }            
        }
        }
        drawBadge();
    }
}

function filterAlerts(alerts, type){
    var result = alerts.filter(function( obj ) {
        return obj.type == type;
        });
    localStorage.setItem(type, JSON.stringify(result));
    if (localStorage.getItem('count_'+type) == null){
            localStorage.setItem('count_'+type, 0);            
        }
    return result.length;       
}

function processInboxes(e) {
    if (xhr.readyState == 4) {
    	var response = JSON.parse(xhr.responseText);    	
    	localStorage.setItem('inboxcomments', JSON.stringify(response.inboxes));
    	localStorage.setItem('lastUpdate', moment().format('X'));
    	var inboxes = response['inboxes'];
        //удаляем пустые
        if (inboxes.length == 0){
                Object.keys(localStorage)
                .forEach(function(key){
                     if (key.substring(0,5) == 'inbox') {                       
                localStorage.removeItem(key); 
            }
       });
            };
        //считаем количество новых с последнего обновления и показываем    
	    if(typeof inboxes != "undefined" &&  inboxes.length > 0) {
	    	var iCount = inboxes.length;            
	    	var mCount = 0;	    	   	
	    	for (var i in inboxes) {	      
	      var inboxName = inboxes[i].data.text.replace(/<\/?[^>]+(>|$)/g, "");	      
	      if (localStorage.getItem('inbox'+inboxes[i].id) == null){
	      	localStorage.setItem('inbox'+inboxes[i].id, inboxes[i].unread_comments_count);
			new_comment_count = inboxes[i].unread_comments_count;
	      }
	      else {
	       new_comment_count = inboxes[i].unread_comments_count - localStorage.getItem('inbox'+inboxes[i].id);
	       if (new_comment_count < 0) {new_comment_count = inboxes[i].unread_comments_count;}
	       localStorage.setItem('inbox'+inboxes[i].id, inboxes[i].unread_comments_count);
	   			}
	     if (localStorage.getItem('showDesktopNotifications') === "true" && new_comment_count > 0) {
            var desktopNotificationTemplate = {
                type: 'basic',
                title: T('new_comments.uploaded', { comments: new_comment_count}),
                message: inboxName,
                iconUrl: 'images/128.png'
            }
                chrome.notifications.create(inboxes[i].id.toString(), desktopNotificationTemplate);
            
        	}		
	      		mCount = mCount + inboxes[i].unread_comments_count;	      		
	       } 
	       localStorage.setItem('inboxCommentsCount', '' + mCount);
	       if(mCount > lastInboxCommentsCount && localStorage.getItem('playAudio') === "true") {
            var audio = new Audio("pop.mp3");
            audio.play();
        	}
        	lastInboxCommentsCount = mCount;
	       //chrome.browserAction.setBadgeBackgroundColor({ color: [255, 123, 85, 255] });
	       //chrome.browserAction.setBadgeText({text: iCount +'/'+ mCount });
	       //chrome.browserAction.setIcon({path: 'images/icon.png'});	                          
	    } else {

	        localStorage.setItem('inboxCommentsCount', '0');
	        //chrome.browserAction.setBadgeText({text: ''});
	        //chrome.browserAction.setIcon({path: 'images/icongray.png'});
	        lastInboxCommentsCount = 0;        
	    }
        drawBadge();
	}	
}

function drawBadge(){
    if (localStorage.getItem('totalAlertsCount') > 0 || localStorage.getItem('inboxCommentsCount')>0){
        chrome.browserAction.setBadgeBackgroundColor({ color: [255, 123, 85, 255] });
        chrome.browserAction.setBadgeText({text: localStorage.getItem('totalAlertsCount') +'/'+ localStorage.getItem('inboxCommentsCount') });
        chrome.browserAction.setIcon({path: 'images/icon.png'});
    } else {
        chrome.browserAction.setBadgeText({text: ''});
        chrome.browserAction.setIcon({path: 'images/icongray.png'});
    }

}

actions.initNotificationsInterval(); 
actions.updateInboxComments();
actions.getAlerts();

function onRequest(request, sender, callback) {    
	if(actions.hasOwnProperty(request.action)) {
		actions[request.action](request, callback);
	}
}


chrome.runtime.onMessage.addListener(onRequest);

chrome.notifications.onClicked.addListener(function(id){
    var inboxcomments = JSON.parse(localStorage.getItem('inboxcomments'));    
    var results = $.grep(inboxcomments, function(element){return element.id == id; });    
    if (results.length > 0){            
                chrome.tabs.create({url: "https://dirty.ru/my/inbox/" + results[0].id + "/#new", active: false});
                localStorage.removeItem('inbox' + results[0].id);
            } else {
                chrome.tabs.create({url: "https://dirty.ru/my/inbox/", active: false});
            }

            for(var i = 0; i < inboxcomments.length; i++) {
                if(inboxcomments[i].id == results[0].id)  {
                    inboxcomments.splice(i, 1);
                    localStorage.setItem('inboxcomments', JSON.stringify(inboxcomments));
                    break;
                }
            }            
        
        chrome.notifications.clear(results[0].id);    
});