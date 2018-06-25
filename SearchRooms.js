function SearchRooms(peoples, rooms, todayStr, targetPeoples) {
	var result = new Array();
	var unsortedTodayRooms = new Array();

	var filteredPeopleName = deepCopy(peoples.filter(peopleFilter(targetPeoples)));
	var ConnectedDaySchduleTimes = createConnectedTimes(filteredPeopleName).filter(todayFilter(todayStr));

	// 選択した日付の人のスケジュールがそのまま入っている。表示用。
	filteredPeopleName.forEach(function (item, index, array) {
		filteredPeopleName[index].daySchedules = item.getDaySchedules().filter(todayRoomPplFilter(todayStr));
	});

	rooms.forEach(function (item, index, array) {
		var roomName = item.name;
		var roomsArray = createConnectedTimes(item).filter(todayFilter(todayStr));
		var redZone = createRedZone(concatArrays([ConnectedDaySchduleTimes, roomsArray]));
		var greanZone = createGreenZone(redZone, todayStr);

		unsortedTodayRooms.push(
			new Room(roomName, item.getEventTimes().filter(todayRoomPplFilter(todayStr)))
		);
		result.push([roomName, greanZone]);
	});
	result = [filteredPeopleName, unsortedTodayRooms, createTimeString(result)];
	return result;
}

function createConnectedTimes(objArray) {
	var result = new Array();
	if (!Array.isArray(objArray)) {
		objArray = [objArray];
	}
	objArray.forEach(function (item, index, array) {
		if (item.constructor.name == 'People') {
			item.getDaySchedules().forEach(function (item1, index1, array1) {
				result.push(item1[1]);
			});
		} else if (item.constructor.name == 'Room') {
			item.getEventTimes().forEach(function (item2, index2, array2) {
				result.push(item2[1]);
			});
		}
	});
	return result;
}

function createTimeString(resultTimes) {
	var strResult = new Array();
	resultTimes.forEach(function (item, index, array) {
		var roomName = item[0];
		strResult.push([roomName, new Array()]);

		item[1].forEach(function (item1, index2, array2) {
			var startYear = item1[0].getFullYear().toString();
			var startMonth = addZero(item1[0].getMonth() + 1);
			var startDay = addZero(item1[0].getDate());
			var startHour = addZero(item1[0].getHours());
			var startMinute = addZero(item1[0].getMinutes());

			var endYear = item1[1].getFullYear().toString();
			var endMonth = addZero(item1[1].getMonth() + 1);
			var endDay = addZero(item1[1].getDate());
			var endHour = addZero(item1[1].getHours());
			var endMinute = addZero(item1[1].getMinutes());

			var startTime =
				startYear.concat('-').concat(startMonth).concat('-').concat(startDay)
					.concat(' ').concat(startHour).concat(':').concat(startMinute);

			var endTime =
				endYear.concat('-').concat(endMonth).concat('-').concat(endDay)
					.concat(' ').concat(endHour).concat(':').concat(endMinute);

			strResult[index][1].push(startTime.concat(' ~ ').concat(endTime));
		});
	});
	return strResult;
}

function addZero(timeStr) {
	var _timeStr = parseInt(timeStr);
	return _timeStr < 10 ? '0' + _timeStr : _timeStr;
}

function todayFilter(param1) {
	return function (element) {
		var re = new RegExp(param1);
		return re.test(element);
	}
}
function todayRoomPplFilter(param1) {
	return function (element) {
		var re = new RegExp(param1);
		return re.test(element[1]);
	}
}

function peopleFilter(param1) {
	return function (element) {
		var ppls = convertPeopleNameForSystem(param1.replace(/(\s)/g, '|'));
		var re = new RegExp(ppls);
		return re.test(element.name);
	}
}

function createGreenZone(usedTimes, todayStr) {
	var result = new Array();
	var startPoint = null;
	var endPoint = null;
	var sortedTimes = new Array();
	var day = null;
	var greenZoneLoopCounter = 0;

	startPoint = new Date(todayStr);
	startPoint.setHours(0);
	startPoint.setMinutes(0);

	endPoint = new Date(todayStr);
	endPoint.setDate(endPoint.getDate() + 1);
	endPoint.setHours(0);
	endPoint.setMinutes(0);

	sortedTimes = concatArrays(usedTimes);
	sortedTimes.sort(function (a, b) { return a - b; });
	sortedTimes = createDateFormat(sortedTimes, todayStr);

	greenZoneLoopCounter = 2 + (sortedTimes.length - 2) / 2;
	var middleIndex = 1;
	for (var i = 0; i < greenZoneLoopCounter; i++) {
		if (i === 0) {
			if (startPoint == sortedTimes[i]) { continue; }
			result.push([startPoint, sortedTimes[i]]);
			continue;
		} else if (i === greenZoneLoopCounter - 1) {
			if (sortedTimes[sortedTimes.length - 1] == endPoint) { continue; }
			result.push([sortedTimes[sortedTimes.length - 1], endPoint]);
			continue;
		}

		if (isSameTime(sortedTimes[middleIndex], sortedTimes[middleIndex + 1])) {
			middleIndex += 2;
			continue;
		}
		result.push([sortedTimes[middleIndex], sortedTimes[middleIndex + 1]]);
		middleIndex += 2;
	}

	return result;
}
function isSameTime(time1, time2) {
	return time1.getFullYear() == time2.getFullYear() &&
		time1.getMonth() == time2.getMonth() &&
		time1.getDate() == time2.getDate() &&
		time1.getHours() == time2.getHours() &&
		time1.getMinutes() == time2.getMinutes();
}

