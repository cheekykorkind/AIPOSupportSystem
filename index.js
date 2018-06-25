chrome.runtime.onMessage.addListener(function (request, sender) {
  if (request.action == "getSource") {
    /*
    Windowが二つある。一個はChromeが作ったpopupであり、一個は開かれているWindowである。
    globalPplNameが0である時は開かれているWindowだから終了させる。
    Chromeが作ったpopupではglobalPplNameに値がちゃんと入るからその時作業する。
    */
    if (globalPplName === 0 && globalTodayStr === 0) { return; }

    if (globalMorningMemoCondition) {
      var v21 = ProcessPeopleSchedule(request.source);
      var v22 = ProcessMorningMemo(v21);

      PopupCenterDual('', 'a1', 600, 600, CreateMorningMemoModalStr(v22));
      globalMorningMemoCondition = false;
      return;
    }

    if (typeof globalPplName == 'string' && globalPplName == '') {
      alert('名前を入力してください。');
      return;
    }
    if (typeof globalTodayStr == 'string' && globalTodayStr == '') {
      alert('日付を入力してください。');
      return;
    }

    var v2 = ProcessPeopleSchedule(request.source);
    var v3 = ProcessRoomSchedule(request.source);
    var v4 = SearchRooms(v2, v3, globalTodayStr, globalPplName);

    PopupCenterDual('', 'a1', 600, 600, CreateRoomModalStr(v4));
  }
});

window.onload = setParsing();
var globalPplName = 0;
var globalTodayStr = 0;
var globalMorningMemoCondition = false;

function setParsing() {
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('roomList').addEventListener('click', startSearchRooms);
    document.getElementById('morningMemo').addEventListener('click', startGetMorningMemo);
  });
}

function startSearchRooms() {
  globalPplName = document.getElementById("pplname").value;
  globalTodayStr = document.getElementById("todayStr").value;
  globalMorningMemoCondition = false;

  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function () {
    if (chrome.runtime.lastError) {
      console.log('There was an error injecting script : \n' + chrome.runtime.lastError.message);
    }
  });
}

function startGetMorningMemo() {
  globalPplName = document.getElementById("pplname").value;
  globalTodayStr = document.getElementById("todayStr").value;
  globalMorningMemoCondition = true;

  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function () {
    if (chrome.runtime.lastError) {
      console.log('There was an error injecting script : \n' + chrome.runtime.lastError.message);
    }
  });
}

function PopupCenterDual(url, title, w, h, result) {
  var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
  var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
  width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

  var left = ((width / 2) - (w / 2)) + dualScreenLeft;
  var top = 120;

  var newWindow = window.open(url, title,
    'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left +
    'titlebar=no');

  newWindow.document.open();
  newWindow.document.write(result);
  newWindow.document.close();

  if (window.focus) {
    newWindow.focus();
  }
}