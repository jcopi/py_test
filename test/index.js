var currentSettings = {
	"valid":false
};

var currentData = {};

_(".card .size_change").on("click", function () {
	_(".card").toggleClass("collapsed").each(function (el) {
		el.child(".size_change").html(el.hasClass("collapsed") ? "keyboard_arrow_down" : "keyboard_arrow_up");
	});
});

function drawGraph(uptime, downtime) {
	_(".graph_hh, .graph_hl, .graph_v").css("display","inline-block");
	_(".graph_hh").css("width", ((uptime / (uptime + downtime)) * 100).toString() + "%");
	_(".graph_v").get(1).css("left",((uptime / (uptime + downtime)) * 100).toString() + "%");
	_(".graph_hl").css({
		"left":((uptime / (uptime + downtime)) * 100).toString() + "%",
		"width":((downtime / (uptime + downtime)) * 100).toString() + "%"
	});
}
function clearGraph() {
	_(".graph_hh, .graph_hl, .graph_v").css("display","none");
}

function settingChanged() {
	_("#start").addClass("disabled");
	clearGraph();
	var on_time = parseFloat(_("#on_time").value());
	var off_time = parseFloat(_("#off_time").value());
	var total_cycles = parseFloat(_("#total_cycles").value());
	var valid = true;
	if (!Number.isNaN(on_time)) {
		currentSettings["on_time"] = on_time;
	} else {
		valid = false;
	}
	
	if (!Number.isNaN(off_time)) {
		currentSettings["off_time"] = off_time;
	} else {
		valid = false;
	}
	
	if (valid === true) {
		drawGraph(on_time, off_time);
	}
	
	if (!Number.isNaN(total_cycles)) {
		currentSettings["total_cycles"] = total_cycles;
	} else {
		valid = false;
	}
	currentSettings.valid = valid;
	if (valid === true) {
		_("#start").dropClass("disabled");
	}

}
_("#settings input").on({
	"change": settingChanged,
	"blur": settingChanged
});

_("#def55").on("click", function () {
	var el = _("#on_time").value("5").raw(0);
	el.focus();
	el.blur();
	var el = _("#off_time").value("5").raw(0);
	el.focus();
	el.blur();
});
_("#def19").on("click", function () {
	var el = _("#on_time").value("1").raw(0);
	el.focus();
	el.blur();
	var el = _("#off_time").value("9").raw(0);
	el.focus();
	el.blur();
});
_("#commit").on("click", function () {});
_("#start").on("click", function () {
	if (_(this).hasClass("disabled"))
		return;
		
	if (currentSettings.valid) {
		_.xhr("post", "setinfo", function (data) {
			try {
				var obj = JSON.parse(data);
				if (obj.success === false) {
					alert("Error: " + obj.error);
				} else {
					_.xhr("post", "start", handleStartResult);
				}
			} catch (ex) {
				alert("Error: improper data from raspberry pi");
			}
			
		}, JSON.stringify(currentSettings));	
	}
});

function handleStartResult(result) {
	try {
		var obj = JSON.parse(result);
		if (obj.success === false) {
			alert("Error: " + obj.error);
		} else {
			_("#status").dropClass("collapsed");
			_("#settings").addClass("collapsed");
		}
	} catch (ex) {
		alert("Error: improper data from raspberry pi");
	}
}

window.setInterval(function () {
	_.xhr("post", "getinfo", function (info) {
		try {
			var obj = JSON.parse(info);
			currentData = obj;
			currentDataChanged = Date.now();
		} catch (ex) {
			console.log("Malformed Data", info);
		}
	});
}, 250);

window.setTimeout(function () {
	window.setInterval(function () {
		if (currentData.running === true) {
			_("#stop, #pause, #unpause").dropClass("disabled");
			if (currentData.state === true) {
				_("#c_prog").css("width",(((currentData.current_time + ((Date.now() - currentDataChanged) / 1000)) / currentData.on_time) * 100) + "%");
			} else {
				_("#c_prog").css("width",(100-(((currentData.current_time + ((Date.now() - currentDataChanged) / 1000)) / currentData.off_time) * 100)) + "%");
			}
			
			_("#t_prec").html(Math.round((currentData.cycle_count / currentData.total_cycles) * 100).toString() + "%");
			_("#t_frac").html(currentData.cycle_count.toString() + " / " + currentData.total_cycles.toString());
		} else {
			_("#stop, #pause, #unpause").addClass("disabled");
			_("#c_prog").css("width","0%");
			_("#t_prec").html("---");
			_("#t_frac").html("-- / --");
		}
		
		_("#t_prog").css("width",((currentData.cycle_count / currentData.total_cycles) * 100) + "%");

	}, 50);
}, 500);