function createDateFormat(intTimes, todayStr) {
	var result = new Array();
	var hour = 0;
	var minute = 0;
	intTimes.forEach(function (item, index, array) {
		if (item < 1000) {
			hour = item.toString().substr(0, 1);
			minute = item.toString().substr(1, 3);
		} else {
			hour = item.toString().substr(0, 2);
			minute = item.toString().substr(2, 4);
		}
		result.push(new Date(todayStr + ' ' + hour + ':' + minute));
	});
	return result;
}

function createRedZone(usedTimes) {
	var result = new Array();
	var unExcludeTimes = new Array();
	var deleteIndexs = new Array();

	usedTimes.forEach(function (item, index, array) {
		var tempDays = new Array();
		item = item.split(' ')[1];
		item = item.split('-');

		item.forEach(function (item1, index1, array1) {
			tempDays.push(parseInt(item1.replace(':', '')));
		});
		unExcludeTimes.push(tempDays);
	});

	var i = 0;
	while (i < unExcludeTimes.length) {
		var timeLhs = unExcludeTimes[i][0];
		var timeRhs = unExcludeTimes[i][1];

		for (i1 in unExcludeTimes) {
			var innerIndex = parseInt(i1);
			var innerLhs = unExcludeTimes[innerIndex][0];
			var innerRhs = unExcludeTimes[innerIndex][1];

			if (i == i1) { continue; }
			if (timeLhs === innerLhs
				&& timeRhs === innerRhs) {
				unExcludeTimes.splice(i, 1);
				i = 0;
				break;
				// 	"2018-05-29 13:00-15:00",
				// 	"2018-05-29 14:00-16:00",
			} else if (timeRhs >= innerLhs
				&& timeRhs < innerRhs
				&& timeLhs <= innerLhs) {
				unExcludeTimes[innerIndex][0] = timeLhs;
				unExcludeTimes.splice(i, 1);
				i = 0;
				break;
				// 	"2018-05-29 15:00-17:00",
				// 	"2018-05-29 14:00-16:00",
			} else if (timeLhs >= innerLhs
				&& timeLhs < innerRhs
				&& timeRhs >= innerRhs) {
				unExcludeTimes[innerIndex][1] = timeRhs;
				unExcludeTimes.splice(i, 1);
				i = 0;
				break;
				// 	"2018-05-29 15:00-17:00",
				// 	"2018-05-29 14:00-18:00",
			} else if (timeLhs > innerLhs
				&& timeRhs < innerRhs) {
				unExcludeTimes.splice(i, 1);
				i = 0;
				break;
				// 	"2018-05-29 13:00-19:00",
				// 	"2018-05-29 14:00-18:00",
			} else if (timeLhs < innerLhs
				&& timeRhs > innerRhs) {
				unExcludeTimes[innerIndex][0] = timeLhs;
				unExcludeTimes[innerIndex][1] = timeRhs;
				unExcludeTimes.splice(i, 1);
				i = 0;
				break;
			}
		}
		i++;
	}

	return unExcludeTimes;
}

function concatArrays(arr) {
	var result = new Array();

	if (typeof arr != 'object') {
		return arr;
	}
	for (i in arr) {
		if (typeof arr[i] == 'object') {
			result = result.concat(concatArrays(arr[i]));
		} else {
			result.push(arr[i]);
		}
	}
	return result;
}

/*
	ジホ　じほ　チェ　ちぇ -> 崔志豪
	イ　ドヒョン -> イドヒョン
	鄭　載潤　ジョン　ゼユン -> 鄭載潤
	洲昇　ジュスン　イジュスン -> 李洲昇
	なかむー　ナカムー　ムー　むー　なかむ　ナカム -> 中村友紀
	ゆっきー　ユッキー -> 中村ゆき
*/
function convertPeopleNameForSystem(targetPeoples) {
	var result = '';
	var splitedPeoples = targetPeoples.split('|');
	splitedPeoples.forEach(function (item, index, array) {
		if (item == 'ジホ' || item == 'じほ' || item == 'チェ' || item == 'ちぇ') {
			splitedPeoples[index] = '崔志豪';
		} else if (item == 'イ' || item == 'ドヒョン') {
			splitedPeoples[index] = 'イドヒョン';
		} else if (item == '鄭' || item == '載潤' || item == 'ジョン' || item == 'ゼユン') {
			splitedPeoples[index] = '鄭載潤';
		} else if (item == '洲昇' || item == 'ジュスン' || item == 'イジュスン') {
			splitedPeoples[index] = '李洲昇';
		} else if (item == 'なかむー' || item == 'ナカムー' || item == 'ムー' || item == 'むー' || item == 'なかむ' || item == 'ナカム') {
			splitedPeoples[index] = '中村友紀';
		} else if (item == 'ゆっきー' || item == 'ユッキー') {
			splitedPeoples[index] = '中村ゆき';
		}
		
		if (index + 1 !== splitedPeoples.length) {
			splitedPeoples[index] += '|';
			result += splitedPeoples[index];
		} else {
			result += (splitedPeoples[index]);
		}
	});

	return result;
}

function deepCopy(arr) {
	var out = [];
	for (var i = 0, len = arr.length; i < len; i++) {
		var item = arr[i];
		if (item.constructor.name == 'People') {
			var obj = new People();
		} else if (item.constructor.name == 'Room') {
			var obj = new Room();
		}

		for (var k in item) {
			obj[k] = item[k];
		}
		out.push(obj);
	}
	return out;
}
