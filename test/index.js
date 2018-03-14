_(".card .size_change").on("click", function () {
	_(".card").toggleClass("collapsed").each(function (el) {
		el.child(".size_change").html(el.hasClass("collapsed") ? "keyboard_arrow_down" : "keyboard_arrow_up");
	});
});

_("#on_time, #off_time").on("change", function () {
	var uptime = _("#on_time").value();
	uptime = (uptime.length <= 0 ? 0 : parseFloat(uptime));
	uptime = (Number.isNaN(uptime) ? 0 : uptime);
	var downtime = _("#off_time").value();
	downtime = (downtime.length <= 0 ? 0 : parseFloat(downtime));
	downtime = (Number.isNaN(downtime) ? 0 : downtime);
	_(".graph_hh, .graph_hl, .graph_v").css("display","inline-block");
	_(".graph_hh").css("width", ((uptime / (uptime + downtime)) * 100).toString() + "%");
	_(".graph_v").get(1).css("left",((uptime / (uptime + downtime)) * 100).toString() + "%");
	_(".graph_hl").css({
		"left":((uptime / (uptime + downtime)) * 100).toString() + "%",
		"width":((downtime / (uptime + downtime)) * 100).toString() + "%"
	});
});
