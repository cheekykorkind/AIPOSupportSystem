function ProcessMorningMemo(peopleList) {
    var result = '';
    result += setPresideOver();
    result += setLateAbsence(peopleList);
    result += createTodayAndWeekSchedule(peopleList);
    return result;
}

function setPresideOver(){
    var d = new Date();
    var dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    var result = '皆様\n\nおはようございます。ジホです。\n';

    result += '朝ミーティングメモ'+(d.getMonth()+1)+'/'+d.getDate()+'('+dayNames[d.getDay()]+')です。\n\n\n';
    result += '■ 司会\n';
    result += '今日の司会はTamelさんです。\n';
    result += '次回の司会はTamelさんです。\n';
    result += '\n\n';
    return result;
}

function setLateAbsence(peopleList) {
    var _peopleList = deepCopy(peopleList);
    var result = '■ 遅刻欠席\n';
    var latePattern = new RegExp('((0[1-8]:([0-5]?[0-9]))|(09:00))-(0[0-9]|[0-2]?[0-9]):([0-5]?[0-9]$)');

    var d = new Date();
    var currentMonth = d.getMonth() + 1;
    var currentDay = d.getDate();

    _peopleList.forEach(function (item, index, array) {
        var owner = item.name;
        _peopleList[index].daySchedules = item.getDaySchedules().filter(todayPplFilter(d));

        item.getDaySchedules().forEach(function (item1, index1, array1) {
            var hhmmhhmm = item1[1].split(' ')[1];
            if (latePattern.test(hhmmhhmm)) {
                result += owner + 'さん　' + hhmmhhmm + ' ' + item1[0] + '\n';
            }
        });

        var longterm = item.getLongTermSchedules();
        if (!longterm) { return; }

        longterm.forEach(function (item2, index2, array2) {
            if (/有休|有給/.test(item2[0])
                && currentMonth == item2[1].split(' ')[0].split('-')[1].split('-')[0]
                && currentDay == item2[1].split(' ')[0].split('-')[2]) {
                result += owner + 'さん　有休\n';
            }
        });
    });

    result += '\n\n';
    result += '■今日の一言\n\n\n';
    return result;
}

function todayPplFilter(param1) {
    return function (element) {
        var today = param1.getFullYear() + '-' + addZero(param1.getMonth() + 1) + '-' + addZero(param1.getDate());
        var re = new RegExp(today);
        return re.test(element[1]);
    }
}

function addZero(timeStr) {
    var _timeStr = parseInt(timeStr);
	return _timeStr < 10 ? '0'+_timeStr : _timeStr;
}

function createTodayAndWeekSchedule(peopleList) {
    var result = '';
    var _peopleList = deepCopy(peopleList);
    var d = new Date();
    var isMonday = d.getDay() === 1 ? true : false;

    result += isMonday ? '■ 今週のスケジュール\n' : '■ 今日のスケジュール\n';
    var CEOsName = _peopleList.filter(function (element) {
        return /納富貞嘉|浜崎陽一郎/.test(element.name);
    });

    CEOsName.forEach(function (item, index, array) {
        result += item.name + '\n';
        if(isMonday){
            result += mondayScheduleCreate(item.getDaySchedules());
            result += '\n';
            return;
        }

        CEOsName[index].daySchedules = item.getDaySchedules().filter(todayPplFilter(d));
        item.getDaySchedules().forEach(function (item1, index1, array1) {
            result += item1[1].split(' ')[1] + ' ' + item1[0] + '\n';
        });
        result += '\n';
    });

    result += '\n';
    result += '■連絡事項\n\n\n';
    result += '以上です。\n今日も一日よろしくお願いします。';
    return result;
}

// Sunday is 0, Monday is 1, and so on.
function mondayScheduleCreate(CEODaySchedules){
    var dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    var result = '';
    var currentDay = 1;

    result += '月\n';
    CEODaySchedules.forEach(function (item1, index1, array1) {
        if(currentDay != (new Date(item1[1].split(' ')[0])).getDay()){
            currentDay = (new Date(item1[1].split(' ')[0])).getDay();
            result +=  '\n' + dayNames[currentDay] + '\n';
        }

        result += item1[1].split(' ')[1] + ' ' + item1[0] + '\n';
    });
    return result;
}

function deepCopy (arr) {
    var out = [];
    for (var i = 0, len = arr.length; i < len; i++) {
        var item = arr[i];
        if(item.constructor.name == 'People'){
            var obj = new People();
        }else if(item.constructor.name == 'Room'){
            var obj = new Room();
        }
        
        for (var k in item) {
            obj[k] = item[k];
        }
        out.push(obj);
    }
    return out;
}
