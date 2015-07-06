var uiWagerDialog;

$(document).ready(function() {
	uiWagerDialog = $("#wagerAPDialog");
});

function openWagerDialog(sWho, sPosition, maxWager, callback) {
	$(uiWagerDialog).find("#whoWagers").text(sPosition + " " + sWho);
	$(uiWagerDialog).find("input").val(0);
	$(uiWagerDialog).find("#maxAP").text(maxWager);

	var submitLink = $(uiWagerDialog).find("a");
	$(submitLink).unbind();
	$(submitLink).click(function(event) {
		if ($(uiWagerDialog).find("input").val() > maxWager) {
			return false;
		}

		$(uiWagerDialog).hide();

		var amount = $(uiWagerDialog).find("[name='wagerAmount']").val();
		callback(amount);
	});

	$(uiWagerDialog).show();
}