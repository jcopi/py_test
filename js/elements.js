_(".ul-input-wrapper").on("click", function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    if (!_(this).hasClass("focus")) {
        _(this).addClass("focus").child("input").raw(0).focus();
    }
});
_(".ul-input-wrapper input").on(
    "blur", function () {
        _(this.parentNode).dropClass("focus");
        if (this.value.replace(/\s*/g,"").length > 0) {
            _(this.parentNode).addClass("full");
        } else {
            _(this.parentNode).dropClass("full");
        }
    },
    "focus", function () {
        _(this.parentNode).addClass("focus");
    },
    "change", function () {
        if (this.value.replace(/\s*/g,"").length > 0) {
            _(this.parentNode).addClass("full");
        } else {
            _(this.parentNode).dropClass("full");
        }
    }
).each((el) => {
    // For the case when the browser autofills inputs
    el.raw(0).focus();
    el.raw(0).blur();
});