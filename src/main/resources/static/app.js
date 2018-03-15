var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        } 

        x() {
            return this.x;
        }

        y() {
            return this.y;
        }
    }

    var stompClient = null;

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
        console.log(Point);
        sendPoint(Point);
    };

    var sendPoint = function (pt) {
        console.log(pt);
        stompClient.send("/topic/newpoint", {}, JSON.stringify({'x': parseInt($("#x").val()), 'y': parseInt($("#y").val())}));
        //stompClient.send("/topic/newpoint", {}, JSON.stringify({'x': pt.x,'y': pt.y}));
    };

    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                //alert(eventbody);
                console.log(eventbody);
                var point = JSON.parse(eventbody.body);
                console.log(point);
                var canvas = document.getElementById("canvas");
                var ctx = canvas.getContext("2d");
                ctx.beginPath();
                ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
                ctx.stroke();
                //var x = point.x;
                //var y = point.y;
            });
        });

    };



    return {

        init: function () {
            var can = document.getElementById("canvas");

            //websocket connection
            connectAndSubscribe();
        },

        publishPoint: function (px, py) {
            var pt = new Point(px, py);
            console.info("publishing point at " + pt);
            addPointToCanvas(pt);

            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();