$(document).ready(function(){
	$("#compareBtn").click(function(){
		if($("#compareBtn").text() === '人と会議室を直接比較'){
			$("#compareBtn").text('自動検索結果を見せる');
			$("#autoCompare").toggleClass('active show', false);
			$("#selfCompare").toggleClass('active show', true);
			
		}else if($("#compareBtn").text() == '自動検索結果を見せる'){
			$("#compareBtn").text('人と会議室を直接比較');
			$("#autoCompare").toggleClass('active show', true);
			$("#selfCompare").toggleClass('active show', false);
		}
    });
});