var currentSettings = {
	"valid":false
};

var currentData = {};
var currentDataChanged = 0;

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
//_("#commit").on("click", function () {});
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
_("#stop").on("click", function () {
	if (_(this).hasClass("disabled"))
		return;
		
	_.xhr("post", "stop", function (data) {
		try {
			var obj = JSON.parse(data);
			if (obj.success === false) {
				alert("Error: " + obj.error);
			}
		} catch (ex) {
			alert("Error: improper data from raspberry pi");
		}
		
	});	
});

_("#debon").on("click", function () {
	if (_(this).hasClass("disabled"))
		return;
		
	_.xhr("post", "debug", function (data) {
		try {
			var obj = JSON.parse(data);
			if (obj.success === false) {
				alert("Error: " + obj.error);
			}
		} catch (ex) {
			alert("Error: improper data from raspberry pi");
		}
		
	}, "relayon");	
});
_("#deboff").on("click", function () {
	if (_(this).hasClass("disabled"))
		return;
		
	_.xhr("post", "debug", function (data) {
		try {
			var obj = JSON.parse(data);
			if (obj.success === false) {
				alert("Error: " + obj.error);
			}
		} catch (ex) {
			alert("Error: improper data from raspberry pi");
		}
		
	}, "relayoff");	
});

_("#pause").on("click", function () {
	if (_(this).hasClass("disabled"))
		return;
		
	_.xhr("post", "pause", function (data) {
		try {
			var obj = JSON.parse(data);
			if (obj.success === false) {
				alert("Error: " + obj.error);
			}
		} catch (ex) {
			alert("Error: improper data from raspberry pi");
		}
		
	});	
});
_("#unpause").on("click", function () {
	if (_(this).hasClass("disabled"))
		return;
	_.xhr("post", "unpause", function (data) {
		try {
			var obj = JSON.parse(data);
			if (obj.success === false) {
				alert("Error: " + obj.error);
			}
		} catch (ex) {
			alert("Error: improper data from raspberry pi");
		}
		
	});	
});
_("#more").on("click", function () {
	_("#options").toggleClass("open");
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
}, 300);

var c_prog = _("#c_prog");
var t_prog = _("#t_prog");
var t_prec = _("#t_prec");
var t_frac_top = _("#t_frac_top");
var t_frac_bot = _("#t_frac_bot");
var stop_btn = _("#stop");
var eta_el = _("#eta");
var previous_run = false;
var rest_frame_count = 0;

function updateBars ()
{
	if (currentDataChanged != 0) {
		if (currentData.running === false && previous_run === true) {
			previous_run = false;
			c_prog.css("width", "0%");
			t_prog.css("width", "0%");
			t_prec.html("---");
			t_frac_top.html("--");
			t_frac_bot.html("--");
			stop_btn.addClass("disabled");
			eta_el.html("");
		} else if (currentData.running === true) {
			if (previous_run === false)
				stop_btn.dropClass("disabled");
			let c_width = 0;
			if (currentData.state === true) {
				c_width = (((currentData.current_time + ((Date.now() - currentDataChanged) / 1000)) / currentData.on_time) * 100);
			} else {
				c_width = 100 - (((currentData.current_time + ((Date.now() - currentDataChanged) / 1000)) / currentData.off_time) * 100);
			}

			let t_width = ((currentData.cycle_count / currentData.total_cycles) * 100);
				
			c_prog.css("width", c_width.toString() + "%");
			t_prog.css("width", t_width.toString() + "%");
			previous_run = true;
		}
	}
	
	window.requestAnimationFrame(updateText);
}
function updateText ()
{
	if (currentDataChanged != 0) {
		if (currentData.running === false && previous_run === true) {
			previous_run = false;
			c_prog.css("width", "0%");
			t_prog.css("width", "0%");
			t_prec.html("---");
			t_frac_top.html("--");
			t_frac_bot.html("--");
			stop_btn.addClass("disabled");
			eta_el.html("");
		} else if (currentData.running === true) {
			if (previous_run === false)
				stop_btn.dropClass("disabled");
			let t_precent = Math.round((currentData.cycle_count / currentData.total_cycles) * 100);
				
			t_prec.html(t_precent.toString() + "%");
			t_frac_top.html(currentData.cycle_count.toString());
			t_frac_bot.html(currentData.total_cycles.toString());
			previous_run = true;
		}
	}
	
	window.requestAnimationFrame(restFrame);
}

function updateETA() {
	if (currentDataChanged != 0 && currentData.running === true) {
		let d = new Date(Date.now() + ((currentData.total_cycles - currentData.cycle_count) * (currentData.on_time + currentData.off_time + 0.01) * 1000) - (currentData.current_time * 1000));
		eta_el.html(d.toDateString() + "<br/>" + d.toLocaleTimeString());
	}
	
	window.requestAnimationFrame(updateBars);
}

function restFrame() {
	++rest_frame_count;
	if (rest_frame_count > 3) {
		rest_frame_count = 0;
		window.requestAnimationFrame(updateETA);
	} else {
		window.requestAnimationFrame(restFrame);
	}
}

window.requestAnimationFrame(restFrame);
