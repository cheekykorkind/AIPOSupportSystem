document.addEventListener('DOMContentLoaded', function () {
	document.getElementById('compareBtn').addEventListener('click', function () {
		var temp = document.getElementById('morningMemoResult');
		
		temp.selectionStart = 0;
		temp.selectionEnd = temp.value.length;

		temp.focus();
		var result = document.execCommand('copy');
		temp.blur();

		alert(result ? 'コピーしました。':'コピーエラー。');
		return result;
	});
});