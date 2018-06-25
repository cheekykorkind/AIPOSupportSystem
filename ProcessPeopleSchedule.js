function ProcessPeopleSchedule(str) {
  var userList = new Array();
  var result = '';
  var TRList = new Array();
  var TdList = new Array();
  var DivList = new Array();
  var _str = str.toString();

  _str = _str.replace(/(\s*)/g, "");
  _str = preProcessHTML(_str, '全員');

  _str = _str.pop().split('class="calendar"')[1];

  _str = _str.split('<tbody>')[1];
  _str = _str.split('</tbody>')[0];

  TRList = _str.split('<tr>');
  userList = createUserList(TRList);
  TdList = createTdList(TRList);

  userList = userbindTds(userList, TdList);
  userList = sortDaySchedules(userList);
  userList = sortLongTermSchedules(userList);

  return userList;
}

function preProcessHTML(str, selectboxOption) {
  var result = new Array();
  var _str = str.split('<divclass="auiPortletTitle">');
  _str.shift();

  _str = _str.filter(function (element) {
    return />スケジュール<\/a>/.test(element);
  });
  if (!_str.length) {
    alert('「スケジュール」を生成してください。');
    return;
  }

  _str.forEach(function (item, index, array) {
    var activeStr = item.split('<liclass="active">')[1];
    if ('週' == activeStr.split('<span>')[1].split('</span>')[0]) {
      result.push(item);
    };
  });
  if (!result.length) {
    alert('「スケジュール」で「週」で選んでください。');
    return;
  }

  result = result.filter(function (element) {
    return (new RegExp('selected="selected">' + selectboxOption + '<\/option>')).test(element);
  });
  if (!result.length) {
    alert('「スケジュール」の「週」で「' + selectboxOption + '」を選んでください。');
    return;
  }

  return result;
}


function sortDaySchedules(userList) {
  userList.forEach(function (item, index, array) {
    var days = item.getDaySchedules();
    if (days.length === 0) { return; }
    var splitedDays = new Array();

    days.forEach(function (item1, index1, array1) {
      var yyyymmdd = item1.split('form_start=')[1].split('-00-00')[0];
      var splitedEvents = item1.split('<spanclass="time">');
      splitedEvents.shift();
      splitedEvents.forEach(function (item2, index2, array2) {
        var hhmmhhmm = setZerohhmmhhmm(item2.split('</span>')[0]);
        var title = item2.split('<spanclass="title">')[1].split('</span>')[0].replace(/<wbr>/g, "");

        splitedDays.push([title, yyyymmdd + ' ' + hhmmhhmm]);
      });

    });
    item.daySchedules = splitedDays;
  });
  return userList;
}

function sortLongTermSchedules(userList) {
  var longTerms = new Array();
  userList.forEach(function (item, index, array) {
    var oneLongTerm = item.getLongTermSchedules();
    if (oneLongTerm == undefined) { return; }
    oneLongTerm.forEach(function (item1, index1, array1) {
      if (/title="非公開"/.test(item1)) {
        longTerms.push(['非公開', undefined]);
        return;
      }
      var volumn = item1.split('colspan="')[1].split('"class')[0];
      var yyyymmdd = item1.split('view_date=')[1].split('-00-00')[0];
      var title = item1.split('onLoadScheduleDetail);">')[1].split('</a>')[0].replace(/<wbr>/g, "");
      var endDd = parseInt(yyyymmdd.substring(yyyymmdd.length - 2, yyyymmdd.length)) + parseInt(volumn) - 1;
      var endYyyymmdd = yyyymmdd.substring(0, yyyymmdd.length - 2) + addZero(endDd);
      longTerms.push([title, yyyymmdd + ' ' + endYyyymmdd]);
    });
    item.longTermSchedules = longTerms;
    longTerms = new Array();
  });
  return userList;
}

function userbindTds(userList, TdList) {
  var secretList = new Array();
  var stopTdList = false;

  userList.forEach(function (item, index, array) {
    var status = 'S0';
    stopTdList = false;

    TdList.forEach(function (item1, index1, array1) {
      if (stopTdList) { return; }
      if (item1.length === 0) { return; }

      var isMyTd = item1.filter(userIdFilter(item.getId())).length;
      var isSecret = item1.filter(secretFilter).length;

      var longTerm = item1.filter(colspanFilter);
      var daily = item1.filter(topNoneFilter);

      if (status === 'S0' && longTerm.length === 0 && daily.length !== 0 && isMyTd) {
        // 週スケジュールなし、日スケジュールがある場合の始まり。
        item.setDaySchedules(item1);
        stopTdList = true;
      } else if (status === 'S0' && longTerm.length !== 0 && daily.length === 0 && isMyTd) {
        // 週スケジュールがある始まり. もしこの前非公開スケジュールがあったら追加してsecretListを初期化する。
        if (secretList.length) {
          item.setLongTermSchedules(secretList);
          secretList = new Array();
        }
        item.setLongTermSchedules(item1);
        status = 'A1';
      } else if (status === 'S0' && longTerm.length !== 0 && daily.length === 0 && isSecret === item1.length) {
        // td全体がsecret。一時的にsecretListへ保存してtd行をでる。
        secretList.push(item1);
        return;
      } else if (status === 'A1' && longTerm.length !== 0 && daily.length === 0 && isMyTd) {
        // 週スケジュールが複数行ある場合。
        item.setLongTermSchedules(item1);
      } else if (status === 'A1' && longTerm.length === 0 && daily.length !== 0 && isMyTd) {
        // 日スケジュールが複数行ある場合。
        item.setDaySchedules(item1);
      } else if (status === 'A1' && longTerm.length === 0 && daily.length !== 0) {
        // 新しいユーザーのスケジュールを発見。終了。
        stopTdList = true;
      }

    });
  });
  return userList;
}
function colspanFilter(element) {
  return /colspan=/.test(element);
}
function topNoneFilter(element) {
  return /class="topNone/.test(element);
}

