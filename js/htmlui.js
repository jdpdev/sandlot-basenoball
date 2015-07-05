var uiWagerDialog;

$(document).ready(function() {
	uiWagerDialog = $("#wagerAPDialog");
});

function openWagerDialog(sWho, sPosition, maxWager, callback) {
	var submitLink = $(uiWagerDialog).find("a");
	$(submitLink).unbind();
	$(submitLink).click(function(event) {
		var amount = $(uiWagerDialog).find("[name='wagerAmount']").val();
		callback(amount);
		$(uiWagerDialog).hide();
	});

	$(uiWagerDialog).show();
}