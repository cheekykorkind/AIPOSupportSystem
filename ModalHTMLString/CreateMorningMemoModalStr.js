function CreateMorningMemoModalStr(result) {
  var timeStrResult =
    `<html lang="ja" class="h-100">
  
    <head>
      <meta charset="utf-8" />
      <script src="./js/jquery-3.2.1.min.js"></script>
      <script src="./js/bootstrap.js"></script>
      <link rel="stylesheet" href="./css/bootstrap.css">
      <script src="./ModalHTMLString/page2.js" charset='utf-8'></script>
    </head>
    
    <body class="h-100">
      <button type="button" id="compareBtn" class="btn btn-lg btn-block btn-outline-dark">朝ミーティングメモをコピー</button>
      <div class="tab-content row justify-content-center">
      <textarea id="morningMemoResult" class="col h-100">${result}</textarea>`;

  timeStrResult += `</div></body></html>`;
  return timeStrResult;
}