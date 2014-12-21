$(document).ready(function () {
  var authRef = new Firebase('https://yourfirebase.firebaseio.com/auth/');
  $("#startbutton").hover(function () {
    $("#startbutton").toggleClass("buttonhover", 100);
    $("#startbutton").css('cursor', 'pointer');
  });
  $("#startbutton").click(function () {
    authRef.authAnonymously(function (error, authData) {
      yourUid = authData.token;

      function disconnect() {
        userRef.set({
          uid: yourUid,
          chattingWith: null,
          status: 'dc'
        });
        $('#DCbtn').css({
          backgroundColor: '#412356'
        });
        $('#DCbtn').addClass('newChat');
        $('#DCbtn').removeClass('nextDisconnect');
        $('#DCbtn').html("<img src='static/img/newchat.png' id='dc' draggable='false' height=70;>").fadeIn(100);
        $('input').prop("disabled", true)
      };

      function poll() {
        $('input').prop("disabled", true);
        userRef.set({
          uid: yourUid,
          status: 'polling'
        });
        userRef.parent().orderByChild("status").on("child_changed", function (snapshot) {
          if (snapshot.val().status === "polling" && snapshot.val().uid !== yourUid && yourStatus === "polling") {
            partner = snapshot.val();
            userRef.set({
              uid: yourUid,
              status: 'chatting',
              chattingWith: partner.uid
            });
            $('#looking').replaceWith("<li>You're now chatting with a stranger!</li>");
            $('input').prop("disabled", false);
            document.title = "*** NEW PARTNER ***";
            setTimeout(function () {
              document.title = "Gammada";
            }, 5000);
          } else if (snapshot.val().chattingWith === yourUid && yourStatus === "polling") {
            partner = snapshot.val();
            userRef.set({
              uid: yourUid,
              status: 'chatting',
              chattingWith: partner.uid
            });
            $('#looking').replaceWith("<li>You're now chatting with a stranger!</li>");
            $('input').prop("disabled", false);
            document.title = "*** NEW PARTNER ***";
            setTimeout(function () {
              document.title = "Gammada";
            }, 5000);
          };
        });
      };
      userRef = new Firebase('https://yourfirebase.firebaseio.com/users/' + authData.uid);
      amOnline = new Firebase('https://yourfirebase.firebaseio.com/.info/connected');
      mesgRef = new Firebase('https://yourfirebase.firebaseio.com/mesg/');
      if (!error) {
        console.log("Authenticated successfully with payload:", authData);
      };
      var initialChat = "<div id='chatwindow'><div id='messagelist'><li id='looking'>Looking for a partner...</li></div><div id='inputbar'><div id='DCbtn'><img src='static/img/dc.png' id='dc' draggable='false' height=70;></div><input disabled='true'></div></div>";
      $("#landing").fadeOut(100);
      $(initialChat).hide().appendTo("body").fadeIn(150);
      amOnline.on('value', function (snapshot) {
        if (snapshot.val()) {
          userRef.set({
            uid: yourUid
          });
          userRef.onDisconnect().set({
            uid: yourUid,
            status: 'dc',
          });
        };
      });
<<<<<<< HEAD
      userRef.on('value', function (snap) {
        yourStatus = snap.val().status;
        yourPartner = snap.val().chattingWith;
=======
      userRef.parent().orderByChild("status").on("child_added", function poller(snapshot) {
        if (snapshot.val().status === "polling" && snapshot.val().uid !== authData.token) {
          partner = snapshot.val();
          data = {
            uid: authData.token,
            pid: partner.uid
          };
          userRef.set({
            uid: authData.token,
            status: 'chatting',
            chattingWith: partner.uid
          });
          $('#looking').replaceWith('<li>You\'re now chatting with a stranger!');
          $('input').prop("disabled", false)
          userRef.off();
        };
        if (snapshot.val().chattingWith === authData.token) {
          partner = snapshot.val();
          data = {
            uid: authData.token,
            pid: partner.uid
          };
          userRef.set({
            uid: authData.token,
            status: 'chatting',
            chattingWith: partner.uid
          });
          $('#looking').replaceWith('<li>You\'re now chatting with a stranger!');
          $('input').prop("disabled", false)
          userRef.off();
        };
>>>>>>> origin/master
      });
      userRef.set({
        uid: yourUid,
        status: "polling"
      });
      poll();
      $("#DCbtn").click(function () {
        var $this = $(this);
        if ($this.hasClass("nextDisconnect")) {
          $('#messagelist').append('<li id="udc">You have disconnected.</li>');
          disconnect();
        } else if ($this.hasClass("newChat")) {
          $('#messagelist').html("<li id='looking'>Looking for a partner...</li>");
          $(this).removeClass("newChat");
          $(this).html("<img src='static/img/dc.png' id='dc' draggable='false' height=70;>").fadeIn(100);
          poll();
        } else {
          $(this).css({
            backgroundColor: '#6E0A1E'
          });
          $(this).addClass('nextDisconnect');
        };
      });
      $('input').keypress(function (e) {
        if (e.keyCode === 13) {
          $('nextDisconnect').removeClass("nextDisconnect");
          $('nextDisconnect').html("<img src='static/img/dc.png' id='dc' draggable='false' height=70;>").fadeIn(100);
          $input = $('input').val().replace(/\s+/g, ' ');
          if ($input != '' && $input != ' ') {
            var message = $('input').val();
            mesgRef.push({
              uid: yourUid,
              text: message,
              pid: partner.uid
            });
            $('input').val('');
          };
        };
      });
      mesgRef.on('child_added', function (snapshot) {
        var data = snapshot.val();
        var message = data.text;
        var uid = data.uid;
        var pid = data.pid;
        if (yourUid === uid) {
          var messageElement = $("<li class='you'>");
          var nameElement = $("<strong class='you'>You: </strong>");
          messageElement.text(message).prepend(nameElement);
          $('#messagelist').append(messageElement)
          $('#messagelist')[0].scrollTop = $('#messagelist')[0].scrollHeight;
        } else if (yourUid === pid) {
          document.title = "*** NEW MESSAGE ***";
          setTimeout(function () {
            document.title = "Gammada";
          }, 5000);
          var messageElement = $("<li class='stranger'>");
          var nameElement = $("<strong class='stranger'>Stranger: </strong>")
          messageElement.text(message).prepend(nameElement);
          $('#messagelist').append(messageElement)
          $('#messagelist')[0].scrollTop = $('#messagelist')[0].scrollHeight;
        };
      });
      userRef.parent().orderByChild("status").on("child_changed", function (snapshot) {
        if (snapshot.val().uid === yourPartner && snapshot.val().status !== "chatting") {
          disconnect();
          if (!$('#udc').length) {
            var messageElement = "<li id='udc'>Stranger has disconnected.</li>";
            $('#messagelist').append(messageElement)
            $('#messagelist')[0].scrollTop = $('#messagelist')[0].scrollHeight;
          };
        };
      });
    }, {
      remember: "sessionOnly"
    });
  });
});
