var sid;
var uid;
var updateNotificationsInterval = null;
var lastInboxCommentsCount = 0;
var xhr = new XMLHttpRequest();
var usr = new XMLHttpRequest();
var req = new XMLHttpRequest();
var subs = new XMLHttpRequest();
var alertsCount;
T.lang('ru');
var actions = {
    getUser: function(request) {
    chrome.cookies.get({url: "http://dirty.ru/", name: 'uid'}, function(cookie) {   
    uid = cookie.value;
    chrome.cookies.get({url: "http://dirty.ru/", name: 'sid'}, function(cookie) {   
    sid = cookie.value; 
    getUserData(uid, sid)});    
});
    },

    updateInboxComments: function(request, callback) {
    chrome.cookies.get({url: "http://dirty.ru/", name: 'uid'}, function(cookie) {   
    uid = cookie.value;
    chrome.cookies.get({url: "http://dirty.ru/", name: 'sid'}, function(cookie) {   
    sid = cookie.value;         
    getInboxes(uid, sid);      
        });    
});

    },

    markAsRead: function(request) {
    chrome.cookies.get({url: "http://dirty.ru/", name: 'uid'}, function(cookie) {   
    uid = cookie.value;
    chrome.cookies.get({url: "http://dirty.ru/", name: 'sid'}, function(cookie) {   
    sid = cookie.value;    
    markRead(uid, sid, request.inbox);      
        });    
}); 
    },

    alertsMarkAsRead: function(request) {
    chrome.cookies.get({url: "http://dirty.ru/", name: 'uid'}, function(cookie) {   
    uid = cookie.value;
    chrome.cookies.get({url: "http://dirty.ru/", name: 'sid'}, function(cookie) {   
    sid = cookie.value;    
    alertsMarkRead(uid, sid, request.alert, request.alert_type);      
        });    
});         
    },

    getAlerts: function(request) {
    chrome.cookies.get({url: "http://dirty.ru/", name: 'uid'}, function(cookie) {   
    uid = cookie.value;
    chrome.cookies.get({url: "http://dirty.ru/", name: 'sid'}, function(cookie) {   
    sid = cookie.value;    
    getMyAlerts(uid, sid);      
        });    
});
    },

    initNotificationsInterval: function() {        
        var refreshInterval = parseInt(localStorage.getItem('refreshInterval'));

        if(refreshInterval === null) {
            refreshInterval = 60000;
        } else {
            refreshInterval = +refreshInterval;
        }

        if(updateNotificationsInterval) {
            clearInterval(updateNotificationsInterval);
        }
        updateNotificationsInterval = setInterval(actions.updateInboxComments, refreshInterval);
        updateNotificationsInterval = setInterval(actions.getAlerts, refreshInterval);
        updateNotificationsInterval = setInterval(actions.getUser, refreshInterval);
    }
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

function getInboxes(u_id, s_id){    
xhr.open('GET', "https://dirty.ru/api/inboxes/unread/", true);
xhr.setRequestHeader('X-Futuware-UID', u_id);
xhr.setRequestHeader('X-Futuware-SID', s_id);
xhr.onreadystatechange = processInboxes;
xhr.send();
}

function getUserData(u_id, s_id){
localStorage.setItem('upVotes', '0');
localStorage.setItem('downVotes', '0'); 
usr.open('GET', "https://dirty.ru/api/my/", true);
usr.setRequestHeader('X-Futuware-UID', u_id);
usr.setRequestHeader('X-Futuware-SID', s_id);
usr.onreadystatechange = function()
    {
        if (usr.readyState == 4 && usr.status == 200)
        {
            var response = JSON.parse(usr.responseText);            
            localStorage.setItem('login', response.login);
            countUserPosts(u_id, s_id)   
        }
    }; 
usr.send();
}

function countUserPosts(u_id, s_id){
    var href = "https://dirty.ru/api/users/" + localStorage.getItem('login') + "/posts/";
    usr.open('GET', href, true);
    //usr.setRequestHeader('X-Futuware-UID', u_id);
    //usr.setRequestHeader('X-Futuware-SID', s_id);            
    usr.onreadystatechange = function()
    {
        if (usr.readyState == 4 && usr.status == 200)
        {
            var response = JSON.parse(usr.responseText);                        
            localStorage.setItem('user_posts', response.item_count);
            countUserComments(u_id, s_id)
        } 
                    
    }; 
    usr.send();
}
function countUserComments(u_id, s_id){
    var href = "https://dirty.ru/api/users/" + localStorage.getItem('login') + "/comments/";
    usr.open('GET', href, true);
    //usr.setRequestHeader('X-Futuware-UID', u_id);
    //usr.setRequestHeader('X-Futuware-SID', s_id);
    usr.onreadystatechange = function()
    {
        if (usr.readyState == 4 && usr.status == 200)
        {
            var response = JSON.parse(usr.responseText);                                  
            localStorage.setItem('user_comments', response.item_count); 
            countUserKarma(u_id, s_id, 1)                              
        } 
        
    }; 
    usr.send();
}

function countUserKarma(u_id, s_id, i){       
    countVotes(u_id, s_id, i);    
}

function countVotes(u_id, s_id, i){    
    var href = "https://dirty.ru/api/users/" + localStorage.getItem('login') + "/votes/?page="+i;
    usr.open('GET', href, true);
    //usr.setRequestHeader('X-Futuware-UID', u_id);
    //usr.setRequestHeader('X-Futuware-SID', s_id);
    usr.onreadystatechange = function()
    {
        if (usr.readyState == 4 && usr.status == 200)
        {
            var response = JSON.parse(usr.responseText);
            if (response.downvotes === null && response.upvotes === null){
                var karma = parseInt(localStorage.getItem('upVotes')) + parseInt(localStorage.getItem('downVotes'));
                localStorage.setItem('karma', karma);
            } else {
            var downvotes = response.downvotes;
            var upvotes = response.upvotes;
            var upTotal = 0;
            var downTotal = 0;
            if (response.upvotes !== null){
            for(var i = 0, len = upvotes.length; i < len; i++) {
                upTotal += upvotes[i].vote;
            }
        }
            if (response.downvotes !== null){
            for(var i = 0, len = downvotes.length; i < len; i++) {
                downTotal += downvotes[i].vote;
            }
        }
            upTotal = upTotal + parseInt(localStorage.getItem('upVotes'));
            downTotal = downTotal + parseInt(localStorage.getItem('downVotes'));            
            localStorage.setItem('upVotes', upTotal);
            localStorage.setItem('downVotes', downTotal);
            var i = response.page + 1;
            countUserKarma(u_id, s_id, i)
             }                                               
          }
        }; 
        usr.send();
}

function markRead(u_id, s_id, i_id){ 
var count = parseInt(localStorage.getItem('inboxCommentsCount')) - parseInt(localStorage.getItem('inbox'+i_id));
localStorage.setItem('inboxCommentsCount', count);
localStorage.removeItem('inbox'+i_id);
localStorage.removeItem('comment'+i_id);
var inboxUrl = "https://dirty.ru/api/inbox/" + i_id + "/view/";    
req.open('POST', inboxUrl, true);
req.setRequestHeader('X-Futuware-UID', u_id);
req.setRequestHeader('X-Futuware-SID', s_id);
req.onreadystatechange = actions.updateInboxComments();
//req.onreadystatechange = getInboxes(u_id, s_id);
req.send();
}

function alertsMarkRead(u_id, s_id, url, type){
var alertUrl = url;
if (type != 'all'){
localStorage.removeItem('count_'+type);
localStorage.removeItem(type);
} else {
    for (var key in alertTypes) {        
                localStorage.removeItem('count_'+key);
                localStorage.removeItem(key);               
            };
}    
req.open('POST', alertUrl, true);
req.setRequestHeader('X-Futuware-UID', u_id);
req.setRequestHeader('X-Futuware-SID', s_id);
req.onreadystatechange = actions.getAlerts();
req.send();
}

function getMyAlerts(u_id, s_id){
var alertsUrl = "https://dirty.ru/api/my/notifications/unread/";
subs.open('GET', alertsUrl, true);
subs.setRequestHeader('X-Futuware-UID', u_id);
subs.setRequestHeader('X-Futuware-SID', s_id);
subs.onreadystatechange = processAlerts;
subs.send();
}

function processAlerts(e) {
    if (subs.readyState == 4) {
        var response = JSON.parse(subs.responseText);        
        if (response["item_count"] > 0){
        var alerts = response['notifications'];                      
        localStorage.setItem('totalAlertsCount', alerts.length);        
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
        var new_alert_count = 0;
        if(typeof alertsCount != "undefined" &&  Object.keys(alertsCount).length > 0) {            
            Object.keys(alertsCount).forEach(function(k) {                
                new_alert_count = alertsCount[k] - parseInt(localStorage.getItem('count_'+k));                               
                                    prepareList.push({
                                    title: alertTypes[k],
                                    message: alertsCount[k] + "/" + new_alert_count
                            });
                  
                 localStorage.setItem('count_'+k, alertsCount[k]);               
            });
        if(new_alert_count > 1 && localStorage.getItem('showDesktopNotifications') === "true") {               
            var desktopNotificationTemplate = {
                type: 'list',
                title: "Новые события, %username%!",
                message: "",
                iconUrl: 'images/128.png',
                items: prepareList
            }
            chrome.notifications.create('alerts', desktopNotificationTemplate);
        } else if (new_alert_count == 1 && localStorage.getItem('showDesktopNotifications') === "true") {
            var desktopNotificationTemplate = {
                type: 'basic',
                title: "Новые события, %username%!",
                message: prepareList[0].title + ": " + prepareList[0].message,
                iconUrl: 'images/128.png'
                
        }
        chrome.notifications.create('alerts', desktopNotificationTemplate);
    }
                
            
                     
        }
        }
        else if (response["item_count"] == 0){
        localStorage.setItem('totalAlertsCount', '0');
    }
    drawBadge();
        
    }
}
//количество событий по типу
function filterAlerts(alerts, type){
    var result = alerts.filter(function( obj ) {
        return obj.type == type;
        });
    localStorage.setItem(type, JSON.stringify(result));    
    if (localStorage.getItem('count_'+type) == null || result.length == 0){
            localStorage.setItem('count_'+type, '0');            
        }
    return result.length;       
}

function processInboxes(e) {
    if (xhr.readyState == 4) {
    	var response = JSON.parse(xhr.responseText);
        if(response.item_count == 0) {
        localStorage.setItem('inboxcomments', '[]');
    } else if(response.item_count > 0){    	
    	localStorage.setItem('inboxcomments', JSON.stringify(response.inboxes));
    	localStorage.setItem('lastUpdate', moment().format('X'));
    	var inboxes = response['inboxes'];

       //удаляем пустые
         if (inboxes.length == 0){
                 Object.keys(localStorage).forEach(function(key){
                      if (key.substring(0,5) == 'inbox') {                       
                 localStorage.removeItem(key); 
             }
             if (key.substring(0,7) == 'comment') {                       
                 localStorage.removeItem(key); 
             }
        });
            };
       //считаем количество новых с последнего обновления и показываем

	    if(typeof inboxes != "undefined" &&  inboxes.length > 0) {
	    	var iCount = inboxes.length;            
	    	var mCount = 0;	    	   	
	    	for (var i in inboxes) {	
            localStorage.setItem('comment'+inboxes[i].id, JSON.stringify(inboxes[i]));      
	      var inboxName = inboxes[i].data.text.replace(/<\/?[^>]+(>|$)/g, "");	      
	      if (localStorage.getItem('inbox'+inboxes[i].id) == null){
	      	localStorage.setItem('inbox'+inboxes[i].id, inboxes[i].unread_comments_count);
			new_comment_count = inboxes[i].unread_comments_count;
	      }
	      else {
	       new_comment_count = inboxes[i].unread_comments_count - parseInt(localStorage.getItem('inbox'+inboxes[i].id));
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
}

function drawBadge(){
    if (parseInt(localStorage.getItem('totalAlertsCount')) > 0 || parseInt(localStorage.getItem('inboxCommentsCount'))>0){
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
actions.getUser();

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