var Room = function(name, eventTimes){
    this.name = name;
    this.eventTimes = eventTimes;

    this.setName = function(name){
        this.name = name;
    }
    this.getName = function(){
        return this.name;
    }
    this.setEventTime = function(time){
        this.eventTimes.push(time);
    }
    this.getEventTime = function(index){
        return this.eventTimes[index];
    }
    this.getEventTimes = function(){
        return this.eventTimes;
    }
}

function ProcessRoomSchedule(str){
    var result = '';
    var TRlist = new Array();
    var str = str.toString();
    
    str = str.replace(/(\s*)/g, "");
    str = preProcessHTML(str, '設備一覧');
    str = str.pop().split('class="calendar"')[1];
    
    str = str.split('<tbody>')[1];
    str = str.split('</tbody>')[0];

    TRlist = str.split('</tr>');
    TRlist.pop(); //  마지막에 ""가 있어서 제거한다.
    
    var roomArray = createRoomsArray(TRlist);
    return roomArray;
}
function facilityFilter(element){
    return /facilityid=/.test(element);
}
function roomRowFilter(arrayElement){
    return /Mercury|Mars|Neptune|Jupiter|小山畳/.test(arrayElement);
}

function emptyDayFilter(arrayElement){
    return /widget_id/.test(arrayElement);
}

function strToDaysArray(str){
    var daysArray = str.split('<td');//  会議室一個の1週間を分ける。
    daysArray = daysArray.filter(emptyDayFilter);   //  会議がない日は消す。
    return daysArray;
}

function createRoomsArray(TRList){
    var roomArray = new Array();
    var roomName = ['Mercury', 'Mars', 'Neptune', 'Jupiter', '小山畳'];
    TRList = TRList.filter(roomRowFilter);
    for(i in TRList){
        roomArray.push(new Room(roomName[i], new Array()));
        TRList[i] = strToDaysArray(TRList[i]);
        for(i1 in TRList[i]){
            TRList[i][i1] = strToDayEvents(TRList[i][i1]);
            for(i2 in TRList[i][i1]){
                roomArray[i].setEventTime(extractTitleTime(TRList[i][i1][i2]));
            }
        }
    }
    return roomArray;
}

function emptyEventFilter(arrayElement){
    return /ahref=/.test(arrayElement);
}

function strToDayEvents(dayStr){
    var dayEvents = dayStr.split('<divclass="calendarScheduleDiv');
    dayEvents = dayEvents.filter(emptyEventFilter);
    return dayEvents;
}

function extractTitleTime(dayEventStr){
    var title = dayEventStr.split('<spanclass="title">')[1].split('</span>')[0].replace(/<wbr>/g, "");

    var dayTime = dayEventStr.split('view_date=')[1];
    dayTime = dayTime.split('-00-')[0];

    var hourMinute = dayEventStr.split('<spanclass="time">')[1];
    hourMinute = hourMinute.split('</span>')[0];
    return [title, dayTime + ' ' +hourMinute];
}