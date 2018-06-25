function CreateRoomModalStr(result) {
    var timeStrResult =
      `<html lang="ja" class="h-100">
  
    <head>
      <meta charset="utf-8" />
      <script src="./js/jquery-3.2.1.min.js"></script>
      <script src="./js/bootstrap.js"></script>
      <link rel="stylesheet" href="./css/bootstrap.css">
      <script src="./ModalHTMLString/page1.js" charset='utf-8'></script>
    </head>
    
    <body class="h-100">
      <button type="button" id="compareBtn" class="btn btn-lg btn-block btn-outline-dark">人と会議室を直接比較</button>
      <div class="tab-content row justify-content-center text-center">`;
    var autoCompare = `<div class="tab-pane active col-md-auto" id="autoCompare"><ul class="list-unstyled">`;
    // result[2]は選択した日付と人で検索した空いている会議室の名前を時間がある配列である。
    result[2].forEach(function (item, index, array) {
      if (item[0] === 'Mercury') {
        autoCompare += `<li class="list-group-item list-group-item-secondary">`;
      } else if (item[0] === 'Mars') {
        autoCompare += `<li class="list-group-item list-group-item-danger">`;
      } else if (item[0] === 'Neptune') {
        autoCompare += `<li class="list-group-item list-group-item-primary">`;
      } else if (item[0] === 'Jupiter') {
        autoCompare += `<li class="list-group-item list-group-item-success">`;
      } else if (item[0] === '小山畳') {
        autoCompare += `<li class="list-group-item bg-light">`;
      }
      autoCompare += item[0];
  
      item[1].forEach(function (item1, index1, array1) {
        autoCompare += `<dl class="row m-0">`;
        autoCompare += `<dd class="col p-0">`;
        autoCompare += item1;
        autoCompare += `</dd>`;
        autoCompare += `</dl>`;
      });
      autoCompare += `</li>`;
    });
    autoCompare += `</ul></div>`;
    timeStrResult += autoCompare;
  
    var selfCompare = `<div class="tab-pane col" id="selfCompare">`;
    selfCompare += `<div class="row"><ul class="list-unstyled col-6">`;
  
    // result[0]は選択した人の名前とスケジュールが入っている。
    result[0].forEach(function (item2, index2, array2) {
      selfCompare += `<li class="list-group-item">`;
      selfCompare += item2.name;
      item2.daySchedules.forEach(function (item3, index3, array3) {
        selfCompare += `<dl class="row m-0">`;
        selfCompare += `<dd class="col-sm-6 p-0">`;
        selfCompare += item3[0];
        selfCompare += `</dd>`;
        selfCompare += `<dd class="col-sm-6 p-0">`;
        selfCompare += item3[1];
        selfCompare += `</dd>`;
        selfCompare += `</dl>`;
      });
      selfCompare += `</li>`;
    });
    selfCompare += `</ul>`;
  
    selfCompare += `<ul class="list-unstyled col-6">`;
    // result[1]は会議室の名前とスケジュールが入っている。
    result[1].forEach(function (item4, index4, array4) {
      if (item4.name === 'Mercury') {
        selfCompare += `<li class="list-group-item list-group-item-secondary">`;
      } else if (item4.name === 'Mars') {
        selfCompare += `<li class="list-group-item list-group-item-danger">`;
      } else if (item4.name === 'Neptune') {
        selfCompare += `<li class="list-group-item list-group-item-primary">`;
      } else if (item4.name === 'Jupiter') {
        selfCompare += `<li class="list-group-item list-group-item-success">`;
      } else if (item4.name === '小山畳') {
        selfCompare += `<li class="list-group-item bg-light">`;
      }
      selfCompare += item4.name;
      item4.eventTimes.forEach(function (item5, index5, array5) {
        selfCompare += `<dl class="row m-0">`;
        selfCompare += `<dd class="col-sm-6 p-0">`;
        selfCompare += item5[0];
        selfCompare += `</dd>`;
        selfCompare += `<dd class="col-sm-6 p-0">`;
        selfCompare += item5[1];
        selfCompare += `</dd>`;
        selfCompare += `</dl>`;
      });
  
      selfCompare += `</li>`;
    });
    selfCompare += `</ul></div>`;
    selfCompare += `</div>`;
  
    timeStrResult += selfCompare;
  
    timeStrResult += `</div></body></html>`;
    return timeStrResult;
  }