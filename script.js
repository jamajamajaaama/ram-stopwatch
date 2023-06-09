class StopwatchRam {
    constructor(publishCallback) {
        this.publishCallback = publishCallback;
        this.reset();
    }

    start() {
        this.isRunning = true;
        this.history.push({
            start: performance.now(),
            duration: 0
        });
        requestAnimationFrame(this.step.bind(this));
    }

    step() {
        if (!this.isRunning) {
            return;
        }
        let launch = this.history[this.history.length - 1];
        launch.duration = performance.now() - launch.start;
        this.publishCallback(this.totalTimeRunning + launch.duration);
        requestAnimationFrame(this.step.bind(this));
    }

    stop() {
        this.isRunning = false;
        let launch = this.history[this.history.length - 1];
        launch.duration = performance.now() - launch.start;
        this.totalTimeRunning += launch.duration;
        this.publishCallback(this.totalTimeRunning);
    }

    reset() {
        this.isRunning = false;
        this.totalTimeRunning = 0;
        this.history = [];
        this.publishCallback(this.totalTimeRunning);
    }

    rollback() {
        if (this.isRunning || this.history.length === 0) {
            return;
        }
        let launch = this.history[this.history.length - 1];
        this.totalTimeRunning -= launch.duration;
        this.history.pop();
        this.publishCallback(this.totalTimeRunning);
    }

    length() {
        return this.history.length;
    }

    getLastLaunch() {
        return this.history[this.history.length - 1];
    }
}


function formatTime(time) {
    let minutes = Math.floor(time / 60000);
    let seconds = Math.floor((time - minutes * 60000) / 1000);
    let milliseconds = Math.floor(time) % 1000;

    let padNumber = (num, length=2, padValue="0") => {
        let str = "" + num;
        return padValue.repeat(length - str.length) + str;
    };

    return padNumber(minutes) + ":" + padNumber(seconds) + "." + padNumber(milliseconds, 3);
}


function publish(time) {
    $("#timer-screen").html(formatTime(time));
}


function main() {
    publish(0);
    let stopwatch = new StopwatchRam(publish);

    $("#button-start").on("click", function() {
        stopwatch.start();

        $(this).attr("disabled", true);
        $("#button-stop").attr("disabled", false);
        $("#button-rollback").attr("disabled", true);

        let tr = $("<tr></tr>");
        tr.html("<td>" + stopwatch.length() + "</td><td></td>");
        tr.addClass("active");
        $("#table-history_body").prepend(tr);
    });

    $("#button-stop").on("click", function() {
        stopwatch.stop();

        $(this).attr("disabled", true);
        $("#button-start").attr("disabled", false);
        $("#button-start").value("CONTINUE");
        $("#button-rollback").attr("disabled", false);

        let duration = stopwatch.getLastLaunch().duration;
        let tr = $("#table-history_body > tr:first-child");
        tr.removeClass("active");
        tr.children().last().html(formatTime(duration));
    });

    $("#button-rollback").on("click", function() {
        stopwatch.rollback();

        if (stopwatch.length() === 0) {
            $("#button-rollback").attr("disabled", true);
        }
        $("#table-history_body > tr:not(.danger)").first().addClass("danger strikethrough");
    });
}


main();
