function init() {
    $('#myElement').textfill({
        debug: true,
        maxFontPixels: 0,
        minFontPixels: 10
    });
    $('#myElement2').textfill({
        debug: true,
        maxFontPixels: 0,
        minFontPixels: 80
    });
}

$(init);

$(document).ready(function() {
            snowFall.snow($("img"), {
                minSize: 1,
                maxSize: 12,
                round: true,
                minSpeed: 4,
                maxSpeed: 12,
                flakeCount: 200
            });
        });