function userIdFilter(userId) {
  return function (element) {
    var re = new RegExp('userid=' + userId);
    return re.test(element);
  }
}
function selectedSectionFilter(element) {
  return /selected="selected">全員/.test(element);
}

function createTdList(TRList) {
  var TdList = new Array();

  TRList.forEach(function (item, index, array) {
    var tempTdList = item.split('<td').filter(tdFilter);
    var nonSecretTds = tempTdList.filter(nonSecretFilter);
    var secretTds = tempTdList.filter(secretFilter);
    if (secretTds.length === 0) {
      TdList.push(nonSecretTds);
      return;
    }

    secretTds.forEach(function (item, index, array) {
      nonSecretTds.push(item);
    });

    // 重複を排除。非公開が複数行ある所に一緒にいれば同じ行が作られる。
    var i = 0;
    while (i < nonSecretTds.length) {
      for (i1 in nonSecretTds) {
        if (i1 == i) { continue; }
        if (nonSecretTds[i1] === nonSecretTds[i] && /title="非公開"/.test(nonSecretTds[i1])) {
          nonSecretTds.splice(i, 1);
          i = 0;
          break;
        }
      }
      i++;
    }

    TdList.push(nonSecretTds);
  });
  return TdList;
}
function tdFilter(element) {
  return /colspan=|class="topNone|<throwspan=/.test(element);
}
function nonSecretFilter(element) {
  return /widget_id="aipo_widget_ToolTip/.test(element);
}
function secretFilter(element) {
  return /title="非公開"/.test(element);
}

function createUserList(TRList) {
  var result = new Array();
  var THList = TRList.filter(userNameFilter);
  THList.forEach(function (item, index, array) {
    var userId = item.split('popupProfile(')[1].split(',arguments[0])">')[0];
    var userName = item.split(',arguments[0])">')[1].split('</a>')[0];
    result.push(new People(userId, userName));
  });
  return result;
}
function userNameFilter(element) {
  return /aipo.message.popupProfile/.test(element);
}


function setZerohhmmhhmm(hhmmhhmm) {
  var result = '';

  var lhs = hhmmhhmm.split('-')[0];
  var rhs = hhmmhhmm.split('-')[1];
  var lhsHour = '';
  var lhsMinute = '';
  var rhsHour = '';
  var rhsMinute = '';
  if (lhs == undefined) {
    rhsHour = rhs.split(':')[0];
    rhsMinute = rhs.split(':')[1];
    return addZero(rhsHour) + ':' + addZero(rhsMinute);
  } else if (rhs == undefined) {
    lhsHour = lhs.split(':')[0];
    lhsMinute = lhs.split(':')[1];
    return addZero(lhsHour) + ':' + addZero(lhsMinute);
  }
  rhsHour = rhs.split(':')[0];
  rhsMinute = rhs.split(':')[1];
  lhsHour = lhs.split(':')[0];
  lhsMinute = lhs.split(':')[1];
  return addZero(lhsHour) + ':' + addZero(lhsMinute) + '-' + addZero(rhsHour) + ':' + addZero(rhsMinute);
}

function addZero(timeStr) {
  var _timeStr = parseInt(timeStr);
  return _timeStr < 10 ? '0' + _timeStr : _timeStr;
}

var People = function (id, name, daySchedules, longTermSchedules, dayScheduleEventTimes) {
  this.id = id;
  this.name = name;
  this.daySchedules = daySchedules;
  this.longTermSchedules = longTermSchedules;

  this.setId = function (id) {
    this.id = id;
  }
  this.getId = function () {
    return this.id;
  }
  this.setName = function (name) {
    this.name = name;
  }
  this.getName = function () {
    return this.name;
  }

  this.setDaySchedules = function (daySchedules1) {
    if (this.daySchedules == undefined) {
      this.daySchedules = new Array();
    }
    if (daySchedules1.constructor.name == 'Array') {
      for (i in daySchedules1) {
        this.daySchedules.push(daySchedules1[i]);
      }
    } else {
      this.daySchedules.push(daySchedules1);
    }
  }
  this.getDaySchedules = function () {
    return this.daySchedules;
  }

  this.setLongTermSchedules = function (longTermSchedules1) {
    if (this.longTermSchedules == undefined) {
      this.longTermSchedules = new Array();
    }
    if (longTermSchedules1.constructor.name == 'Array') {
      for (i in longTermSchedules1) {
        this.longTermSchedules.push(longTermSchedules1[i]);
      }
    } else {
      this.longTermSchedules.push(longTermSchedules1);
    }
  }
  this.getLongTermSchedules = function () {
    return this.longTermSchedules;
  }
}
