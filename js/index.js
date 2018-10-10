(function($){

    //子元素滚动同时禁止父元素滚动
    $.fn.uniqueScroll = function () {
        //PC端兼容火狐获取滚轮事件
        $(this).on('mousewheel', _pc).on('DOMMouseScroll', _pc);

        function _pc(e) {
            var scrollTop = $(this)[0].scrollTop,
                scrollHeight = $(this)[0].scrollHeight,
                height = $(this)[0].clientHeight;
                
            var delta = (e.originalEvent.wheelDelta) ? e.originalEvent.wheelDelta : -(e.originalEvent.detail || 0);
            if ((delta > 0 && scrollTop <= delta) || (delta < 0 && scrollHeight - height - scrollTop <= -1 * delta)) {
                this.scrollTop = delta > 0 ? 0 : scrollHeight;
                e.stopPropagation();
                e.preventDefault();
            }
        }

        //移动端滚轮到底、到顶禁止父元素滚动条滚动
        $(this).on('touchstart', function (e) {
            var targetTouches = e.targetTouches ? e.targetTouches : e.originalEvent.targetTouches;
            $(this)[0].tmPoint = {
                x: targetTouches[0].pageX,
                y: targetTouches[0].pageY
            };
        });
        $(this).on('touchmove', _mobile);
        $(this).on('touchend', function (e) {
            $(this)[0].tmPoint = null;
        });
        $(this).on('touchcancel', function (e) {
            $(this)[0].tmPoint = null;
        });

        function _mobile(e) {
            if ($(this)[0].tmPoint == null) {
                return;
            }

            var targetTouches = e.targetTouches ? e.targetTouches : e.originalEvent.targetTouches;
            var scrollTop = $(this)[0].scrollTop,
                scrollHeight = $(this)[0].scrollHeight,
                height = $(this)[0].clientHeight;

            var point = {
                x: targetTouches[0].pageX,
                y: targetTouches[0].pageY
            };
            var de = $(this)[0].tmPoint.y - point.y;
            if (de < 0 && scrollTop <= 0) {
                e.stopPropagation();
                e.preventDefault();
            }

            if (de > 0 && scrollTop + height >= scrollHeight) {
                e.stopPropagation();
                e.preventDefault();
            }
        }
    };
})(jQuery);

$(function(){  

    //禁止元素滚动时父元素同步滚动
    $(".right_div2").uniqueScroll();
    
    //监听元素滚动时同步滚动其他元素
    $(".right_div2").on("scroll", function (e) {
        var right_div2_top = $(this)[0].scrollTop;
        var right_div2_left = $(this)[0].scrollLeft;
        $(this).parent().siblings(".left_div").find(".left_div2")[0].scrollTop = right_div2_top;
        $(this).parent().find(".right_div1")[0].scrollLeft = right_div2_left;
    })

    //动态设置滚动元素容器宽度
    setResizeWidth();
    
    //动态渲染相关元素内容
    var leftTable2 = $(".left_table2");
    var rightTable2 = $(".right_table2");
    var str="<select><option>请选择</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>";
    for (var i = 0; i < 24; i++) {
        for (var j = 0; j < leftTable2.length; j++) {

            leftTable2.eq(j).append("<tr><th>我是首列</th></tr>");

            rightTable2.eq(j).append("<tr><td>" + str + "</td><td>" + str + "</td><td>" + str +
                "</td><td>" + str +
                "</td><td>" + str + "</td><td>" + str + "</td><td>" + str + "</td><td>" + str + "</td><td>" + str +
                "</td><td>" + str + "</td></tr>");
        }
    }
    
    //页面宽度变化时动态设置滚动元素宽度
    window.onresize = function () {
        setResizeWidth();
    }

    //设置右边div宽度
    function setResizeWidth() {
        var rightDiv = $(".right_div");
        for (var i = 0; i < rightDiv.length; i++) {
            // rightDiv[i].style.width = "" + $(".matrix")[0].clientWidth - 100 + "px";
            rightDiv[i].style.width = 700 + "px";
        }
    }
    
    //设置元素自定义滚动条
    $(".right_div2").niceScroll({
        cursorcolor: "#999", //#CC0071 光标颜色
        cursoropacitymax: 1, //改变不透明度非常光标处于活动状态（scrollabar“可见”状态），范围从1到0
        touchbehavior: false, //使光标拖动滚动像在台式电脑触摸设备
        cursorwidth: "5px", //像素光标的宽度
        cursorborder: "0", // 	游标边框css定义
        cursorborderradius: "5px", //以像素为光标边界半径
        autohidemode: false, //是否隐藏滚动条
        scrollspeed: 10, // 滚动速度
        mousescrollstep: 9 * 4, // 鼠标滚动的滚动速度（像素)
        railoffset:'top'
    });

});