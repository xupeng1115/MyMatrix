
$(function () {
    
    //初始化页面
    (function(){
        //动态渲染列表内容
        var leftTable2 = $(".left_table2");
        var rightTable2 = $(".right_table2");
        var str = "<select><option>请选择</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>";
        // var str = 1;
        var str2 = "我是首列我是首列我是首列我是首列我是首列";
        var str3 = "我是首列我是首列我是首列我是首列我是首列我是首列我是首列我是首列我是首列我是首列";
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < leftTable2.length; j++) {
                if (i === 3) {
                    leftTable2.eq(j).append("<tr class='left_tr'><th>" + str2 + "</th></tr>");
                } else if (i === 6) {
                    leftTable2.eq(j).append("<tr class='left_tr'><th>" + str3 + "</th></tr>");
                } else {
                    leftTable2.eq(j).append("<tr class='left_tr'><th>我是首列</th></tr>");
                }

                // rightTable2.eq(j).append("<tr class='right_tr'>"+
                //                         "<td>" + str + "</td>"+
                //                         "<td>" + str + "</td>"+
                //                         "<td>" + str +"</td>"+
                //                         "<td>" + str +"</td>"+
                //                         "<td>" + str + "</td>"+
                //                         "<td>" + str + "</td>"+
                //                         "<td>" + str +"</td>"+
                //                         "<td>" + str +"</td>"+
                //                         "<td>" + str + "</td>"+
                //                         "<td>" + str + "</td>"+
                //                         "</tr>");
                rightTable2.eq(j).append("<tr class='right_tr'>"+
                                        "<td>" + str + "</td>"+
                                        "<td>" + str + "</td>"+
                                        "<td>" + str +"</td>"+
                                        "<td>" + str +"</td>"+
                                        "</tr>");
            }
        }
    }());
    
    //初始化列表后重置列表样式
    (function () {

        //重置第二行table使所有tr高度一致
        var rightTr = $(".right_tr");
        var leftTr = $(".left_tr");
        for (var i = 0; i < leftTr.length; i++) {
            var oHeight = leftTr.eq(i).height();
            rightTr.eq(i).css("height", oHeight + 'px');
        }

        //重置第一行所有table高度一致
        var rightTable1 = $(".right_table1");
        for (var i = 0; i < rightTable1.length; i++) {
            var oHeight = rightTable1.eq(i).height();
            var oLeftTable = rightTable1.eq(i).parents(".right_div").siblings(".left_div").find(".left_table1");
            oLeftTable.css("height", oHeight + 'px');
        }

        // //重置右侧table宽度一致
        // for (var i = 0; i < rightTable1.length; i++) {
        //     var oWidth = rightTable1.eq(i).width();
        //     var oRightTable = rightTable1.eq(i).parents(".right_div").find(".right_table1");
        //     oRightTable.css("width", oWidth + 'px');
        // }
        
        //重置基本样式
        setResizeWidth();
    }())

    //监听窗口变化
    window.onresize = function () {
        setResizeWidth();
    }

    //窗口变化时重置基本样式
    function setResizeWidth() {
        //动态设置其他样式
        var oBody = $("body").width();
        if (oBody <= 1000) {
            $(".answer-container").css("width", (oBody-40)+"px");
            $(".list-container").css("padding", "0");

            if (oBody <= 500) {
                $(".progress").css({
                    "width": "100%",
                    "padding": "0 10px"
                });
                $(".answer-header").css({
                    "padding": "6px 10px"
                });
                $(".title").css({
                    "padding": "40px 10px 0 10px"
                });
                $(".logo").css({
                    "right": "50%",
                    "marginRight": "-59px"
                });
                $(".bottom").css({
                    "width": "100px"
                });
            } else {
                $(".progress").css({
                    "width": "400px",
                    "padding": "0"
                });
                $(".answer-header").css({
                    "padding": "6px0"
                });
                $(".title").css({
                    "paddingTop": "0"
                });
                $(".logo").css({
                    "right": "0",
                    "marginRight": "0"
                });
                $(".bottom").css({
                    "width": "220px"
                });
            }
        } else {
            $(".answer-container").css("width", "1000px");
            $(".list-container").css("padding", "0 80px");
        }

        //动态计算右侧容器宽度使浮动不错位
        var rightDiv = $(".right_div");
        var matrixWidth = $(".matrix").width();
        var oRightTable2=$(".right_table2");
        for (var i = 0; i < rightDiv.length; i++) {
            if(oRightTable2.eq(i).width()<=(matrixWidth-68)){
                rightDiv[i].style.width = (oRightTable2.eq(i).width()) + "px";
            }else{
                rightDiv[i].style.width = (matrixWidth-68) + "px";
            }
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
        scrollspeed: 4, // 滚动速度
        hwacceleration: true, // 激活硬件加速
        mousescrollstep: 60, // 鼠标滚轮的滚动速度 (像素)
        mousescrollstep: 9 * 8 // 鼠标滚动的滚动速度（像素)
    });

    //子元素滚动时禁止父元素滚动
    $(".right_div2").on("touchmove", function (e) {
        e.preventDefault();
    })

    //监听元素滚动时同步滚动其他元素
    $(".right_div2").on("scroll", function (e) {
        var right_div2_top = $(this)[0].scrollTop;
        var right_div2_left = $(this)[0].scrollLeft;
        $(this).parent().siblings(".left_div").find(".left_div2")[0].scrollTop = right_div2_top;
        $(this).parent().find(".right_div1")[0].scrollLeft = right_div2_left;
    })

});